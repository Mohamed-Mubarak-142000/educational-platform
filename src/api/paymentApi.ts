import api from "./axiosConfig";

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "voided"
  | "refunded"
  | "expired";

export type Payment = {
  _id: string;
  studentId?: { _id: string; name?: string; email?: string } | string;
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
  // "liveLesson" pays for a single live-lesson request, not a subject/unit
  // purchase.
  subscriptionType: "subject" | "unit" | "liveLesson";
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: "InstaPay" | "VodafoneCash" | "Fawry";
  subscriptionId?: string;
  createdAt?: string;
  // Present once the payment has an associated TeacherEarning record
  // (i.e. it was approved) — the platform's cut and the teacher's net.
  platformFeeCents?: number;
  netEarningCents?: number;
};

export type PaymentHistoryResponse = {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
};

export type PaymentStatusResponse = {
  _id: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  subscriptionId?: string;
  createdAt?: string;
};

export type AdminAnalyticsResponse = {
  totalRevenueCents: number;
  totalRevenueEGP: number;
  revenueThisMonthCents: number;
  revenueThisMonthEGP: number;
  revenueThisYearCents: number;
  revenueThisYearEGP: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
  activeSubscriptions: number;
  recentPayments: Payment[];
};

/**
 * Price quote for a subject/unit purchase (used by the manual-transfer flow).
 */
export type SubscriptionQuote = { amountEGP: number };

export const getSubscriptionQuote = async (params: {
  teacherId: string;
  subjectId: string;
  gradeId: string;
  unitId?: string;
  subscriptionType: "subject" | "unit";
}): Promise<SubscriptionQuote> => {
  const response = await api.get<SubscriptionQuote>("/payments/quote", { params });
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

export type MyPaymentHistoryParams = {
  status?: PaymentStatus;
  subscriptionType?: Payment["subscriptionType"];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Student's payment history (paginated).
 */
export const getMyPaymentHistory = async (
  page = 1,
  params?: MyPaymentHistoryParams,
): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>(
    "/payments/my-history",
    {
      params: {
        page,
        limit: 10,
        status: params?.status,
        subscriptionType: params?.subscriptionType,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    },
  );
  return response.data;
};

export type AdminAnalyticsParams = {
  search?: string;
  status?: PaymentStatus;
  subscriptionType?: Payment["subscriptionType"];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Admin analytics dashboard data. `params` only affect the `recentPayments`
 * list — the aggregate stat totals always reflect the whole platform.
 */
export const getAdminPaymentsAnalytics = async (
  params?: AdminAnalyticsParams,
): Promise<AdminAnalyticsResponse> => {
  const response = await api.get<AdminAnalyticsResponse>(
    "/payments/admin/analytics",
    {
      params: {
        search: params?.search || undefined,
        status: params?.status,
        subscriptionType: params?.subscriptionType,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    },
  );
  return response.data;
};

/**
 * Admin refund a payment. Internal bookkeeping only — there is no
 * electronic gateway to call, so the admin must transfer the money back to
 * the student manually via InstaPay/Vodafone Cash/Fawry.
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
