import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, login, register, verifyOTP, updateProfile } from '../api/authApi';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  loginMutation: any;
  registerMutation: any;
  verifyMutation: any;
  updateProfileMutation: any;
  logout: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, refetch } = useQuery({
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
    <AuthContext.Provider value={{ user, isLoading, loginMutation, registerMutation, verifyMutation, updateProfileMutation, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
