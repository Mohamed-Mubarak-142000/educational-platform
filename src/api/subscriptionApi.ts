import api from "./axiosConfig";

export type SubscriptionType = "subject" | "unit";
export type SubscriptionStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "revoked";

export type Subscription = {
  _id: string;
  studentId: string | { _id: string; name: string };
  teacherId: string | { _id: string; name: string; profileImage?: string };
  subjectId:
    | string
    | {
        _id: string;
        name: string;
        nameAr?: string;
        icon?: string;
        color?: string;
      };
  gradeId: string | { _id: string; name: string; nameAr?: string };
  unitId?: string | { _id: string; title: string };
  type: SubscriptionType;
  status: SubscriptionStatus;
  plan?: string;
  planDays?: number;
  expiresAt?: string;
  startsAt?: string;
  createdAt?: string;
};

export const getMySubscriptions = async (filters?: {
  subjectId?: string;
  teacherId?: string;
  gradeId?: string;
}): Promise<Subscription[]> =>
  (await api.get<Subscription[]>("/subscriptions/mine", { params: filters }))
    .data;
