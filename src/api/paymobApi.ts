import api from "./axiosConfig";

export type SubscriptionPlan = "Monthly" | "Quarterly" | "Yearly";
export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "voided"
  | "refunded"
  | "expired";

export type CheckoutIntentionPayload = {
  teacherId: string;
  subjectId: string;
  gradeId: string;
  unitId?: string;
  subscriptionType: "subject" | "unit";
  plan: SubscriptionPlan;
};

export type CheckoutIntentionResponse = {
  paymentId: string;
  iframeUrl: string;
  amountEGP: number;
  plan: SubscriptionPlan;
  planDays: number;
  retryRequired?: boolean;
  message?: string;
};

export type PaymobPayment = {
  _id: string;
  teacherId?: { _id: string; name?: string; profileImage?: string } | string;
  subjectId?:
    | {
        _id: string;
        name?: string;
        nameAr?: string;
        icon?: string;
        color?: string;
      }
    | string;
  unitId?: { _id: string; title?: string; titleAr?: string } | string;
  subscriptionType: "subject" | "unit";
  plan: SubscriptionPlan;
  planDays: number;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymobTransactionId?: string;
  subscriptionId?: string;
  createdAt?: string;
};

export type PaymentHistoryResponse = {
  payments: PaymobPayment[];
  total: number;
  page: number;
  totalPages: number;
};

export type PaymentStatusResponse = {
  _id: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  plan: SubscriptionPlan;
  planDays: number;
  subscriptionId?: string;
  paymobOrderId?: string;
  paymobTransactionId?: string;
  createdAt?: string;
};

export type AdminAnalyticsResponse = {
  totalRevenueCents: number;
  totalRevenueEGP: number;
  mrrCents: number;
  mrrEGP: number;
  arrCents: number;
  arrEGP: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
  activeSubscriptions: number;
  expiringSoon: number;
  recentPayments: PaymobPayment[];
};

/**
 * Initiate a Paymob checkout and get the iframe URL.
 */
export const createCheckoutIntention = async (
  data: CheckoutIntentionPayload,
): Promise<CheckoutIntentionResponse> => {
  const response = await api.post<CheckoutIntentionResponse>(
    "/payments/create-intention",
    data,
  );
  return response.data;
};

/**
 * Poll a payment's status by ID.
 */
export const getPaymentStatus = async (
  paymentId: string,
): Promise<PaymentStatusResponse> => {
  const response = await api.get<PaymentStatusResponse>(
    `/payments/status/${paymentId}`,
  );
  return response.data;
};

/**
 * Student's payment history (paginated).
 */
export const getMyPaymentHistory = async (
  page = 1,
): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>(
    "/payments/my-history",
    {
      params: { page, limit: 10 },
    },
  );
  return response.data;
};

/**
 * Admin analytics dashboard data.
 */
export const getAdminPaymentsAnalytics =
  async (): Promise<AdminAnalyticsResponse> => {
    const response = await api.get<AdminAnalyticsResponse>(
      "/payments/admin/analytics",
    );
    return response.data;
  };

/**
 * Admin refund a payment.
 */
export const refundPayment = async (
  paymentId: string,
  reason?: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/payments/${paymentId}/refund`,
    { reason },
  );
  return response.data;
};
