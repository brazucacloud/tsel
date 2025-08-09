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
  DataUsage as DataUsageOutlinedIcon,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellularConnectedNoInternet1Bar,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet3Bar,
  SignalCellularConnectedNoInternet4Bar,
  SignalCellularNull,
  SignalCellularOff,
  SignalWifi0Bar,
  SignalWifi1Bar,
  SignalWifi2Bar,
  SignalWifi3Bar,
  SignalWifi4Bar,
  SignalWifiOff,
  SignalWifiStatusbar1Bar,
  SignalWifiStatusbar2Bar,
  SignalWifiStatusbar3Bar,
  SignalWifiStatusbar4Bar,
  SignalWifiStatusbarConnectedNoInternet1,
  SignalWifiStatusbarConnectedNoInternet2,
  SignalWifiStatusbarConnectedNoInternet3,
  SignalWifiStatusbarConnectedNoInternet4,
  SignalWifiStatusbarNotConnected,
  SignalWifiStatusbarNull,
  SignalWifiStatusbarOff,
  SignalWifiStatusbar1Bar,
  SignalWifiStatusbar2Bar,
  SignalWifiStatusbar3Bar,
  SignalWifiStatusbar4Bar,
  SignalWifiStatusbarConnectedNoInternet1,
  SignalWifiStatusbarConnectedNoInternet2,
  SignalWifiStatusbarConnectedNoInternet3,
  SignalWifiStatusbarConnectedNoInternet4,
  SignalWifiStatusbarNotConnected,
  SignalWifiStatusbarNull,
  SignalWifiStatusbarOff
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

interface RealtimeData {
  onlineDevices: number;
  runningTasks: number;
  recentCompleted: number;
  recentFailed: number;
  recentActivity: Array<{
    taskId: string;
    type: string;
    status: string;
    description: string;
    deviceName: string;
    createdAt: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    devices?: string[];
  }>;
  timestamp: string;
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  activeConnections: number;
  queueSize: number;
  avgResponseTime: number;
}

