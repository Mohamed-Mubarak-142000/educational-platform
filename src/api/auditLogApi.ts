import api from "./axiosConfig";

export type AuditLogEntry = {
  _id: string;
  actorId: string;
  actorName?: string;
  actorRole: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
};

export type AuditLogListResponse = {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
};

export type AuditLogParams = {
  page?: number;
  limit?: number;
  path?: string;
};

export const getAuditLogs = async (params?: AuditLogParams): Promise<AuditLogListResponse> => {
  const response = await api.get<AuditLogListResponse>("/audit-logs", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
      path: params?.path || undefined,
    },
  });
  return response.data;
};
