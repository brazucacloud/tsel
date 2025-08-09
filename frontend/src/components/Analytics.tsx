import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Badge,
  CircularProgress,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  FormGroup
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  TrendingDown,
  Speed,
  Schedule,
  CalendarToday,
  AccessTime,
  LocationOn,
  Language,
  Storage,
  Memory,
  NetworkCheck,
  Battery90,
  SignalCellular4Bar,
  Wifi,
  Bluetooth,
  DataUsage,
  ExpandMore,
  Add,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  PowerSettingsNew,
  RestartAlt,
  Update,
  Download,
  Upload,
  Sync,
  CloudDownload,
  CloudUpload,
  Security,
  Lock,
  LockOpen,
  VpnKey,
  QrCode,
  QrCodeScanner,
  Smartphone,
  Tablet,
  Laptop,
  DesktopMac,
  Router,
  Hub,
  Api,
  Webhook,
  Code,
  BugReport,
  Build,
  Engineering,
  Science,
  Psychology,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  ShowChart,
  Timer,
  HourglassEmpty,
  HourglassFull,
  Event,
  Today,
  DateRange,
  Update as UpdateIcon,
  Sync as SyncIcon,
  CloudSync,
  CloudDone,
  CloudOff,
  WifiOff,
  SignalCellular0Bar,
  SignalCellular1Bar,
  SignalCellular2Bar,
  SignalCellular3Bar,
  Battery20,
  Battery30,
  Battery50,
  Battery60,
  Battery80,
  BatteryFull,
  BatteryChargingFull,
  BatteryCharging20,
  BatteryCharging30,
  BatteryCharging50,
  BatteryCharging60,
  BatteryCharging80,
  BatteryCharging90,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  DataUsage as DataUsageIcon,
  FilterList,
  Refresh,
  GetApp,
  Share,
  Print,
  Email,
  WhatsApp,
  Phone,
  Message,
  VideoCall,
  Group,
  PhotoCamera,
  Mic,
  Send,
  CheckCircle,
  Error,
  Warning,
  Info,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  Update as UpdateIcon,
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  WifiOff as WifiOffIcon,
  SignalCellular0Bar as SignalCellular0BarIcon,
  SignalCellular1Bar as SignalCellular1BarIcon,
  SignalCellular2Bar as SignalCellular2BarIcon,
  SignalCellular3Bar as SignalCellular3BarIcon,
  Battery90 as Battery90Icon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  Wifi as WifiOutlinedIcon,
  Bluetooth as BluetoothOutlinedIcon,
  DataUsage as DataUsageOutlinedIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  Treemap,
  TreemapItem
} from 'recharts';
import { motion } from 'framer-motion';

