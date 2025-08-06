import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  LoginRequest, 
  LoginResponse,
  User,
  Device,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  BulkActionRequest,
  FilterOptions,
  AnalyticsData
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratamento de erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Carregar token do localStorage
    this.token = localStorage.getItem('token');
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/admin/login', credentials);
    
    if (response.data.success && response.data.data) {
      this.token = response.data.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data.data!;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Dispositivos
  async getDevices(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Device>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Device>>> = await this.api.get('/devices', {
      params: { page, limit }
    });
    return response.data.data!;
  }

  async getDevice(id: string): Promise<Device> {
    const response: AxiosResponse<ApiResponse<Device>> = await this.api.get(`/devices/${id}`);
    return response.data.data!;
  }

  async updateDevice(id: string, data: Partial<Device>): Promise<Device> {
    const response: AxiosResponse<ApiResponse<Device>> = await this.api.put(`/devices/${id}`, data);
    return response.data.data!;
  }

  async deleteDevice(id: string): Promise<void> {
    await this.api.delete(`/devices/${id}`);
  }

  async getDeviceStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/devices/stats/overview');
    return response.data.data!;
  }

  async pingDevice(id: string): Promise<void> {
    await this.api.post(`/devices/${id}/ping`);
  }

  async bulkDeviceAction(request: BulkActionRequest): Promise<void> {
    await this.api.post('/devices/bulk/action', request);
  }

  // Tarefas
  async getTasks(
    page: number = 1, 
    limit: number = 20, 
    filters?: FilterOptions
  ): Promise<PaginatedResponse<Task>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Task>>> = await this.api.get('/tasks', {
      params: { page, limit, ...filters }
    });
    return response.data.data!;
  }

  async getTask(id: string): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.get(`/tasks/${id}`);
    return response.data.data!;
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.post('/tasks', task);
    return response.data.data!;
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.put(`/tasks/${id}/status`, data);
    return response.data.data!;
  }

  async deleteTask(id: string): Promise<void> {
    await this.api.delete(`/tasks/${id}`);
  }

  async getTasksByDevice(deviceId: string): Promise<Task[]> {
    const response: AxiosResponse<ApiResponse<Task[]>> = await this.api.get(`/tasks/device/${deviceId}`);
    return response.data.data!;
  }

  async getTaskStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/tasks/stats');
    return response.data.data!;
  }

  async bulkCreateTasks(tasks: CreateTaskRequest[]): Promise<Task[]> {
    const response: AxiosResponse<ApiResponse<Task[]>> = await this.api.post('/tasks/bulk', tasks);
    return response.data.data!;
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    await this.api.delete('/tasks/bulk', { data: { taskIds } });
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const response: AxiosResponse<ApiResponse<AnalyticsData>> = await this.api.get('/analytics/dashboard');
    return response.data.data!;
  }

  async getTaskAnalytics(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/analytics/tasks');
    return response.data.data!;
  }

  async getDeviceAnalytics(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/analytics/devices');
    return response.data.data!;
  }

  async exportAnalytics(format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get('/analytics/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Admin
  async getAdminDashboard(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/admin/dashboard');
    return response.data.data!;
  }

  async getSystemStatus(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/admin/system/status');
    return response.data.data!;
  }

  async createBackup(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/admin/system/backup');
    return response.data.data!;
  }

  async broadcastMessage(message: string, deviceIds?: string[]): Promise<void> {
    await this.api.post('/admin/broadcast', { message, deviceIds });
  }

  // Utilitários
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Download de arquivos
  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Upload de arquivos
  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data!;
  }
}

// Instância singleton
const apiService = new ApiService();
export default apiService; 