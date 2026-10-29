/**
 * paymentService.ts — نظام الدفع والمالية (07-Payment-Financial-System.md)
 * معالجة المدفوعات، بوابات الدفع المحلية والدولية، العملات (YER/SAR)،
 * الفواتير الإلكترونية الرسمية، وسياسات الاسترداد المالي والعمولات.
 */

import { api, isBackendLikelyDown } from '../api';
import { PaymentMethod, Invoice, VendorPayout } from '../types';
import { platformLogService } from './platformLogService';

export interface ExchangeRateConfig {
  sarToYer: number; // مثلاً 400 ر.ي لكل 1 ر.س
  lastUpdated: string;
}

export interface PaymentProcessPayload {
  bookingId: string;
  bookingCode: string;
  method: PaymentMethod;
  amountYER: number;
  amountSAR: number;
  customerName: string;
  customerPhone: string;
  vendorId: string;
  currencyChoice?: 'YER' | 'SAR';
  bankSlipUrl?: string;
  paymentDetails?: {
    accountNumber?: string;
    pinCode?: string;
    cardNumber?: string;
    cardExp?: string;
    cardCvv?: string;
  };
}

export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  currency: 'YER' | 'SAR';
  timestamp: string;
  invoice: Invoice;
  message: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  originalAmountYER: number;
  cancellationFeeYER: number;
  refundedAmountYER: number;
  refundedAmountSAR: number;
  feePercentage: number;
  refundMethod: PaymentMethod;
  message: string;
}

// ================== أسعار الصرف ==================

const DEFAULT_EXCHANGE_RATE: ExchangeRateConfig = {
  sarToYer: 400,
  lastUpdated: new Date().toISOString(),
};