interface AnalyticsData {
  overview: {
    totalDevices: number;
    onlineDevices: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    failedTasks: number;
    overallSuccessRate: number;
  };
  today: {
    tasks: number;
    completed: number;
    successRate: number;
  };
  week: {
    tasks: number;
    completed: number;
    successRate: number;
  };
  month: {
    tasks: number;
    completed: number;
    successRate: number;
  };
  taskTypes: Array<{
    type: string;
    total: number;
    completed: number;
    failed: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
  topDevices: Array<{
    deviceId: string;
    deviceName: string;
    totalTasks: number;
    completedTasks: number;
    successRate: number;
  }>;
  timeline: Array<{
    _id: number;
    statuses: Array<{
      status: string;
      count: number;
    }>;
  }>;
  hourlySuccessRate: Array<{
    hour: number;
    successRate: number;
  }>;
  commonErrors: Array<{
    _id: string;
    count: number;
  }>;
  manufacturerStats: Array<{
    manufacturer: string;
    totalDevices: number;
    totalTasks: number;
    completedTasks: number;
    successRate: number;
  }>;
}

interface DeviceAnalytics {
  devices: Array<{
    deviceId: string;
    deviceName: string;
    manufacturer: string;
    model: string;
    androidVersion: string;
    isOnline: boolean;
    lastSeen: string;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    avgExecutionTime: number;
    uptime: string;
  }>;
  statusDistribution: Array<{
    _id: boolean;
    count: number;
  }>;
  manufacturerDistribution: Array<{
    _id: string;
    count: number;
  }>;
  androidVersionDistribution: Array<{
    _id: string;
    count: number;
  }>;
  topPerformers: Array<any>;
  problematicDevices: Array<any>;
  hourlyActivity: Array<{
    hour: number;
    activeDevices: number;
    totalTasks: number;
  }>;
  summary: {
    total: number;
    online: number;
    offline: number;
    avgSuccessRate: number;
  };
}

interface TaskAnalytics {
  summary: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    running: number;
    successRate: number;
    avgExecutionTime: number;
    totalExecutionTime: number;
  };
  typeDistribution: Array<{
    type: string;
    count: number;
    completed: number;
    failed: number;
    successRate: number;
  }>;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    priority: string;
    count: number;
    completed: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
  timeline: Array<{
    _id: string;
    statuses: Array<{
      status: string;
      count: number;
    }>;
  }>;
  commonErrors: Array<{
    _id: string;
    count: number;
  }>;
  slowestTasks: Array<{
    taskId: string;
    type: string;
    description: string;
    executionTime: number;
    deviceName: string;
    createdAt: string;
  }>;
  retryTasks: Array<{
    taskId: string;
    type: string;
    description: string;
    retryCount: number;
    status: string;
    deviceName: string;
    createdAt: string;
  }>;
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceAnalytics | null>(null);
  const [taskData, setTaskData] = useState<TaskAnalytics | null>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Mock data for demonstration
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock overview data
      const mockOverview: AnalyticsData = {
        overview: {
          totalDevices: 15,
          onlineDevices: 12,
          totalTasks: 2847,
          completedTasks: 2653,
          pendingTasks: 134,
          failedTasks: 60,
          overallSuccessRate: 93.2
        },
        today: {
          tasks: 156,
          completed: 142,
          successRate: 91.0
        },
        week: {
          tasks: 1089,
          completed: 1023,
          successRate: 93.9
        },
        month: {
          tasks: 4567,
          completed: 4289,
          successRate: 93.9
        },
        taskTypes: [
          { type: 'whatsapp_message', total: 1200, completed: 1150, failed: 30, successRate: 95.8, avgExecutionTime: 2.3 },
          { type: 'whatsapp_media', total: 800, completed: 750, failed: 20, successRate: 93.8, avgExecutionTime: 4.1 },
          { type: 'whatsapp_group', total: 600, completed: 580, failed: 10, successRate: 96.7, avgExecutionTime: 3.2 },
          { type: 'whatsapp_call', total: 200, completed: 190, failed: 5, successRate: 95.0, avgExecutionTime: 1.8 },
          { type: 'whatsapp_video', total: 47, completed: 43, failed: 2, successRate: 91.5, avgExecutionTime: 5.2 }
        ],
        topDevices: [
          { deviceId: '1', deviceName: 'Samsung Galaxy S21', totalTasks: 450, completedTasks: 435, successRate: 96.7 },
          { deviceId: '2', deviceName: 'Xiaomi Redmi Note 10', totalTasks: 380, completedTasks: 365, successRate: 96.1 },
          { deviceId: '3', deviceName: 'Motorola Moto G60', totalTasks: 320, completedTasks: 298, successRate: 93.1 },
          { deviceId: '4', deviceName: 'OnePlus 9', totalTasks: 290, completedTasks: 275, successRate: 94.8 },
          { deviceId: '5', deviceName: 'Google Pixel 6', totalTasks: 250, completedTasks: 240, successRate: 96.0 }
        ],
        timeline: [
          { _id: 0, statuses: [{ status: 'completed', count: 45 }, { status: 'failed', count: 2 }] },
          { _id: 1, statuses: [{ status: 'completed', count: 52 }, { status: 'failed', count: 1 }] },
          { _id: 2, statuses: [{ status: 'completed', count: 38 }, { status: 'failed', count: 3 }] },
          { _id: 3, statuses: [{ status: 'completed', count: 61 }, { status: 'failed', count: 2 }] },
          { _id: 4, statuses: [{ status: 'completed', count: 47 }, { status: 'failed', count: 1 }] },
          { _id: 5, statuses: [{ status: 'completed', count: 55 }, { status: 'failed', count: 2 }] },
          { _id: 6, statuses: [{ status: 'completed', count: 42 }, { status: 'failed', count: 3 }] },
          { _id: 7, statuses: [{ status: 'completed', count: 58 }, { status: 'failed', count: 1 }] },
          { _id: 8, statuses: [{ status: 'completed', count: 49 }, { status: 'failed', count: 2 }] },
          { _id: 9, statuses: [{ status: 'completed', count: 53 }, { status: 'failed', count: 1 }] },
          { _id: 10, statuses: [{ status: 'completed', count: 46 }, { status: 'failed', count: 2 }] },
          { _id: 11, statuses: [{ status: 'completed', count: 60 }, { status: 'failed', count: 1 }] },
          { _id: 12, statuses: [{ status: 'completed', count: 44 }, { status: 'failed', count: 3 }] },
          { _id: 13, statuses: [{ status: 'completed', count: 57 }, { status: 'failed', count: 2 }] },
          { _id: 14, statuses: [{ status: 'completed', count: 51 }, { status: 'failed', count: 1 }] },
          { _id: 15, statuses: [{ status: 'completed', count: 48 }, { status: 'failed', count: 2 }] },
          { _id: 16, statuses: [{ status: 'completed', count: 62 }, { status: 'failed', count: 1 }] },
          { _id: 17, statuses: [{ status: 'completed', count: 43 }, { status: 'failed', count: 3 }] },
          { _id: 18, statuses: [{ status: 'completed', count: 56 }, { status: 'failed', count: 2 }] },
          { _id: 19, statuses: [{ status: 'completed', count: 50 }, { status: 'failed', count: 1 }] },
          { _id: 20, statuses: [{ status: 'completed', count: 54 }, { status: 'failed', count: 2 }] },
          { _id: 21, statuses: [{ status: 'completed', count: 47 }, { status: 'failed', count: 1 }] },
          { _id: 22, statuses: [{ status: 'completed', count: 59 }, { status: 'failed', count: 2 }] },
          { _id: 23, statuses: [{ status: 'completed', count: 45 }, { status: 'failed', count: 3 }] }
        ],
        hourlySuccessRate: [
          { hour: 0, successRate: 92.5 }, { hour: 1, successRate: 91.8 }, { hour: 2, successRate: 90.2 },
          { hour: 3, successRate: 89.5 }, { hour: 4, successRate: 88.9 }, { hour: 5, successRate: 87.3 },
          { hour: 6, successRate: 89.1 }, { hour: 7, successRate: 91.4 }, { hour: 8, successRate: 93.7 },
          { hour: 9, successRate: 94.2 }, { hour: 10, successRate: 95.1 }, { hour: 11, successRate: 95.8 },
          { hour: 12, successRate: 96.3 }, { hour: 13, successRate: 95.9 }, { hour: 14, successRate: 96.1 },
          { hour: 15, successRate: 95.7 }, { hour: 16, successRate: 95.3 }, { hour: 17, successRate: 94.8 },
          { hour: 18, successRate: 94.2 }, { hour: 19, successRate: 93.7 }, { hour: 20, successRate: 93.1 },
          { hour: 21, successRate: 92.5 }, { hour: 22, successRate: 91.9 }, { hour: 23, successRate: 91.2 }
        ],
        commonErrors: [
          { _id: 'Connection timeout', count: 25 },
          { _id: 'WhatsApp not responding', count: 18 },
          { _id: 'Device offline', count: 12 },
          { _id: 'Invalid phone number', count: 8 },
          { _id: 'Media file not found', count: 6 },
          { _id: 'Permission denied', count: 4 },
          { _id: 'Storage full', count: 3 },
          { _id: 'Network error', count: 2 }
        ],
        manufacturerStats: [
          { manufacturer: 'Samsung', totalDevices: 6, totalTasks: 1200, completedTasks: 1150, successRate: 95.8 },
          { manufacturer: 'Xiaomi', totalDevices: 4, totalTasks: 800, completedTasks: 750, successRate: 93.8 },
          { manufacturer: 'Motorola', totalDevices: 2, totalTasks: 400, completedTasks: 370, successRate: 92.5 },
          { manufacturer: 'OnePlus', totalDevices: 2, totalTasks: 350, completedTasks: 330, successRate: 94.3 },
          { manufacturer: 'Google', totalDevices: 1, totalTasks: 97, completedTasks: 93, successRate: 95.9 }
        ]
      };

