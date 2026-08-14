import api from "./axiosConfig";
import type { ManualPaymentMethod } from "@/lib/paymentMethods";

export type ManualPaymentPurpose = "subject" | "unit" | "liveLesson";
export type ManualPaymentStatus = "Pending" | "Approved" | "Rejected";

export type ManualPaymentRequest = {
  _id: string;
  studentId: { _id: string; name?: string; email?: string } | string;
  teacherId: { _id: string; name?: string } | string;
  subjectId?: { _id: string; name?: string; nameAr?: string; icon?: string } | string;
  gradeId?: string;
  unitId?: string;
  liveLessonRequestId?: string;
  purpose: ManualPaymentPurpose;
  method: ManualPaymentMethod;
  amountEGP: number;
  referenceCode: string;
  proofUrl: string;
  senderNote?: string;
  status: ManualPaymentStatus;
  rejectionReason?: string;
  createdAt: string;
};

export type ManualPaymentUploadResponse = { url: string };

export const uploadManualPaymentProof = async (
  file: File,
): Promise<ManualPaymentUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<ManualPaymentUploadResponse>(
    "/manual-payments/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

export type CreateManualPaymentPayload = {
  method: ManualPaymentMethod;
  proofUrl: string;
  senderNote?: string;
} & (
  | { liveLessonRequestId: string }
  | {
      teacherId: string;
      subjectId: string;
      gradeId: string;
      unitId?: string;
      subscriptionType: "subject" | "unit";
    }
);

export const createManualPaymentRequest = async (
  payload: CreateManualPaymentPayload,
): Promise<ManualPaymentRequest> => {
  const response = await api.post<ManualPaymentRequest>("/manual-payments", payload);
  return response.data;
};

export const getMyManualPaymentRequests = async (): Promise<ManualPaymentRequest[]> => {
  const response = await api.get<ManualPaymentRequest[]>("/manual-payments/mine");
  return response.data;
};

export type ManualPaymentRequestListParams = {
  status?: ManualPaymentStatus;
  search?: string;
  method?: string[];
  purpose?: ManualPaymentPurpose;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getManualPaymentRequests = async (
  params?: ManualPaymentRequestListParams,
): Promise<ManualPaymentRequest[]> => {
  const response = await api.get<ManualPaymentRequest[]>("/manual-payments", {
    params: {
      status: params?.status,
      search: params?.search || undefined,
      method: params?.method?.length ? params.method.join(",") : undefined,
      purpose: params?.purpose,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  });
  return response.data;
};

export const approveManualPaymentRequest = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/manual-payments/${id}/approve`);
  return response.data;
};

export const rejectManualPaymentRequest = async (
  id: string,
  reason?: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/manual-payments/${id}/reject`, {
    reason,
  });
  return response.data;
};