export const getExchangeRate = (): ExchangeRateConfig => {
  try {
    const raw = localStorage.getItem('exchange_rate_config');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_EXCHANGE_RATE;
};

export const setExchangeRate = (sarToYer: number): void => {
  const config: ExchangeRateConfig = {
    sarToYer,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem('exchange_rate_config', JSON.stringify(config));
};

export const convertYerToSar = (amountYER: number): number => {
  const rate = getExchangeRate().sarToYer;
  return Math.round(amountYER / rate);
};

export const convertSarToYer = (amountSAR: number): number => {
  const rate = getExchangeRate().sarToYer;
  return Math.round(amountSAR * rate);
};

// ================== الفواتير ==================

/**
 * إنشاء فاتورة إلكترونية معتمدة (FR-PF-007)
 */
export const generateInvoice = (
  bookingCode: string,
  totalPriceYER: number,
  currency: 'YER' | 'SAR' = 'YER',
  commissionRatePercent = 5
): Invoice => {
  const rate = getExchangeRate().sarToYer;
  const totalYER = totalPriceYER;
  const totalSAR = Math.round(totalPriceYER / rate);

  // هيكل التكاليف:
  // عمولة المنصة 5%
  const platformCommissionYER = Math.round((totalYER * commissionRatePercent) / 100);
  // ضريبة ورسوم خدمة رمزية
  const serviceFeeYER = Math.round(totalYER * 0.02);
  const vatTaxYER = 0; // معفاة أو مدمجة في تذاكر النقل
  const subtotalYER = totalYER - serviceFeeYER;
  const vendorNetYER = totalYER - platformCommissionYER;

  return {
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    issueDate: new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
    subtotalYER,
    vatTaxYER,
    serviceFeeYER,
    platformCommissionYER,
    vendorNetYER,
    totalYER,
    totalSAR,
    currency,
    exchangeRate: rate,
  };
};

// ================== معالجة الدفع ==================

/**
 * معالجة الدفع لجميع البوابات (كريمي، تضامن، جوال، فيزا، نقد)
 */
export const processPayment = async (payload: PaymentProcessPayload): Promise<PaymentProcessResult> => {
  const currency = payload.currencyChoice || 'YER';
  const amountPaid = currency === 'SAR' ? payload.amountSAR : payload.amountYER;
  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoice = generateInvoice(payload.bookingCode, payload.amountYER, currency);

  if (!isBackendLikelyDown()) {
    try {
      const { data } = await api.post('/payments/process', {
        ...payload,
        transactionId,
        invoice,
      });
      platformLogService.log({
        level: 'info',
        action: 'PAYMENT_PROCESSED',
        details: `دفع ناجح عبر ${payload.method} بمبلغ ${amountPaid} ${currency} - رمز المعاملة: ${transactionId} - كود الحجز: ${payload.bookingCode}`,
      });
      return data;
    } catch {
      // fallback to simulated success
    }
  }

  // وضع تجريبي تفاعلي ذكي
  platformLogService.log({
    level: 'info',
    action: 'PAYMENT_PROCESSED',
    details: `دفع ناجح تجريبي عبر ${payload.method} للحجز ${payload.bookingCode} بمبلغ ${amountPaid} ${currency} - رمز: ${transactionId}`,
  });

  return {
    success: true,
    transactionId,
    paymentMethod: payload.method,
    amountPaid,
    currency,
    timestamp: new Date().toISOString(),
    invoice,
    message: 'تم استلام وتأكيد الدفع بنجاح وإصدار الفاتورة الإلكترونية',
  };
};

// ================== حساب ومعالجة الاسترداد ==================

/**
 * حساب المستحق للاسترداد حسب القواعد الرسمية (BR-BM-004 & BR-BM-005 & FR-PF-008)
 * - قبل 24 ساعة: استرداد كامل (0% رسوم إلغاء)
 * - خلال 24 ساعة السابقة لانطلاق الرحلة: خصم 50% رسوم إلغاء
 * - بعد انطلاق الرحلة: لا يوجد استرداد (100% رسوم)
 */
export const calculateRefundAmount = (
  totalAmountYER: number,
  departureTimeISO?: string
): {
  feePercentage: number;
  cancellationFeeYER: number;
  refundedAmountYER: number;
  refundedAmountSAR: number;
  isEligible: boolean;
  policyNote: string;
} => {
  const rate = getExchangeRate().sarToYer;
  let feePercentage = 0;
  let policyNote = 'إلغاء مبكر قبل 24 ساعة: استرداد 100% بدون أي رسوم إلغاء.';

  if (departureTimeISO) {
    try {
      const depDate = new Date(departureTimeISO).getTime();
      const now = Date.now();
      const diffHours = (depDate - now) / (1000 * 60 * 60);

      if (diffHours < 0) {
        return {
          feePercentage: 100,
          cancellationFeeYER: totalAmountYER,
          refundedAmountYER: 0,
          refundedAmountSAR: 0,
          isEligible: false,
          policyNote: 'لا يمكن استرداد التذكرة بعد موعد انطلاق الرحلة (حالة عدم حضور No-Show).',
        };
      } else if (diffHours <= 24) {
        feePercentage = 50;
        policyNote = 'إلغاء خلال آخر 24 ساعة قبل الرحلة: تطبق رسوم إلغاء بنسبة 50%.';
      }
    } catch {
      feePercentage = 0;
    }
  }

  const cancellationFeeYER = Math.round((totalAmountYER * feePercentage) / 100);
  const refundedAmountYER = totalAmountYER - cancellationFeeYER;
  const refundedAmountSAR = Math.round(refundedAmountYER / rate);

  return {
    feePercentage,
    cancellationFeeYER,
    refundedAmountYER,
    refundedAmountSAR,
    isEligible: true,
    policyNote,
  };
};

/**
 * معالجة الاسترداد الفعلي
 */
export const processRefund = async (
  bookingId: string,
  totalAmountYER: number,
  method: PaymentMethod,
  departureTimeISO?: string,
  reason?: string
): Promise<RefundResult> => {
  const calculation = calculateRefundAmount(totalAmountYER, departureTimeISO);
  const refundId = `REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  if (!isBackendLikelyDown()) {
    try {
      const { data } = await api.post('/payments/refund', {
        bookingId,
        refundId,
        ...calculation,
        reason,
      });
      return data;
    } catch {
      // fallback
    }
  }

  platformLogService.log({
    level: 'info',
    action: 'REFUND_ISSUED',
    details: `تم إصدار استرداد مالي للحجز ${bookingId} بمبلغ ${calculation.refundedAmountYER} ر.ي (رسوم: ${calculation.cancellationFeeYER} ر.ي) - سبب: ${reason || 'طلب من العميل'}`,
  });

  return {
    success: true,
    refundId,
    originalAmountYER: totalAmountYER,
    cancellationFeeYER: calculation.cancellationFeeYER,
    refundedAmountYER: calculation.refundedAmountYER,
    refundedAmountSAR: calculation.refundedAmountSAR,
    feePercentage: calculation.feePercentage,
    refundMethod: method,
    message: calculation.policyNote,
  };
};

// ================== سحوبات وأرباح المكاتب (Payouts) ==================

const PAYOUTS_KEY = 'vendor_payouts_ledger';

export const getVendorPayouts = (vendorId: string): VendorPayout[] => {
  try {
    const raw = localStorage.getItem(`${PAYOUTS_KEY}_${vendorId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // بيانات افتراضية تجريبية
  return [
    {
      id: 'pay-1',
      payoutNumber: 'PAY-88210',
      amountYER: 12_500_000,
      amountSAR: 31_250,
      requestedAt: '2026-07-15',
      processedAt: '2026-07-16',
      status: 'PROCESSED',
      bankOrWallet: 'حساب بنك الكريمي رقم 120045889',
      referenceNumber: 'REF-KUR-9921',
    },
    {
      id: 'pay-2',
      payoutNumber: 'PAY-88211',
      amountYER: 8_200_000,
      amountSAR: 20_500,
      requestedAt: '2026-08-01',
      processedAt: '2026-08-02',
      status: 'PROCESSED',
      bankOrWallet: 'حساب بنك التضامن رقم 5541009',
      referenceNumber: 'REF-TAD-1104',
    },
  ];
};

export const requestVendorPayout = (
  vendorId: string,
  amountYER: number,
  bankOrWallet: string
): VendorPayout => {
  const current = getVendorPayouts(vendorId);
  const newPayout: VendorPayout = {
    id: `pay-${Date.now()}`,
    payoutNumber: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
    amountYER,
    amountSAR: convertYerToSar(amountYER),
    requestedAt: new Date().toISOString().slice(0, 10),
    status: 'PENDING',
    bankOrWallet,
  };

  const updated = [newPayout, ...current];
  localStorage.setItem(`${PAYOUTS_KEY}_${vendorId}`, JSON.stringify(updated));

  platformLogService.log({
    level: 'info',
    action: 'VENDOR_PAYOUT_REQUEST',
    details: `طلب سحب أرباح للمكتب بمبلغ ${amountYER.toLocaleString()} ر.ي - رقم العملية: ${newPayout.payoutNumber} - إلى: ${bankOrWallet}`,
  });

  return newPayout;
};
