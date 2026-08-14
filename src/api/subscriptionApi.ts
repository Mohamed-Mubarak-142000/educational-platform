import api from "./axiosConfig";

export type SubscriptionType = "subject" | "unit";
export type SubscriptionStatus = "active" | "revoked";

// A subscription is a one-time purchase that grants lifetime access — there
// is no plan/renewal concept. `expiresAt` is kept only because the backend
// still sets it to a sentinel far-future date for internal query reasons.
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
