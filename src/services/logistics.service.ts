// src/services/logistics.service.ts

import axios from 'axios';
import { Logistics, LogisticsCreateInput, LogisticsUpdateInput, LogisticsFilter } from '../types/logistics.types';

const API_URL = '/api/logistics';

export const logisticsService = {
  getLogistics: async (filters?: LogisticsFilter): Promise<Logistics[]> => {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  },

  getLogisticsById: async (id: number): Promise<Logistics> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createLogistics: async (data: LogisticsCreateInput): Promise<Logistics> => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  updateLogistics: async (id: number, data: LogisticsUpdateInput): Promise<Logistics> => {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
  },

  deleteLogistics: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  trackDelivery: async (id: number): Promise<Logistics> => {
    const response = await axios.get(`${API_URL}/${id}/track`);
    return response.data;
  },

  updateDeliveryStatus: async (id: number, status: string): Promise<Logistics> => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  }
};