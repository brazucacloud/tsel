// Tipos base
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  model: string;
  os: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastSeen: string;
  batteryLevel: number;
  signalStrength: number;
  whatsappType: 'normal' | 'business';
  currentDay: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  deviceId: string;
  type: TaskType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskType = 
  | 'whatsapp_message'
  | 'whatsapp_call'
  | 'whatsapp_group'
  | 'whatsapp_status'
  | 'whatsapp_profile'
  | 'whatsapp_contact'
  | 'whatsapp_security'
  | 'whatsapp_media'
  | 'whatsapp_audio'
  | 'whatsapp_video'
  | 'whatsapp_document'
  | 'whatsapp_sticker'
  | 'whatsapp_emoji'
  | 'whatsapp_link'
  | 'whatsapp_forward'
  | 'whatsapp_reaction'
  | 'whatsapp_archive'
  | 'whatsapp_mute'
  | 'whatsapp_block'
  | 'whatsapp_delete'
  | 'whatsapp_favorite'
  | 'whatsapp_pin'
  | 'whatsapp_clear'
  | 'whatsapp_share'
  | 'whatsapp_vcard'
  | 'whatsapp_gif'
  | 'whatsapp_pdf'
  | 'whatsapp_image'
  | 'whatsapp_temporary'
  | 'whatsapp_ring'
  | 'whatsapp_unread'
  | 'whatsapp_group_create'
  | 'whatsapp_group_join'
  | 'whatsapp_group_leave'
  | 'whatsapp_group_silence'
  | 'whatsapp_profile_photo'
  | 'whatsapp_status_message'
  | 'whatsapp_contact_add'
  | 'whatsapp_contact_delete'
  | 'whatsapp_contact_share'
  | 'whatsapp_contact_fix'
  | 'whatsapp_contact_save'
  | 'whatsapp_contact_block'
  | 'whatsapp_contact_unblock'
  | 'whatsapp_contact_search'
  | 'whatsapp_contact_import'
  | 'whatsapp_contact_export'
  | 'whatsapp_contact_backup'
  | 'whatsapp_contact_restore'
  | 'whatsapp_contact_sync'
  | 'whatsapp_contact_merge'
  | 'whatsapp_contact_split'
  | 'whatsapp_contact_validate'
  | 'whatsapp_contact_clean'
  | 'whatsapp_contact_organize'
  | 'whatsapp_contact_tag'
  | 'whatsapp_contact_note'
  | 'whatsapp_contact_favorite'
  | 'whatsapp_contact_pin'
  | 'whatsapp_contact_archive'
  | 'whatsapp_contact_delete_all'
  | 'whatsapp_contact_restore_all'
  | 'whatsapp_contact_backup_all'
  | 'whatsapp_contact_sync_all'
  | 'whatsapp_contact_merge_all'
  | 'whatsapp_contact_split_all'
  | 'whatsapp_contact_validate_all'
  | 'whatsapp_contact_clean_all'
  | 'whatsapp_contact_organize_all'
  | 'whatsapp_contact_tag_all'
  | 'whatsapp_contact_note_all'
  | 'whatsapp_contact_favorite_all'
  | 'whatsapp_contact_pin_all'
  | 'whatsapp_contact_archive_all'
  | 'whatsapp_contact_delete_selected'
  | 'whatsapp_contact_restore_selected'
  | 'whatsapp_contact_backup_selected'
  | 'whatsapp_contact_sync_selected'
  | 'whatsapp_contact_merge_selected'
  | 'whatsapp_contact_split_selected'
  | 'whatsapp_contact_validate_selected'
  | 'whatsapp_contact_clean_selected'
  | 'whatsapp_contact_organize_selected'
  | 'whatsapp_contact_tag_selected'
  | 'whatsapp_contact_note_selected'
  | 'whatsapp_contact_favorite_selected'
  | 'whatsapp_contact_pin_selected'
  | 'whatsapp_contact_archive_selected';

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

// Tipos para Analytics
export interface AnalyticsData {
  overview: OverviewStats;
  tasks: TaskAnalytics;
  devices: DeviceAnalytics;
  timeline: TimelineData[];
  performance: PerformanceMetrics;
}

export interface OverviewStats {
  totalDevices: number;
  onlineDevices: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageCompletionTime: number;
  activeWarmupDays: number;
}

export interface TaskAnalytics {
  byStatus: Record<TaskStatus, number>;
  byType: Record<TaskType, number>;
  byDay: DayStats[];
  byDevice: DeviceTaskStats[];
  recentActivity: TaskActivity[];
}

export interface DeviceAnalytics {
  byStatus: Record<string, number>;
  byWhatsAppType: Record<string, number>;
  byOS: Record<string, number>;
  performance: DevicePerformance[];
  batteryStats: BatteryStats;
  signalStats: SignalStats;
}

export interface TimelineData {
  timestamp: string;
  tasksCreated: number;
  tasksCompleted: number;
  tasksFailed: number;
  devicesOnline: number;
  devicesOffline: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface DayStats {
  day: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
}

export interface DeviceTaskStats {
  deviceId: string;
  deviceName: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageCompletionTime: number;
}

export interface TaskActivity {
  id: string;
  deviceId: string;
  deviceName: string;
  type: TaskType;
  status: TaskStatus;
  timestamp: string;
  duration?: number;
}

export interface DevicePerformance {
  deviceId: string;
  deviceName: string;
  averageCompletionTime: number;
  successRate: number;
  totalTasks: number;
  lastActivity: string;
}

export interface BatteryStats {
  averageLevel: number;
  lowBatteryDevices: number;
  chargingDevices: number;
  batteryDistribution: Record<string, number>;
}

export interface SignalStats {
  averageStrength: number;
  strongSignalDevices: number;
  weakSignalDevices: number;
  signalDistribution: Record<string, number>;
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateTaskRequest {
  deviceId: string;
  type: TaskType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor?: string;
}

export interface UpdateTaskRequest {
  status?: TaskStatus;
  result?: any;
  error?: string;
}

export interface BulkActionRequest {
  deviceIds: string[];
  action: 'start' | 'stop' | 'restart' | 'ping';
}

export interface FilterOptions {
  status?: TaskStatus[];
  type?: TaskType[];
  deviceId?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priority?: string[];
}

// Tipos para WebSocket
export interface WebSocketMessage {
  type: 'task_update' | 'device_status' | 'analytics_update' | 'system_alert';
  data: any;
  timestamp: string;
}

export interface TaskUpdateMessage {
  taskId: string;
  deviceId: string;
  status: TaskStatus;
  progress?: number;
  result?: any;
  error?: string;
}

export interface DeviceStatusMessage {
  deviceId: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  batteryLevel: number;
  signalStrength: number;
  lastSeen: string;
}

export interface SystemAlertMessage {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

// Tipos para Componentes
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: any, row: any) => React.ReactNode;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
  color: string;
  link?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
} 