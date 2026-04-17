import api from './api';
import type { Facture, FactureRequest } from '../types';

export const invoiceService = {
  async getAll(): Promise<Facture[]> {
    const { data } = await api.get('/invoices');
    return data;
  },

  async getById(id: number): Promise<Facture> {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },

  async create(request: FactureRequest): Promise<Facture> {
    const { data } = await api.post('/invoices', request);
    return data;
  },

  async update(id: number, request: Partial<FactureRequest>): Promise<Facture> {
    const { data } = await api.put(`/invoices/${id}`, request);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async markAsPaid(id: number): Promise<Facture> {
    const { data } = await api.post(`/invoices/${id}/pay`);
    return data;
  },

  async duplicate(id: number): Promise<Facture> {
    const { data } = await api.post(`/invoices/${id}/duplicate`);
    return data;
  },

  async downloadPdf(id: number, numero: string): Promise<void> {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Facture-${numero}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async sendByEmail(id: number, email?: string): Promise<void> {
    await api.post(`/invoices/${id}/send`, email ? { email } : {});
  },
};
