import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  LinearProgress,
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
  TableRow
} from '@mui/material';
import {
  Phone,
  WhatsApp,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Settings,
  Notifications,
  Person,
  Group,
  Message,
  Call,
  VideoCall,
  PhotoCamera,
  Mic,
  Send,
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
  Analytics,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  ShowChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Timer,
  HourglassEmpty,
  HourglassFull,
  Schedule as ScheduleIcon,
  Event,
  Today,
  DateRange,
  AccessTime as AccessTimeIcon,
  Update as UpdateIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  CloudSync,
  CloudDone,
  CloudOff,
  WifiOff,
  SignalCellular0Bar,
  SignalCellular1Bar,
  SignalCellular2Bar,
  SignalCellular3Bar,
  SignalCellular4Bar as SignalCellular4BarIcon,
  Battery20,
  Battery30,
  Battery50,
  Battery60,
  Battery80,
  Battery90 as Battery90Icon,
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
  DataUsage as DataUsageIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface AndroidDevice {
  id: string;
  name: string;
  model: string;
  androidVersion: string;
  status: 'online' | 'offline' | 'error' | 'warming' | 'charging' | 'updating';
  battery: {
    level: number;
    charging: boolean;
    temperature: number;
  };
  network: {
    wifi: boolean;
    signal: number;
    dataUsage: number;
    bluetooth: boolean;
  };
  storage: {
    total: number;
    used: number;
    available: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
  };
  performance: {
    cpu: number;
    ram: number;
    temperature: number;
  };
  whatsapp: {
    status: 'connected' | 'disconnected' | 'error';
    lastActivity: string;
    currentTask: string;
    progress: number;
  };
  tasks: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  lastSeen: string;
  ip: string;
  mac: string;
}

interface ControlCommand {
  id: string;
  deviceId: string;
  type: 'start' | 'stop' | 'pause' | 'restart' | 'update' | 'configure';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: string;
  result?: any;
  error?: string;
}

const AndroidControl: React.FC = () => {
  const [devices, setDevices] = useState<AndroidDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [commands, setCommands] = useState<ControlCommand[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockDevices: AndroidDevice[] = [
      {
        id: '1',
        name: 'Samsung Galaxy S21',
        model: 'SM-G991B',
        androidVersion: 'Android 12',
        status: 'warming',
        battery: {
          level: 85,
          charging: false,
          temperature: 35
        },
        network: {
          wifi: true,
          signal: 4,
          dataUsage: 2.5,
          bluetooth: true
        },
        storage: {
          total: 128,
          used: 45,
          available: 83
        },
        memory: {
          total: 8,
          used: 4.2,
          available: 3.8
        },
        performance: {
          cpu: 45,
          ram: 52,
          temperature: 38
        },
        whatsapp: {
          status: 'connected',
          lastActivity: '2 minutos atrás',
          currentTask: 'Enviando mensagem para contato 5',
          progress: 75
        },
        tasks: {
          total: 210,
          completed: 95,
          failed: 3,
          pending: 112
        },
        lastSeen: 'Agora',
        ip: '192.168.1.100',
        mac: 'AA:BB:CC:DD:EE:FF'
      },
      {
        id: '2',
        name: 'Xiaomi Redmi Note 10',
        model: 'M2101K7AG',
        androidVersion: 'Android 11',
        status: 'online',
        battery: {
          level: 92,
          charging: true,
          temperature: 32
        },
        network: {
          wifi: true,
          signal: 5,
          dataUsage: 1.8,
          bluetooth: false
        },
        storage: {
          total: 64,
          used: 28,
          available: 36
        },
        memory: {
          total: 6,
          used: 3.1,
          available: 2.9
        },
        performance: {
          cpu: 38,
          ram: 48,
          temperature: 35
        },
        whatsapp: {
          status: 'connected',
          lastActivity: 'Agora',
          currentTask: 'Fazendo chamada de vídeo',
          progress: 90
        },
        tasks: {
          total: 210,
          completed: 164,
          failed: 1,
          pending: 45
        },
        lastSeen: 'Agora',
        ip: '192.168.1.101',
        mac: '11:22:33:44:55:66'
      },
      {
        id: '3',
        name: 'Motorola Moto G60',
        model: 'XT2135-2',
        androidVersion: 'Android 11',
        status: 'error',
        battery: {
          level: 23,
          charging: false,
          temperature: 42
        },
        network: {
          wifi: false,
          signal: 2,
          dataUsage: 0.5,
          bluetooth: true
        },
        storage: {
          total: 128,
          used: 115,
          available: 13
        },
        memory: {
          total: 6,
          used: 5.8,
          available: 0.2
        },
        performance: {
          cpu: 78,
          ram: 95,
          temperature: 45
        },
        whatsapp: {
          status: 'error',
          lastActivity: '1 hora atrás',
          currentTask: 'Erro de conexão',
          progress: 0
        },
        tasks: {
          total: 210,
          completed: 25,
          failed: 8,
          pending: 177
        },
        lastSeen: '1 hora atrás',
        ip: '192.168.1.102',
        mac: 'AA:11:BB:22:CC:33'
      }
    ];

    setDevices(mockDevices);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'warming': return 'warning';
      case 'error': return 'error';
      case 'offline': return 'default';
      case 'charging': return 'info';
      case 'updating': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle />;
      case 'warming': return <TrendingUp />;
      case 'error': return <Error />;
      case 'offline': return <Warning />;
      case 'charging': return <BatteryChargingFull />;
      case 'updating': return <Update />;
      default: return <Info />;
    }
  };

  const getBatteryIcon = (level: number, charging: boolean) => {
    if (charging) {
      if (level >= 90) return <BatteryChargingFull />;
      if (level >= 80) return <BatteryCharging90 />;
      if (level >= 60) return <BatteryCharging80 />;
      if (level >= 50) return <BatteryCharging60 />;
      if (level >= 30) return <BatteryCharging50 />;
      if (level >= 20) return <BatteryCharging30 />;
      return <BatteryCharging20 />;
    } else {
      if (level >= 90) return <BatteryFull />;
      if (level >= 80) return <Battery90Icon />;
      if (level >= 60) return <Battery80 />;
      if (level >= 50) return <Battery60 />;
      if (level >= 30) return <Battery50 />;
      if (level >= 20) return <Battery30 />;
      return <Battery20 />;
    }
  };

  const getSignalIcon = (signal: number) => {
    switch (signal) {
      case 5: return <SignalCellular4BarIcon />;
      case 4: return <SignalCellular4BarIcon />;
      case 3: return <SignalCellular3Bar />;
      case 2: return <SignalCellular2Bar />;
      case 1: return <SignalCellular1Bar />;
      default: return <SignalCellular0Bar />;
    }
  };

  const handleDeviceClick = (device: AndroidDevice) => {
    setSelectedDevice(device);
    setDialogOpen(true);
  };

  const handleControlAction = (action: string, deviceId: string) => {
    const command: ControlCommand = {
      id: Date.now().toString(),
      deviceId,
      type: action as any,
      status: 'executing',
      timestamp: new Date().toISOString()
    };

    setCommands(prev => [...prev, command]);
    setSnackbar({
      open: true,
      message: `Comando ${action} enviado para o dispositivo ${deviceId}`,
      severity: 'success'
    });

    // Simular execução do comando
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === command.id 
          ? { ...cmd, status: 'completed', result: 'Comando executado com sucesso' }
          : cmd
      ));
    }, 2000);
  };

  const handleBulkAction = (action: string) => {
    devices.forEach(device => {
      handleControlAction(action, device.id);
    });
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Controle Android
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gerenciamento em tempo real dos dispositivos Android
        </Typography>
      </Box>

      {/* Bulk Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ações em Massa
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => handleBulkAction('start')}
            >
              Iniciar Todos
            </Button>
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={() => handleBulkAction('pause')}
            >
              Pausar Todos
            </Button>
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={() => handleBulkAction('stop')}
            >
              Parar Todos
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={() => handleBulkAction('restart')}
            >
              Reiniciar Todos
            </Button>
            <Button
              variant="outlined"
              startIcon={<Update />}
              onClick={() => handleBulkAction('update')}
            >
              Atualizar Todos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Devices Grid */}
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} md={6} lg={4} key={device.id}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedDevice?.id === device.id ? 2 : 1,
                  borderColor: selectedDevice?.id === device.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handleDeviceClick(device)}
              >
                <CardContent>
                  {/* Device Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Smartphone />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {device.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {device.model}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={getStatusIcon(device.status)}
                      label={device.status}
                      color={getStatusColor(device.status) as any}
                      size="small"
                    />
                  </Box>

                  {/* Battery and Network */}
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center">
                      {getBatteryIcon(device.battery.level, device.battery.charging)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {device.battery.level}%
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {device.network.wifi ? <WifiIcon /> : <WifiOff />}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {device.network.wifi ? 'WiFi' : 'Dados'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {getSignalIcon(device.network.signal)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {device.network.signal}/5
                      </Typography>
                    </Box>
                  </Box>

                  {/* WhatsApp Status */}
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">WhatsApp</Typography>
                      <Chip
                        label={device.whatsapp.status}
                        size="small"
                        color={device.whatsapp.status === 'connected' ? 'success' : device.whatsapp.status === 'error' ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {device.whatsapp.currentTask}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={device.whatsapp.progress} 
                      sx={{ mt: 1, height: 4 }}
                    />
                  </Box>

                  {/* Performance */}
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      CPU: {device.performance.cpu}%
                    </Typography>
                    <Typography variant="body2">
                      RAM: {device.performance.ram}%
                    </Typography>
                    <Typography variant="body2">
                      Temp: {device.performance.temperature}°C
                    </Typography>
                  </Box>

                  {/* Tasks Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">Tarefas</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {device.tasks.completed}/{device.tasks.total}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(device.tasks.completed / device.tasks.total) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Control Buttons */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {device.lastSeen}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlAction('start', device.id);
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlAction('pause', device.id);
                        }}
                      >
                        <Pause />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlAction('stop', device.id);
                        }}
                      >
                        <Stop />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlAction('restart', device.id);
                        }}
                      >
                        <RestartAlt />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Device Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedDevice && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedDevice.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedDevice.model} • {selectedDevice.androidVersion}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedDevice.status)}
                  label={selectedDevice.status}
                  color={getStatusColor(selectedDevice.status) as any}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Visão Geral" />
                <Tab label="Performance" />
                <Tab label="Rede" />
                <Tab label="Armazenamento" />
                <Tab label="WhatsApp" />
                <Tab label="Comandos" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Informações Gerais
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            IP Address
                          </Typography>
                          <Typography variant="h6">
                            {selectedDevice.ip}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            MAC Address
                          </Typography>
                          <Typography variant="h6">
                            {selectedDevice.mac}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Última Atividade
                          </Typography>
                          <Typography variant="h6">
                            {selectedDevice.lastSeen}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Status WhatsApp
                          </Typography>
                          <Typography variant="h6">
                            {selectedDevice.whatsapp.status}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Performance do Sistema
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <SpeedIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.performance.cpu}%
                            </Typography>
                          </Box>
                          <Typography variant="body2">CPU</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <MemoryIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.performance.ram}%
                            </Typography>
                          </Box>
                          <Typography variant="body2">RAM</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <TrendingUpIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.performance.temperature}°C
                            </Typography>
                          </Box>
                          <Typography variant="body2">Temperatura</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Status da Rede
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            {selectedDevice.network.wifi ? <WifiIcon /> : <WifiOff />}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {selectedDevice.network.wifi ? 'Conectado' : 'Desconectado'}
                            </Typography>
                          </Box>
                          <Typography variant="body2">WiFi</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            {getSignalIcon(selectedDevice.network.signal)}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {selectedDevice.network.signal}/5
                            </Typography>
                          </Box>
                          <Typography variant="body2">Sinal</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <DataUsageIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.network.dataUsage} GB
                            </Typography>
                          </Box>
                          <Typography variant="body2">Uso de Dados</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            {selectedDevice.network.bluetooth ? <BluetoothIcon /> : <BluetoothIcon color="disabled" />}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {selectedDevice.network.bluetooth ? 'Ativo' : 'Inativo'}
                            </Typography>
                          </Box>
                          <Typography variant="body2">Bluetooth</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Armazenamento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <StorageIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.storage.used} GB / {selectedDevice.storage.total} GB
                            </Typography>
                          </Box>
                          <Typography variant="body2">Armazenamento</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(selectedDevice.storage.used / selectedDevice.storage.total) * 100} 
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <MemoryIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedDevice.memory.used} GB / {selectedDevice.memory.total} GB
                            </Typography>
                          </Box>
                          <Typography variant="body2">Memória RAM</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(selectedDevice.memory.used / selectedDevice.memory.total) * 100} 
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Status WhatsApp
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            {selectedDevice.whatsapp.status}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Última Atividade
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            {selectedDevice.whatsapp.lastActivity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tarefa Atual
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            {selectedDevice.whatsapp.currentTask}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2">Progresso</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {selectedDevice.whatsapp.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={selectedDevice.whatsapp.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 5 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Histórico de Comandos
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Comando</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Resultado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commands
                          .filter(cmd => cmd.deviceId === selectedDevice.id)
                          .map((command) => (
                            <TableRow key={command.id}>
                              <TableCell>{command.type}</TableCell>
                              <TableCell>
                                <Chip
                                  label={command.status}
                                  size="small"
                                  color={command.status === 'completed' ? 'success' : command.status === 'failed' ? 'error' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>{new Date(command.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{command.result || command.error || '-'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleControlAction('configure', selectedDevice.id);
                  setDialogOpen(false);
                }}
              >
                Configurar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

export default AndroidControl; 