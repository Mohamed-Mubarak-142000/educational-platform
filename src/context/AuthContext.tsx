import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  getProfile,
  login,
  register,
  verifyOTP,
  updateProfile,
  type AuthTokenResponse,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
  type VerifyOtpPayload,
} from '../api/authApi';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginMutation: UseMutationResult<AuthTokenResponse, Error, LoginPayload>;
  registerMutation: UseMutationResult<AuthTokenResponse, Error, RegisterPayload>;
  verifyMutation: UseMutationResult<AuthTokenResponse, Error, VerifyOtpPayload>;
  updateProfileMutation: UseMutationResult<AuthUser, Error, UpdateProfilePayload>;
  logout: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, refetch } = useQuery<AuthUser | null>({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('token');
      setToken('');
    }
  }, [isError]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      refetch();
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      refetch();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => { refetch(); },
  });

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    queryClient.removeQueries({ queryKey: ['profile'] });
    queryClient.setQueryData(['profile'], null);
  };

  const refreshProfile = () => {
    if (token) {
      refetch();
    }
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, loginMutation, registerMutation, verifyMutation, updateProfileMutation, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
