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
  Timeline,
  CheckCircle,
  Error,
  Warning,
  Info,
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
  hourlyPerformance: Array<{
    hour: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
  dailyPerformance: Array<{
    date: string;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
  }>;
}

const AnalyticsTasks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<TaskAnalytics | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Mock data for demonstration
  useEffect(() => {
    const loadTaskData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock task analytics data
      const mockTaskData: TaskAnalytics = {
        summary: {
          total: 2847,
          completed: 2653,
          failed: 60,
          pending: 134,
          running: 0,
          successRate: 93.2,
          avgExecutionTime: 2.8,
          totalExecutionTime: 7961.6
        },
        typeDistribution: [
          { type: 'whatsapp_message', count: 1200, completed: 1150, failed: 30, successRate: 95.8 },
          { type: 'whatsapp_media', count: 800, completed: 750, failed: 20, successRate: 93.8 },
          { type: 'whatsapp_group', count: 600, completed: 580, failed: 10, successRate: 96.7 },
          { type: 'whatsapp_call', count: 200, completed: 190, failed: 5, successRate: 95.0 },
          { type: 'whatsapp_video', count: 47, completed: 43, failed: 2, successRate: 91.5 }
        ],
        statusDistribution: [
          { _id: 'completed', count: 2653 },
          { _id: 'pending', count: 134 },
          { _id: 'failed', count: 60 }
        ],
        priorityStats: [
          { priority: 'high', count: 500, completed: 485, successRate: 97.0, avgExecutionTime: 2.1 },
          { priority: 'normal', count: 2000, completed: 1850, successRate: 92.5, avgExecutionTime: 2.9 },
          { priority: 'low', count: 347, completed: 318, successRate: 91.6, avgExecutionTime: 3.2 }
        ],
        timeline: [
          { _id: '2024-01-01', statuses: [{ status: 'completed', count: 45 }, { status: 'failed', count: 2 }] },
          { _id: '2024-01-02', statuses: [{ status: 'completed', count: 52 }, { status: 'failed', count: 1 }] },
          { _id: '2024-01-03', statuses: [{ status: 'completed', count: 38 }, { status: 'failed', count: 3 }] },
          { _id: '2024-01-04', statuses: [{ status: 'completed', count: 61 }, { status: 'failed', count: 2 }] },
          { _id: '2024-01-05', statuses: [{ status: 'completed', count: 47 }, { status: 'failed', count: 1 }] },
          { _id: '2024-01-06', statuses: [{ status: 'completed', count: 55 }, { status: 'failed', count: 2 }] },
          { _id: '2024-01-07', statuses: [{ status: 'completed', count: 42 }, { status: 'failed', count: 3 }] }
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
        slowestTasks: [
          { taskId: '1', type: 'whatsapp_video', description: 'Enviar vídeo para contato', executionTime: 15.2, deviceName: 'Samsung Galaxy S21', createdAt: '2024-01-07 14:30' },
          { taskId: '2', type: 'whatsapp_media', description: 'Enviar imagem para grupo', executionTime: 12.8, deviceName: 'Xiaomi Redmi Note 10', createdAt: '2024-01-07 13:45' },
          { taskId: '3', type: 'whatsapp_media', description: 'Enviar documento', executionTime: 11.5, deviceName: 'Motorola Moto G60', createdAt: '2024-01-07 12:20' },
          { taskId: '4', type: 'whatsapp_video', description: 'Chamada de vídeo', executionTime: 10.3, deviceName: 'OnePlus 9', createdAt: '2024-01-07 11:15' },
          { taskId: '5', type: 'whatsapp_media', description: 'Enviar áudio', executionTime: 9.7, deviceName: 'Google Pixel 6', createdAt: '2024-01-07 10:30' }
        ],
        retryTasks: [
          { taskId: '1', type: 'whatsapp_message', description: 'Enviar mensagem', retryCount: 5, status: 'failed', deviceName: 'Motorola Moto G60', createdAt: '2024-01-07 14:30' },
          { taskId: '2', type: 'whatsapp_media', description: 'Enviar imagem', retryCount: 3, status: 'completed', deviceName: 'Samsung Galaxy S21', createdAt: '2024-01-07 13:45' },
          { taskId: '3', type: 'whatsapp_call', description: 'Fazer chamada', retryCount: 3, status: 'failed', deviceName: 'Xiaomi Redmi Note 10', createdAt: '2024-01-07 12:20' },
          { taskId: '4', type: 'whatsapp_group', description: 'Enviar para grupo', retryCount: 2, status: 'completed', deviceName: 'OnePlus 9', createdAt: '2024-01-07 11:15' },
          { taskId: '5', type: 'whatsapp_message', description: 'Enviar mensagem', retryCount: 2, status: 'completed', deviceName: 'Google Pixel 6', createdAt: '2024-01-07 10:30' }
        ],
        hourlyPerformance: [
          { hour: 0, totalTasks: 45, completedTasks: 42, failedTasks: 3, successRate: 93.3, avgExecutionTime: 2.5 },
          { hour: 1, totalTasks: 32, completedTasks: 30, failedTasks: 2, successRate: 93.8, avgExecutionTime: 2.8 },
          { hour: 2, totalTasks: 18, completedTasks: 17, failedTasks: 1, successRate: 94.4, avgExecutionTime: 3.1 },
          { hour: 3, totalTasks: 12, completedTasks: 11, failedTasks: 1, successRate: 91.7, avgExecutionTime: 3.2 },
          { hour: 4, totalTasks: 8, completedTasks: 7, failedTasks: 1, successRate: 87.5, avgExecutionTime: 3.5 },
          { hour: 5, totalTasks: 15, completedTasks: 14, failedTasks: 1, successRate: 93.3, avgExecutionTime: 2.9 },
          { hour: 6, totalTasks: 28, completedTasks: 26, failedTasks: 2, successRate: 92.9, avgExecutionTime: 2.7 },
          { hour: 7, totalTasks: 42, completedTasks: 40, failedTasks: 2, successRate: 95.2, avgExecutionTime: 2.4 },
          { hour: 8, totalTasks: 58, completedTasks: 55, failedTasks: 3, successRate: 94.8, avgExecutionTime: 2.3 },
          { hour: 9, totalTasks: 65, completedTasks: 62, failedTasks: 3, successRate: 95.4, avgExecutionTime: 2.2 },
          { hour: 10, totalTasks: 72, completedTasks: 69, failedTasks: 3, successRate: 95.8, avgExecutionTime: 2.1 },
          { hour: 11, totalTasks: 68, completedTasks: 65, failedTasks: 3, successRate: 95.6, avgExecutionTime: 2.2 },
          { hour: 12, totalTasks: 75, completedTasks: 72, failedTasks: 3, successRate: 96.0, avgExecutionTime: 2.0 },
          { hour: 13, totalTasks: 71, completedTasks: 68, failedTasks: 3, successRate: 95.8, avgExecutionTime: 2.1 },
          { hour: 14, totalTasks: 69, completedTasks: 66, failedTasks: 3, successRate: 95.7, avgExecutionTime: 2.2 },
          { hour: 15, totalTasks: 73, completedTasks: 70, failedTasks: 3, successRate: 95.9, avgExecutionTime: 2.0 },
          { hour: 16, totalTasks: 67, completedTasks: 64, failedTasks: 3, successRate: 95.5, avgExecutionTime: 2.3 },
          { hour: 17, totalTasks: 64, completedTasks: 61, failedTasks: 3, successRate: 95.3, avgExecutionTime: 2.4 },
          { hour: 18, totalTasks: 58, completedTasks: 55, failedTasks: 3, successRate: 94.8, avgExecutionTime: 2.6 },
          { hour: 19, totalTasks: 52, completedTasks: 49, failedTasks: 3, successRate: 94.2, avgExecutionTime: 2.8 },
          { hour: 20, totalTasks: 48, completedTasks: 45, failedTasks: 3, successRate: 93.8, avgExecutionTime: 2.9 },
          { hour: 21, totalTasks: 41, completedTasks: 38, failedTasks: 3, successRate: 92.7, avgExecutionTime: 3.0 },
          { hour: 22, totalTasks: 35, completedTasks: 32, failedTasks: 3, successRate: 91.4, avgExecutionTime: 3.1 },
          { hour: 23, totalTasks: 28, completedTasks: 25, failedTasks: 3, successRate: 89.3, avgExecutionTime: 3.3 }
        ],
        dailyPerformance: [
          { date: '2024-01-01', totalTasks: 156, completedTasks: 145, failedTasks: 11, successRate: 92.9 },
          { date: '2024-01-02', totalTasks: 168, completedTasks: 158, failedTasks: 10, successRate: 94.0 },
          { date: '2024-01-03', totalTasks: 142, completedTasks: 132, failedTasks: 10, successRate: 93.0 },
          { date: '2024-01-04', totalTasks: 175, completedTasks: 165, failedTasks: 10, successRate: 94.3 },
          { date: '2024-01-05', totalTasks: 158, completedTasks: 148, failedTasks: 10, successRate: 93.7 },
          { date: '2024-01-06', totalTasks: 162, completedTasks: 152, failedTasks: 10, successRate: 93.8 },
          { date: '2024-01-07', totalTasks: 145, completedTasks: 135, failedTasks: 10, successRate: 93.1 }
        ]
      };

      setTaskData(mockTaskData);
      setLoading(false);
    };

    loadTaskData();
  }, []);

  const handleExport = () => {
    setSnackbar({
      open: true,
      message: 'Exportando dados de tarefas...',
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

  if (!taskData) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Erro ao carregar dados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Analytics de Tarefas
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Análise detalhada de performance e execução das tarefas
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small">
                <InputLabel>Tipo de Tarefa</InputLabel>
                <Select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value)}
                  label="Tipo de Tarefa"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {taskData.typeDistribution.map(type => (
                    <MenuItem key={type.type} value={type.type}>
                      {type.type.replace('whatsapp_', '').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {taskData.statusDistribution.map(status => (
                    <MenuItem key={status._id} value={status._id}>
                      {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  label="Prioridade"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {taskData.priorityStats.map(priority => (
                    <MenuItem key={priority.priority} value={priority.priority}>
                      {priority.priority.charAt(0).toUpperCase() + priority.priority.slice(1)}
                    </MenuItem>
                  ))}
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
                onClick={handleExport}
              >
                Exportar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {taskData.summary.total.toLocaleString()}
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
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {taskData.summary.completed.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Completadas</Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {taskData.summary.failed}
                    </Typography>
                    <Typography variant="body2">Falhadas</Typography>
                  </Box>
                  <Error sx={{ fontSize: 40 }} />
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
                      {taskData.summary.successRate.toFixed(1)}%
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
              <Typography variant="h6" gutterBottom>
                Performance por Hora (Últimas 24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={taskData.hourlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Bar yAxisId="left" dataKey="totalTasks" fill="#1976d2" name="Total Tarefas" />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#4caf50" strokeWidth={2} name="Taxa de Sucesso (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Tipo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {taskData.typeDistribution.map((entry, index) => (
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

      {/* Performance by Priority */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance por Prioridade
          </Typography>
          <Grid container spacing={2}>
            {taskData.priorityStats.map((priority) => (
              <Grid item xs={12} md={4} key={priority.priority}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {priority.priority}
                      </Typography>
                      <Chip
                        label={`${priority.successRate.toFixed(1)}%`}
                        color={priority.successRate >= 95 ? 'success' : priority.successRate >= 90 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {priority.count} tarefas • {priority.completed} completadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tempo médio: {priority.avgExecutionTime}s
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={priority.successRate} 
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      color={priority.successRate >= 95 ? 'success' : priority.successRate >= 90 ? 'warning' : 'error'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Slowest Tasks and Retry Tasks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tarefas Mais Demoradas
              </Typography>
              <List>
                {taskData.slowestTasks.map((task, index) => (
                  <ListItem key={task.taskId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Timer />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.description}
                      secondary={`${task.deviceName} • ${task.executionTime}s`}
                    />
                    <Chip
                      label={task.type.replace('whatsapp_', '').toUpperCase()}
                      size="small"
                      variant="outlined"
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
                Tarefas com Mais Tentativas
              </Typography>
              <List>
                {taskData.retryTasks.map((task) => (
                  <ListItem key={task.taskId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: task.status === 'completed' ? 'success.main' : 'error.main' }}>
                        <Sync />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.description}
                      secondary={`${task.deviceName} • ${task.retryCount} tentativas`}
                    />
                    <Chip
                      label={task.status}
                      color={task.status === 'completed' ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Common Errors */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Erros Mais Comuns
          </Typography>
          <Grid container spacing={2}>
            {taskData.commonErrors.map((error, index) => (
              <Grid item xs={12} sm={6} md={4} key={error._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {error._id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {error.count} ocorrências
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                        <Error sx={{ fontSize: 16 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

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

export default AnalyticsTasks;