const AnalyticsRealtime: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Mock data for demonstration
  useEffect(() => {
    const loadRealtimeData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock realtime data
      const mockRealtimeData: RealtimeData = {
        onlineDevices: 12,
        runningTasks: 8,
        recentCompleted: 15,
        recentFailed: 2,
        recentActivity: [
          { taskId: '1', type: 'whatsapp_message', status: 'completed', description: 'Enviar mensagem para contato', deviceName: 'Samsung Galaxy S21', createdAt: '2024-01-07 15:30:45' },
          { taskId: '2', type: 'whatsapp_media', status: 'completed', description: 'Enviar imagem para grupo', deviceName: 'Xiaomi Redmi Note 10', createdAt: '2024-01-07 15:29:32' },
          { taskId: '3', type: 'whatsapp_call', status: 'failed', description: 'Fazer chamada', deviceName: 'Motorola Moto G60', createdAt: '2024-01-07 15:28:15' },
          { taskId: '4', type: 'whatsapp_message', status: 'completed', description: 'Enviar mensagem para contato', deviceName: 'OnePlus 9', createdAt: '2024-01-07 15:27:48' },
          { taskId: '5', type: 'whatsapp_media', status: 'completed', description: 'Enviar áudio', deviceName: 'Google Pixel 6', createdAt: '2024-01-07 15:26:22' },
          { taskId: '6', type: 'whatsapp_group', status: 'running', description: 'Enviar para grupo', deviceName: 'Samsung Galaxy S21', createdAt: '2024-01-07 15:25:10' },
          { taskId: '7', type: 'whatsapp_message', status: 'completed', description: 'Enviar mensagem para contato', deviceName: 'Xiaomi Redmi Note 10', createdAt: '2024-01-07 15:24:33' },
          { taskId: '8', type: 'whatsapp_video', status: 'running', description: 'Chamada de vídeo', deviceName: 'OnePlus 9', createdAt: '2024-01-07 15:23:45' },
          { taskId: '9', type: 'whatsapp_media', status: 'completed', description: 'Enviar documento', deviceName: 'Google Pixel 6', createdAt: '2024-01-07 15:22:18' },
          { taskId: '10', type: 'whatsapp_message', status: 'failed', description: 'Enviar mensagem para contato', deviceName: 'Motorola Moto G60', createdAt: '2024-01-07 15:21:05' }
        ],
        alerts: [
          { type: 'warning', message: '1 dispositivo offline há mais de 30 minutos', devices: ['Motorola Moto G60'] },
          { type: 'error', message: 'Taxa de falha alta: 15.2% na última hora' },
          { type: 'warning', message: '2 dispositivo(s) com muitas falhas', devices: ['Motorola Moto G60 (5 falhas)', 'Xiaomi Redmi Note 10 (3 falhas)'] }
        ],
        timestamp: new Date().toISOString(),
        systemHealth: {
          cpu: 45,
          memory: 62,
          disk: 28,
          network: 85
        },
        activeConnections: 156,
        queueSize: 23,
        avgResponseTime: 1.2
      };

      setRealtimeData(mockRealtimeData);
      setLoading(false);
    };

    loadRealtimeData();

    // Auto refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(loadRealtimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'running': return <Sync />;
      case 'failed': return <Error />;
      case 'pending': return <Schedule />;
      default: return <Info />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Notifications />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!realtimeData) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Erro ao carregar dados em tempo real
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Analytics em Tempo Real
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Monitoramento em tempo real do sistema TSEL
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Atualização Automática"
              />
              <Typography variant="body2" color="text.secondary">
                Última atualização: {new Date(realtimeData.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>

            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Atualizar Agora
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Real-time Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {realtimeData.onlineDevices}
                    </Typography>
                    <Typography variant="body2">Dispositivos Online</Typography>
                  </Box>
                  <Smartphone sx={{ fontSize: 40 }} />
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
                      {realtimeData.runningTasks}
                    </Typography>
                    <Typography variant="body2">Tarefas em Execução</Typography>
                  </Box>
                  <Sync sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {realtimeData.recentCompleted}
                    </Typography>
                    <Typography variant="body2">Completadas (5min)</Typography>
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
                      {realtimeData.recentFailed}
                    </Typography>
                    <Typography variant="body2">Falhadas (5min)</Typography>
                  </Box>
                  <Error sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* System Health and Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividade Recente
              </Typography>
              <List>
                {realtimeData.recentActivity.map((activity) => (
                  <ListItem key={activity.taskId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getStatusColor(activity.status)}.main` }}>
                        {getStatusIcon(activity.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={`${activity.deviceName} • ${new Date(activity.createdAt).toLocaleTimeString()}`}
                    />
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saúde do Sistema
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">CPU</Typography>
                  <Typography variant="body2">{realtimeData.systemHealth.cpu}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={realtimeData.systemHealth.cpu} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={realtimeData.systemHealth.cpu > 80 ? 'error' : realtimeData.systemHealth.cpu > 60 ? 'warning' : 'success'}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Memória</Typography>
                  <Typography variant="body2">{realtimeData.systemHealth.memory}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={realtimeData.systemHealth.memory} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={realtimeData.systemHealth.memory > 80 ? 'error' : realtimeData.systemHealth.memory > 60 ? 'warning' : 'success'}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Disco</Typography>
                  <Typography variant="body2">{realtimeData.systemHealth.disk}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={realtimeData.systemHealth.disk} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={realtimeData.systemHealth.disk > 80 ? 'error' : realtimeData.systemHealth.disk > 60 ? 'warning' : 'success'}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Rede</Typography>
                  <Typography variant="body2">{realtimeData.systemHealth.network}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={realtimeData.systemHealth.network} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={realtimeData.systemHealth.network > 80 ? 'error' : realtimeData.systemHealth.network > 60 ? 'warning' : 'success'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conexões Ativas
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {realtimeData.activeConnections}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Conexões simultâneas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tamanho da Fila
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {realtimeData.queueSize}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Tarefas aguardando
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tempo Médio de Resposta
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {realtimeData.avgResponseTime}s
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Média dos últimos 5 minutos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alertas do Sistema
          </Typography>
          {realtimeData.alerts.length > 0 ? (
            <List>
              {realtimeData.alerts.map((alert, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${alert.type}.main` }}>
                      {getAlertIcon(alert.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.devices && alert.devices.join(', ')}
                  />
                  <Chip
                    label={alert.type}
                    color={alert.type as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Nenhum alerta ativo
            </Typography>
          )}
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

export default AnalyticsRealtime;