      setOverviewData(mockOverview);
      setLoading(false);
    };

    loadAnalyticsData();
  }, []);

  const handleExport = (type: string) => {
    setSnackbar({
      open: true,
      message: `Exportando dados de ${type}...`,
      severity: 'info'
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Analytics TSEL
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Análise completa de performance e métricas do sistema
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="24h">Últimas 24 horas</MenuItem>
                  <MenuItem value="7d">Últimos 7 dias</MenuItem>
                  <MenuItem value="30d">Últimos 30 dias</MenuItem>
                  <MenuItem value="90d">Últimos 90 dias</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small">
                <InputLabel>Dispositivo</InputLabel>
                <Select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  label="Dispositivo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="1">Samsung Galaxy S21</MenuItem>
                  <MenuItem value="2">Xiaomi Redmi Note 10</MenuItem>
                  <MenuItem value="3">Motorola Moto G60</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Tipo de Tarefa</InputLabel>
                <Select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value)}
                  label="Tipo de Tarefa"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="whatsapp_message">Mensagens</MenuItem>
                  <MenuItem value="whatsapp_media">Mídia</MenuItem>
                  <MenuItem value="whatsapp_group">Grupos</MenuItem>
                  <MenuItem value="whatsapp_call">Chamadas</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
              <Button
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => handleExport('overview')}
              >
                Exportar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Visão Geral" />
            <Tab label="Dispositivos" />
            <Tab label="Tarefas" />
            <Tab label="Tempo Real" />
            <Tab label="Relatórios" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 0 && overviewData && (
        <OverviewTab data={overviewData} />
      )}
      
      {activeTab === 1 && (
        <DevicesTab />
      )}
      
      {activeTab === 2 && (
        <TasksTab />
      )}
      
      {activeTab === 3 && (
        <RealtimeTab />
      )}
      
      {activeTab === 4 && (
        <ReportsTab />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const [selectedChart, setSelectedChart] = useState('timeline');

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {data.overview.totalDevices}
                    </Typography>
                    <Typography variant="body2">Dispositivos</Typography>
                  </Box>
                  <Smartphone sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {data.overview.onlineDevices}
                    </Typography>
                    <Typography variant="body2">Online</Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {data.overview.totalTasks.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Total Tarefas</Typography>
                  </Box>
                  <Timeline sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {data.overview.overallSuccessRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">Taxa de Sucesso</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Atividade das Últimas 24 Horas
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant={selectedChart === 'timeline' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedChart('timeline')}
                  >
                    Timeline
                  </Button>
                  <Button
                    size="small"
                    variant={selectedChart === 'success' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedChart('success')}
                  >
                    Taxa de Sucesso
                  </Button>
                </Box>
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                {selectedChart === 'timeline' ? (
                  <AreaChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="statuses" 
                      stackId="1" 
                      stroke="#4caf50" 
                      fill="#4caf50" 
                      fillOpacity={0.6}
                      name="Completadas"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={data.hourlySuccessRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      name="Taxa de Sucesso (%)"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance por Tipo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.taskTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                  >
                    {data.taskTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Devices and Errors */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Dispositivos
              </Typography>
              <List>
                {data.topDevices.map((device, index) => (
                  <ListItem key={device.deviceId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'][index % 5] }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={device.deviceName}
                      secondary={`${device.completedTasks}/${device.totalTasks} tarefas`}
                    />
                    <Chip
                      label={`${device.successRate.toFixed(1)}%`}
                      color="success"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Erros Mais Comuns
              </Typography>
              <List>
                {data.commonErrors.map((error, index) => (
                  <ListItem key={error._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Error />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={error._id}
                      secondary={`${error.count} ocorrências`}
                    />
                    <Chip
                      label={error.count}
                      color="error"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Import specific analytics components
import AnalyticsDevices from './AnalyticsDevices';
import AnalyticsTasks from './AnalyticsTasks';
import AnalyticsRealtime from './AnalyticsRealtime';

// Placeholder components for other tabs
const DevicesTab: React.FC = () => <AnalyticsDevices />;

const TasksTab: React.FC = () => <AnalyticsTasks />;

const RealtimeTab: React.FC = () => <AnalyticsRealtime />;

const ReportsTab: React.FC = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Relatórios
    </Typography>
    <Typography variant="body1">
      Componente em desenvolvimento...
    </Typography>
  </Box>
);

export default Analytics;
