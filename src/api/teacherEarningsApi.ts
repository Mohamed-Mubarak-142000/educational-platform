import api from "./axiosConfig";

export type TeacherEarningStatus = "available" | "paid_out" | "clawed_back";
export type PayoutMethod = "InstaPay" | "VodafoneCash" | "BankTransfer" | "Other";

export type TeacherEarning = {
  _id: string;
  paymentId: string;
  teacherId: string;
  studentId: { _id: string; name?: string } | string;
  subjectId?: { _id: string; name?: string; nameAr?: string; icon?: string } | string;
  subscriptionType: "subject" | "unit" | "liveLesson";
  grossAmountCents: number;
  commissionRateBps: number;
  platformFeeCents: number;
  netEarningCents: number;
  status: TeacherEarningStatus;
  payoutId?: string;
  clawedBackAt?: string;
  clawedBackReason?: string;
  createdAt: string;
};

export type TeacherEarningsSummary = {
  totalGrossCents: number;
  totalPlatformFeeCents: number;
  totalNetCents: number;
  availableCents: number;
  paidOutCents: number;
};

export type TeacherPayout = {
  _id: string;
  teacherId: { _id: string; name?: string } | string;
  amountCents: number;
  method: PayoutMethod;
  reference?: string;
  earningsCount: number;
  createdBy: { _id: string; name?: string } | string;
  createdAt: string;
};

export type MyEarningsListParams = {
  status?: TeacherEarningStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getMyEarningsSummary = async (): Promise<TeacherEarningsSummary> =>
  (await api.get<TeacherEarningsSummary>("/teacher-earnings/mine/summary")).data;

export const getMyEarnings = async (params?: MyEarningsListParams): Promise<TeacherEarning[]> =>
  (
    await api.get<TeacherEarning[]>("/teacher-earnings/mine", {
      params: {
        status: params?.status,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })
  ).data;

export const getMyPayouts = async (): Promise<TeacherPayout[]> =>
  (await api.get<TeacherPayout[]>("/teacher-earnings/mine/payouts")).data;
