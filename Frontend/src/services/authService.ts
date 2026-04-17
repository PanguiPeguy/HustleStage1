import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  async register(email: string, password: string, nomEntreprise?: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', { email, password, nomEntreprise });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
};
