import api from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
};

export const userService = {
  async getProfile() {
    const { data } = await api.get('/users/profile');
    return data;
  },

  async updateProfile(profile: any) {
    const { data } = await api.put('/users/profile', profile);
    return data;
  },

  async deleteProfile() {
    await api.delete('/users/profile');
  },
};
