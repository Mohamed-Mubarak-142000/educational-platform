import api from "./axiosConfig";
import type { PayoutMethod, TeacherPayout } from "./teacherEarningsApi";

export type PayoutsOverview = {
  totalPlatformFeeCents: number;
  totalOwedCents: number;
  totalPaidOutCents: number;
  teachersWithBalanceCount: number;
};

export type TeacherBalance = {
  teacherId: string;
  name: string;
  email: string;
  totalEarnedCents: number;
  availableCents: number;
  totalPaidOutCents: number;
  lastPayoutAt: string | null;
};

export type TeacherBalancesParams = {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PayoutHistoryParams = {
  search?: string;
  method?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CreatePayoutPayload = {
  teacherId: string;
  method: PayoutMethod;
  reference?: string;
};

export const getPayoutsOverview = async (): Promise<PayoutsOverview> =>
  (await api.get<PayoutsOverview>("/teacher-payouts/overview")).data;

export const getTeacherBalances = async (
  params?: TeacherBalancesParams,
): Promise<TeacherBalance[]> =>
  (
    await api.get<TeacherBalance[]>("/teacher-payouts/balances", {
      params: {
        search: params?.search || undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })
  ).data;

export const getPayoutHistory = async (params?: PayoutHistoryParams): Promise<TeacherPayout[]> =>
  (
    await api.get<TeacherPayout[]>("/teacher-payouts", {
      params: {
        search: params?.search || undefined,
        method: params?.method?.length ? params.method.join(",") : undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })
  ).data;

export const createPayout = async (payload: CreatePayoutPayload): Promise<TeacherPayout> =>
  (await api.post<TeacherPayout>("/teacher-payouts", payload)).data;
