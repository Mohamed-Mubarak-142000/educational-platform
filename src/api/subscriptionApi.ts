import api from './axiosConfig';

export type SubscriptionType = 'subject' | 'unit';
export type SubscriptionRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export type SubscriptionRequest = {
  _id: string;
  studentId: string | { _id: string; name: string; email?: string; profileImage?: string };
  teacherId: string | { _id: string; name: string; profileImage?: string };
  subjectId: string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string };
  gradeId: string | { _id: string; name: string; nameAr?: string };
  unitId?: string | { _id: string; title: string };
  type: SubscriptionType;
  paymentMethod: 'Vodafone Cash' | 'InstaPay';
  paymentProofUrl: string;
  status: SubscriptionRequestStatus;
  rejectionReason?: string;
  createdAt?: string;
};

export type Subscription = {
  _id: string;
  studentId: string | { _id: string; name: string };
  teacherId: string | { _id: string; name: string; profileImage?: string };
  subjectId: string | { _id: string; name: string; nameAr?: string; icon?: string; color?: string };
  gradeId: string | { _id: string; name: string; nameAr?: string };
  unitId?: string | { _id: string; title: string };
  type: SubscriptionType;
  status: 'Approved' | 'Revoked';
  createdAt?: string;
};

export type CreateSubscriptionRequestPayload = {
  teacherId: string;
  subjectId: string;
  gradeId: string;
  unitId?: string;
  type: SubscriptionType;
  paymentMethod: 'Vodafone Cash' | 'InstaPay';
  paymentProofUrl: string;
};

export const createSubscriptionRequest = async (
  data: CreateSubscriptionRequestPayload
): Promise<SubscriptionRequest> =>
  (await api.post<SubscriptionRequest>('/subscriptions/requests', data)).data;

export const getMySubscriptionRequests = async (): Promise<SubscriptionRequest[]> =>
  (await api.get<SubscriptionRequest[]>('/subscriptions/requests/mine')).data;

export const getTeacherSubscriptionRequests = async (status = 'Pending'): Promise<SubscriptionRequest[]> =>
  (await api.get<SubscriptionRequest[]>('/subscriptions/requests/teacher', { params: { status } })).data;

export const approveSubscriptionRequest = async (id: string): Promise<{ request: SubscriptionRequest; subscription: Subscription }> =>
  (await api.post<{ request: SubscriptionRequest; subscription: Subscription }>(`/subscriptions/requests/${id}/approve`)).data;

export const rejectSubscriptionRequest = async (id: string, rejectionReason?: string): Promise<SubscriptionRequest> =>
  (await api.post<SubscriptionRequest>(`/subscriptions/requests/${id}/reject`, { rejectionReason })).data;

export const getMySubscriptions = async (filters?: {
  subjectId?: string;
  teacherId?: string;
  gradeId?: string;
}): Promise<Subscription[]> =>
  (await api.get<Subscription[]>('/subscriptions/mine', { params: filters })).data;
