/**
 * useSessionTimeout.ts — إدارة مهلة خمول الجلسة (المتطلبات FR-CP-002-02 و FR-UI-005-02)
 * يراقب نشاط المستخدم (النقرات، لوحة المفاتيح، التمرير)، ويُنهي الجلسة تلقائياً
 * بعد 30 دقيقة من الخمول مع تحذير قبل الانتهاء بدقيقتين.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { platformConfigService } from '../services/platformConfigService';
import { platformLogService } from '../services/platformLogService';

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowWarning(false);
      return;
    }

    const config = platformConfigService.getConfig();
    const timeoutMs = (config.sessionTimeoutMinutes || 30) * 60 * 1000;
    const warningMs = Math.max(timeoutMs - 120_000, 30_000); // قبل دقيقتين

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    timerRef.current = setInterval(() => {
      const inactiveFor = Date.now() - lastActivityRef.current;

      if (inactiveFor >= timeoutMs) {
        // انتهت الجلسة بالكامل
        platformLogService.log({
          level: 'security',
          action: 'SESSION_AUTO_EXPIRED',
          details: `تم إنهاء جلسة المستخدم ${user.fullName} تلقائياً بسبب الخمول لمدة ${config.sessionTimeoutMinutes} دقيقة`,
          userId: user.id,
          userRole: user.role,
        });

        if (timerRef.current) clearInterval(timerRef.current);
        logout();
      } else if (inactiveFor >= warningMs) {
        // إظهار تنبيه اقتراب الانتهاء
        setShowWarning(true);
        const rem = Math.max(0, Math.round((timeoutMs - inactiveFor) / 1000));
        setRemainingSeconds(rem);
      } else {
        if (showWarning) setShowWarning(false);
      }
    }, 2000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, logout, showWarning]);

  return {
    showWarning,
    remainingSeconds,
    stayLoggedIn: resetActivity,
  };
};
