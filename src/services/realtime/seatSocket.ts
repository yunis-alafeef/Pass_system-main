/**
 * seatSocket.ts — عميل التحديثات اللحظية للمقاعد (المهمة 4.4)
 * يبني اتصال Socket.io واحد (lazy) مع الخلفية ويشترك بغرفة الرحلة،
 * ويعيد دالة إلغاء اشتراك نظيفة. الاتصال آمن تماماً عندما تكون الخلفية غير متاحة.
 * الحدث المتوقع من الخلفية (matches SeatsGateway.broadcastSeatUpdate):
 *   socket.emit('join-trip', tripId)
 *   socket.on('seat-update', { tripId, seatId, status })
 */

import { io, Socket } from 'socket.io-client';
import { SeatStatus } from '../../types';
import { WS_BASE_URL } from '../../api';

export interface SeatUpdateEvent {
  tripId: string;
  seatId: string;
  status: string; // AVAILABLE | HELD | BOOKED | DISABLED
}

export type SeatUpdateHandler = (event: SeatUpdateEvent) => void;

let socket: Socket | null = null;
let refCount = 0;

/** تحويل حالة المقعد القادمة من الخلفية إلى حالة الواجهة */
const mapStatus = (raw: string): SeatStatus => {
  switch (String(raw).toUpperCase()) {
    case 'AVAILABLE':
      return 'available';
    case 'HELD':
    case 'BOOKED':
    case 'DISABLED':
      return 'booked';
    default:
      return 'booked';
  }
};

const ensureConnection = (): Socket | null => {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    socket = io(WS_BASE_URL || undefined, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
      autoConnect: false,
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
};

/**
 * الاشتراك في تحديثات مقاعد رحلة محددة
 * @returns دالة لإلغاء الاشتراك وتحرير الاتصال
 */
export const subscribeToSeatUpdates = (
  tripId: string,
  onUpdate: (seatId: string, status: SeatStatus) => void,
  onConnectionChange?: (connected: boolean) => void
): (() => void) => {
  const s = ensureConnection();
  if (!s) return () => undefined;

  const handleSeatUpdate = (event: SeatUpdateEvent) => {
    if (event && event.tripId === tripId && event.seatId) {
      onUpdate(event.seatId, mapStatus(event.status));
    }
  };
  const handleConnect = () => {
    s.emit('join-trip', tripId);
    onConnectionChange?.(true);
  };
  const handleDisconnect = () => onConnectionChange?.(false);
  const handleConnectError = () => onConnectionChange?.(false);

  s.on('seat-update', handleSeatUpdate);
  s.on('connect', handleConnect);
  s.on('disconnect', handleDisconnect);
  s.on('connect_error', handleConnectError);
  s.emit('join-trip', tripId);

  refCount += 1;

  return () => {
    refCount = Math.max(0, refCount - 1);
    s.off('seat-update', handleSeatUpdate);
    s.off('connect', handleConnect);
    s.off('disconnect', handleDisconnect);
    s.off('connect_error', handleConnectError);
    s.emit('leave-trip', tripId);

    // لا نحتاج الاتصال إذا لم يبقَ مشتركون
    if (refCount === 0 && s.connected) {
      s.disconnect();
    }
  };
};

/** حالة الاتصال الحالية (لعرض في الواجهة) */
export const isSeatSocketConnected = (): boolean => socket?.connected ?? false;
