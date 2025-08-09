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
  Smartphone,
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
    batteryLevel: number;
    memoryUsage: number;
    storageUsage: number;
    networkStatus: string;
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

const AnalyticsDevices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deviceData, setDeviceData] = useState<DeviceAnalytics | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Mock data for demonstration
  useEffect(() => {
    const loadDeviceData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock device analytics data
      const mockDeviceData: DeviceAnalytics = {
        devices: [
          {
            deviceId: '1',
            deviceName: 'Samsung Galaxy S21',
            manufacturer: 'Samsung',
            model: 'SM-G991B',
            androidVersion: 'Android 12',
            isOnline: true,
            lastSeen: 'Agora',
            totalTasks: 450,
            completedTasks: 435,
            failedTasks: 15,
            successRate: 96.7,
            avgExecutionTime: 2.3,
            uptime: '98.5%',
            batteryLevel: 85,
            memoryUsage: 65,
            storageUsage: 45,
            networkStatus: 'WiFi'
          },
          {
            deviceId: '2',
            deviceName: 'Xiaomi Redmi Note 10',
            manufacturer: 'Xiaomi',
            model: 'M2101K7AG',
            androidVersion: 'Android 11',
            isOnline: true,
            lastSeen: '2 minutos atrás',
            totalTasks: 380,
            completedTasks: 365,
            failedTasks: 15,
            successRate: 96.1,
            avgExecutionTime: 2.8,
            uptime: '97.2%',
            batteryLevel: 92,
            memoryUsage: 58,
            storageUsage: 38,
            networkStatus: 'WiFi'
          },
          {
            deviceId: '3',
            deviceName: 'Motorola Moto G60',
            manufacturer: 'Motorola',
            model: 'XT2135-2',
            androidVersion: 'Android 11',
            isOnline: false,
            lastSeen: '1 hora atrás',
            totalTasks: 320,
            completedTasks: 298,
            failedTasks: 22,
            successRate: 93.1,
            avgExecutionTime: 3.1,
            uptime: '95.8%',
            batteryLevel: 23,
            memoryUsage: 78,
            storageUsage: 85,
            networkStatus: 'Dados'
          },
          {
            deviceId: '4',
            deviceName: 'OnePlus 9',
            manufacturer: 'OnePlus',
            model: 'LE2113',
            androidVersion: 'Android 12',
            isOnline: true,
            lastSeen: 'Agora',
            totalTasks: 290,
            completedTasks: 275,
            failedTasks: 15,
            successRate: 94.8,
            avgExecutionTime: 2.5,
            uptime: '99.1%',
            batteryLevel: 67,
            memoryUsage: 72,
            storageUsage: 52,
            networkStatus: 'WiFi'
          },
          {
            deviceId: '5',
            deviceName: 'Google Pixel 6',
            manufacturer: 'Google',
            model: 'G9S9B',
            androidVersion: 'Android 13',
            isOnline: true,
            lastSeen: '5 minutos atrás',
            totalTasks: 250,
            completedTasks: 240,
            failedTasks: 10,
            successRate: 96.0,
            avgExecutionTime: 2.1,
            uptime: '98.9%',
            batteryLevel: 78,
            memoryUsage: 45,
            storageUsage: 28,
            networkStatus: 'WiFi'
          }
        ],
        statusDistribution: [
          { _id: true, count: 4 },
          { _id: false, count: 1 }
        ],
        manufacturerDistribution: [
          { _id: 'Samsung', count: 1 },
          { _id: 'Xiaomi', count: 1 },
          { _id: 'Motorola', count: 1 },
          { _id: 'OnePlus', count: 1 },
          { _id: 'Google', count: 1 }
        ],
        androidVersionDistribution: [
          { _id: 'Android 11', count: 2 },
          { _id: 'Android 12', count: 2 },
          { _id: 'Android 13', count: 1 }
        ],
        topPerformers: [
          {
            deviceId: '1',
            deviceName: 'Samsung Galaxy S21',
            successRate: 96.7,
            totalTasks: 450,
            avgExecutionTime: 2.3
          },
          {
            deviceId: '5',
            deviceName: 'Google Pixel 6',
            successRate: 96.0,
            totalTasks: 250,
            avgExecutionTime: 2.1
          },
          {
            deviceId: '2',
            deviceName: 'Xiaomi Redmi Note 10',
            successRate: 96.1,
            totalTasks: 380,
            avgExecutionTime: 2.8
          }
        ],
        problematicDevices: [
          {
            deviceId: '3',
            deviceName: 'Motorola Moto G60',
            failedTasks: 22,
            successRate: 93.1,
            issues: ['Bateria baixa', 'Armazenamento cheio', 'Offline']
          }
        ],
        hourlyActivity: [
          { hour: 0, activeDevices: 3, totalTasks: 45 },
          { hour: 1, activeDevices: 2, totalTasks: 32 },
          { hour: 2, activeDevices: 1, totalTasks: 18 },
          { hour: 3, activeDevices: 1, totalTasks: 12 },
          { hour: 4, activeDevices: 1, totalTasks: 8 },
          { hour: 5, activeDevices: 2, totalTasks: 15 },
          { hour: 6, activeDevices: 3, totalTasks: 28 },
          { hour: 7, activeDevices: 4, totalTasks: 42 },
          { hour: 8, activeDevices: 4, totalTasks: 58 },
          { hour: 9, activeDevices: 4, totalTasks: 65 },
          { hour: 10, activeDevices: 4, totalTasks: 72 },
          { hour: 11, activeDevices: 4, totalTasks: 68 },
          { hour: 12, activeDevices: 4, totalTasks: 75 },
          { hour: 13, activeDevices: 4, totalTasks: 71 },
          { hour: 14, activeDevices: 4, totalTasks: 69 },
          { hour: 15, activeDevices: 4, totalTasks: 73 },
          { hour: 16, activeDevices: 4, totalTasks: 67 },
          { hour: 17, activeDevices: 4, totalTasks: 64 },
          { hour: 18, activeDevices: 4, totalTasks: 58 },
          { hour: 19, activeDevices: 4, totalTasks: 52 },
          { hour: 20, activeDevices: 4, totalTasks: 48 },
          { hour: 21, activeDevices: 3, totalTasks: 41 },
          { hour: 22, activeDevices: 3, totalTasks: 35 },
          { hour: 23, activeDevices: 2, totalTasks: 28 }
        ],
        summary: {
          total: 5,
          online: 4,
          offline: 1,
          avgSuccessRate: 95.3
        }
      };

      setDeviceData(mockDeviceData);
      setLoading(false);
    };

    loadDeviceData();
  }, []);

  const handleExport = () => {
    setSnackbar({
      open: true,
      message: 'Exportando dados de dispositivos...',
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

  if (!deviceData) {
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
          Analytics de Dispositivos
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Análise detalhada de performance e status dos dispositivos Android
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small">
                <InputLabel>Dispositivo</InputLabel>
                <Select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  label="Dispositivo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {deviceData.devices.map(device => (
                    <MenuItem key={device.deviceId} value={device.deviceId}>
                      {device.deviceName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small">
                <InputLabel>Fabricante</InputLabel>
                <Select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  label="Fabricante"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {deviceData.manufacturerDistribution.map(manufacturer => (
                    <MenuItem key={manufacturer._id} value={manufacturer._id}>
                      {manufacturer._id}
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
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
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
                      {deviceData.summary.total}
                    </Typography>
                    <Typography variant="body2">Total Dispositivos</Typography>
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
                      {deviceData.summary.online}
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
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {deviceData.summary.offline}
                    </Typography>
                    <Typography variant="body2">Offline</Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40 }} />
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
                      {deviceData.summary.avgSuccessRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">Taxa Média</Typography>
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
                Atividade por Hora (Últimas 24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={deviceData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Bar yAxisId="left" dataKey="activeDevices" fill="#1976d2" name="Dispositivos Ativos" />
                  <Line yAxisId="right" type="monotone" dataKey="totalTasks" stroke="#4caf50" strokeWidth={2} name="Total Tarefas" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Fabricante
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData.manufacturerDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {deviceData.manufacturerDistribution.map((entry, index) => (
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

      {/* Devices List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Dispositivos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Última Atividade</TableCell>
                  <TableCell>Tarefas</TableCell>
                  <TableCell>Taxa de Sucesso</TableCell>
                  <TableCell>Bateria</TableCell>
                  <TableCell>Memória</TableCell>
                  <TableCell>Armazenamento</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deviceData.devices.map((device) => (
                  <TableRow key={device.deviceId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <Smartphone />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {device.deviceName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {device.manufacturer} • {device.androidVersion}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={device.isOnline ? <CheckCircle /> : <Error />}
                        label={device.isOnline ? 'Online' : 'Offline'}
                        color={device.isOnline ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.lastSeen}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.completedTasks}/{device.totalTasks}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(device.completedTasks / device.totalTasks) * 100} 
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${device.successRate.toFixed(1)}%`}
                        color={device.successRate >= 95 ? 'success' : device.successRate >= 90 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {device.batteryLevel}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={device.batteryLevel} 
                          sx={{ width: 40, height: 4, borderRadius: 2 }}
                          color={device.batteryLevel > 50 ? 'success' : device.batteryLevel > 20 ? 'warning' : 'error'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.memoryUsage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.storageUsage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Top Performers and Problematic Devices */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <List>
                {deviceData.topPerformers.map((device, index) => (
                  <ListItem key={device.deviceId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: ['#4caf50', '#2196f3', '#ff9800'][index % 3] }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={device.deviceName}
                      secondary={`${device.totalTasks} tarefas • ${device.avgExecutionTime}s média`}
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
                Dispositivos com Problemas
              </Typography>
              {deviceData.problematicDevices.length > 0 ? (
                <List>
                  {deviceData.problematicDevices.map((device) => (
                    <ListItem key={device.deviceId}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={device.deviceName}
                        secondary={`${device.failedTasks} falhas • ${device.issues.join(', ')}`}
                      />
                      <Chip
                        label={`${device.successRate.toFixed(1)}%`}
                        color="error"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Nenhum dispositivo com problemas encontrado
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default AnalyticsDevices;

