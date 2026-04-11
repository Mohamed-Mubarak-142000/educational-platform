import api from './axiosConfig';

export type TeacherDirectoryItem = {
  _id: string;
  name?: string;
  subject?: string;
  stageId?: string | { _id?: string; name?: string };
  profileImage?: string;
};

export const getTeachersDirectory = async (): Promise<TeacherDirectoryItem[]> => {
  const response = await api.get<TeacherDirectoryItem[]>('/users/teachers-directory');
  return response.data;
};

export const getTeacherDirectoryById = async (id: string): Promise<TeacherDirectoryItem> => {
  const response = await api.get<TeacherDirectoryItem>(`/users/teachers-directory/${id}`);
  return response.data;
};
