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
  FormControlLabel
} from '@mui/material';
import {
  Phone,
  WhatsApp,
  Timeline,
  Analytics,
  Add,
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
  StorageOutlined,
  MemoryOutlined,
  NetworkCheckOutlined,
  Battery90Outlined,
  SignalCellular4BarOutlined,
  WifiOutlined,
  BluetoothOutlined,
  DataUsageOutlined
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

interface WhatsAppNumber {
  id: string;
  number: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'warming';
  progress: number;
  currentDay: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  lastActivity: string;
  deviceInfo: {
    model: string;
    androidVersion: string;
    battery: number;
    signal: number;
    wifi: boolean;
    storage: number;
  };
  tasks: Task[];
}

interface Task {
  id: string;
  type: 'message' | 'call' | 'video_call' | 'group' | 'status' | 'media' | 'profile';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  day: number;
  time: string;
  description: string;
  progress: number;
  result?: any;
  error?: string;
}

interface DashboardStats {
  totalNumbers: number;
  onlineNumbers: number;
  warmingNumbers: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageProgress: number;
}

const Dashboard: React.FC = () => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalNumbers: 0,
    onlineNumbers: 0,
    warmingNumbers: 0,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    successRate: 0,
    averageProgress: 0
  });
  const [selectedNumber, setSelectedNumber] = useState<WhatsAppNumber | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Mock data for demonstration
  useEffect(() => {
    const mockNumbers: WhatsAppNumber[] = [
      {
        id: '1',
        number: '+55 11 99999-9999',
        name: 'WhatsApp Principal',
        status: 'warming',
        progress: 45,
        currentDay: 10,
        totalTasks: 210,
        completedTasks: 95,
        failedTasks: 3,
        lastActivity: '2 minutos atrás',
        deviceInfo: {
          model: 'Samsung Galaxy S21',
          androidVersion: 'Android 12',
          battery: 85,
          signal: 4,
          wifi: true,
          storage: 75
        },
        tasks: generateMockTasks(10)
      },
      {
        id: '2',
        number: '+55 11 88888-8888',
        name: 'WhatsApp Business',
        status: 'online',
        progress: 78,
        currentDay: 16,
        totalTasks: 210,
        completedTasks: 164,
        failedTasks: 1,
        lastActivity: 'Agora',
        deviceInfo: {
          model: 'Xiaomi Redmi Note 10',
          androidVersion: 'Android 11',
          battery: 92,
          signal: 5,
          wifi: true,
          storage: 45
        },
        tasks: generateMockTasks(16)
      },
      {
        id: '3',
        number: '+55 11 77777-7777',
        name: 'WhatsApp Backup',
        status: 'error',
        progress: 12,
        currentDay: 3,
        totalTasks: 210,
        completedTasks: 25,
        failedTasks: 8,
        lastActivity: '1 hora atrás',
        deviceInfo: {
          model: 'Motorola Moto G60',
          androidVersion: 'Android 11',
          battery: 23,
          signal: 2,
          wifi: false,
          storage: 90
        },
        tasks: generateMockTasks(3)
      }
    ];

    setNumbers(mockNumbers);
    calculateStats(mockNumbers);
    setLoading(false);
  }, []);

  const generateMockTasks = (currentDay: number): Task[] => {
    const tasks: Task[] = [];
    const taskTypes = ['message', 'call', 'video_call', 'group', 'status', 'media', 'profile'];
    
    for (let day = 1; day <= currentDay; day++) {
      const dayTasks = Math.floor(Math.random() * 15) + 5; // 5-20 tasks per day
      
      for (let i = 0; i < dayTasks; i++) {
        tasks.push({
          id: `${day}-${i}`,
          type: taskTypes[Math.floor(Math.random() * taskTypes.length)] as any,
          status: day < currentDay ? 'completed' : day === currentDay ? 'running' : 'pending',
          day,
          time: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          description: `Tarefa ${i + 1} do dia ${day}`,
          progress: day < currentDay ? 100 : day === currentDay ? Math.floor(Math.random() * 100) : 0
        });
      }
    }
    
    return tasks;
  };

  const calculateStats = (numbers: WhatsAppNumber[]) => {
    const totalNumbers = numbers.length;
    const onlineNumbers = numbers.filter(n => n.status === 'online').length;
    const warmingNumbers = numbers.filter(n => n.status === 'warming').length;
    const totalTasks = numbers.reduce((sum, n) => sum + n.totalTasks, 0);
    const completedTasks = numbers.reduce((sum, n) => sum + n.completedTasks, 0);
    const failedTasks = numbers.reduce((sum, n) => sum + n.failedTasks, 0);
    const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100) : 0;
    const averageProgress = numbers.length > 0 ? numbers.reduce((sum, n) => sum + n.progress, 0) / numbers.length : 0;

    setStats({
      totalNumbers,
      onlineNumbers,
      warmingNumbers,
      totalTasks,
      completedTasks,
      failedTasks,
      successRate,
      averageProgress
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'warming': return 'warning';
      case 'error': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle />;
      case 'warming': return <TrendingUp />;
      case 'error': return <Error />;
      case 'offline': return <Warning />;
      default: return <Info />;
    }
  };

  const handleNumberClick = (number: WhatsAppNumber) => {
    setSelectedNumber(number);
    setDialogOpen(true);
  };

  const handleControlAction = (action: string, numberId: string) => {
    setSnackbar({
      open: true,
      message: `Ação ${action} executada para o número ${numberId}`,
      severity: 'success'
    });
  };

  const chartData = [
    { day: 1, tasks: 12, completed: 11, failed: 1 },
    { day: 2, tasks: 15, completed: 14, failed: 1 },
    { day: 3, tasks: 18, completed: 16, failed: 2 },
    { day: 4, tasks: 20, completed: 19, failed: 1 },
    { day: 5, tasks: 22, completed: 21, failed: 1 },
    { day: 6, tasks: 25, completed: 24, failed: 1 },
    { day: 7, tasks: 28, completed: 26, failed: 2 },
    { day: 8, tasks: 30, completed: 28, failed: 2 },
    { day: 9, tasks: 32, completed: 30, failed: 2 },
    { day: 10, tasks: 35, completed: 33, failed: 2 },
    { day: 11, tasks: 38, completed: 36, failed: 2 },
    { day: 12, tasks: 40, completed: 38, failed: 2 },
    { day: 13, tasks: 42, completed: 40, failed: 2 },
    { day: 14, tasks: 45, completed: 43, failed: 2 },
    { day: 15, tasks: 48, completed: 46, failed: 2 },
    { day: 16, tasks: 50, completed: 48, failed: 2 },
    { day: 17, tasks: 52, completed: 50, failed: 2 },
    { day: 18, tasks: 55, completed: 53, failed: 2 },
    { day: 19, tasks: 58, completed: 56, failed: 2 },
    { day: 20, tasks: 60, completed: 58, failed: 2 },
    { day: 21, tasks: 62, completed: 60, failed: 2 }
  ];

  const pieData = [
    { name: 'Completadas', value: stats.completedTasks, color: '#4caf50' },
    { name: 'Falhadas', value: stats.failedTasks, color: '#f44336' },
    { name: 'Pendentes', value: stats.totalTasks - stats.completedTasks - stats.failedTasks, color: '#ff9800' }
  ];

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
          Dashboard TSEL
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Gerenciamento de Aquecimento de Chips WhatsApp - 21 Dias
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalNumbers}
                    </Typography>
                    <Typography variant="body2">Números Ativos</Typography>
                  </Box>
                  <WhatsApp sx={{ fontSize: 40 }} />
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
                      {stats.onlineNumbers}
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
                      {stats.warmingNumbers}
                    </Typography>
                    <Typography variant="body2">Aquecendo</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40 }} />
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
                      {stats.successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">Taxa de Sucesso</Typography>
                  </Box>
                  <Analytics sx={{ fontSize: 40 }} />
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
                Progresso dos 21 Dias
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição de Tarefas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WhatsApp Numbers List */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Números WhatsApp
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSnackbar({ open: true, message: 'Funcionalidade de adicionar número em desenvolvimento', severity: 'info' })}
            >
              Adicionar Número
            </Button>
          </Box>

          <Grid container spacing={2}>
            {numbers.map((number) => (
              <Grid item xs={12} md={6} lg={4} key={number.id}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedNumber?.id === number.id ? 2 : 1,
                      borderColor: selectedNumber?.id === number.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => handleNumberClick(number)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <Phone />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {number.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {number.number}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={getStatusIcon(number.status)}
                          label={number.status}
                          color={getStatusColor(number.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Progresso</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {number.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={number.progress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Dia {number.currentDay}/21
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {number.completedTasks}/{number.totalTasks} tarefas
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {number.lastActivity}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleControlAction('play', number.id);
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleControlAction('pause', number.id);
                            }}
                          >
                            <Pause />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleControlAction('stop', number.id);
                            }}
                          >
                            <Stop />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Number Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedNumber && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedNumber.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedNumber.number}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedNumber.status)}
                  label={selectedNumber.status}
                  color={getStatusColor(selectedNumber.status) as any}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Tarefas" />
                <Tab label="Dispositivo" />
                <Tab label="Estatísticas" />
                <Tab label="Configurações" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Tarefas do Dia {selectedNumber.currentDay}
                  </Typography>
                  <List>
                    {selectedNumber.tasks
                      .filter(task => task.day === selectedNumber.currentDay)
                      .map((task) => (
                        <ListItem key={task.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: task.status === 'completed' ? 'success.main' : task.status === 'failed' ? 'error.main' : 'warning.main' }}>
                              {task.type === 'message' && <Message />}
                              {task.type === 'call' && <Call />}
                              {task.type === 'video_call' && <VideoCall />}
                              {task.type === 'group' && <Group />}
                              {task.type === 'status' && <PhotoCamera />}
                              {task.type === 'media' && <Mic />}
                              {task.type === 'profile' && <Person />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={task.description}
                            secondary={`${task.time} - ${task.status}`}
                          />
                          <Box display="flex" alignItems="center">
                            <LinearProgress 
                              variant="determinate" 
                              value={task.progress} 
                              sx={{ width: 100, mr: 2 }}
                            />
                            <Typography variant="body2">
                              {task.progress}%
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Informações do Dispositivo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Modelo
                          </Typography>
                          <Typography variant="h6">
                            {selectedNumber.deviceInfo.model}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Android
                          </Typography>
                          <Typography variant="h6">
                            {selectedNumber.deviceInfo.androidVersion}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Battery90 sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedNumber.deviceInfo.battery}%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <SignalCellular4Bar sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedNumber.deviceInfo.signal}/5
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Wifi sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedNumber.deviceInfo.wifi ? 'Conectado' : 'Desconectado'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={3}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Storage sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {selectedNumber.deviceInfo.storage}%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Estatísticas Detalhadas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: 'Completadas', value: selectedNumber.completedTasks },
                          { name: 'Falhadas', value: selectedNumber.failedTasks },
                          { name: 'Pendentes', value: selectedNumber.totalTasks - selectedNumber.completedTasks - selectedNumber.failedTasks }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Métricas
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Taxa de Sucesso"
                              secondary={`${((selectedNumber.completedTasks / selectedNumber.totalTasks) * 100).toFixed(1)}%`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Tarefas por Dia"
                              secondary={`${Math.round(selectedNumber.totalTasks / 21)}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Tempo Médio por Tarefa"
                              secondary="2.5 minutos"
                            />
                          </ListItem>
                        </List>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Configurações do Dispositivo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Execução Automática"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Notificações"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch />}
                        label="Modo Silencioso"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Intervalo entre Tarefas (minutos)"
                        type="number"
                        defaultValue={5}
                        sx={{ mt: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              <Button variant="contained" onClick={() => setSnackbar({ open: true, message: 'Configurações salvas com sucesso', severity: 'success' })}>
                Salvar
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

export default Dashboard; 