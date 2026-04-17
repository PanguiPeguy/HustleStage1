import api from './api';
import type { Client, ClientRequest } from '../types';

export const clientService = {
  async getAll(search?: string): Promise<Client[]> {
    const { data } = await api.get('/clients', { params: search ? { search } : {} });
    return data;
  },

  async getById(id: number): Promise<Client> {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },

  async create(request: ClientRequest): Promise<Client> {
    const { data } = await api.post('/clients', request);
    return data;
  },

  async update(id: number, request: ClientRequest): Promise<Client> {
    const { data } = await api.put(`/clients/${id}`, request);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
