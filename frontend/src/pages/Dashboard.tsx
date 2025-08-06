import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Schedule,
  PlayArrow,
  Stop,
  Pause,
  MoreVert,
  Download,
  Settings,
  Notifications,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useQuery } from 'react-query';
import DashboardCard from '../components/DashboardCard';
import StatusChip from '../components/StatusChip';
import apiService from '../services/api';
import webSocketService from '../services/websocket';
import { DashboardCard as DashboardCardType, AnalyticsData, Device, Task } from '../types';

const Dashboard: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>(
    'analytics',
    apiService.getAnalytics,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000,
    }
  );

  // Fetch devices
  const { data: devicesData } = useQuery(
    'devices',
    () => apiService.getDevices(1, 10),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  // Fetch recent tasks
  const { data: tasksData } = useQuery(
    'recent-tasks',
    () => apiService.getTasks(1, 10),
    {
      refetchInterval: 20000, // Refresh every 20 seconds
    }
  );

  useEffect(() => {
    // Subscribe to real-time updates
    webSocketService.subscribeToAnalytics();

    // Listen for real-time updates
    webSocketService.on('analytics_update', (data) => {
      setRealTimeData(data);
    });

    webSocketService.on('system_alert', (alert) => {
      setNotifications(prev => [alert, ...prev.slice(0, 9)]);
    });

    webSocketService.on('device_status', (deviceStatus) => {
      // Update device status in real-time
      console.log('Device status update:', deviceStatus);
    });

    webSocketService.on('task_update', (taskUpdate) => {
      // Update task status in real-time
      console.log('Task update:', taskUpdate);
    });

    return () => {
      webSocketService.unsubscribeFromAnalytics();
      webSocketService.off('analytics_update');
      webSocketService.off('system_alert');
      webSocketService.off('device_status');
      webSocketService.off('task_update');
    };
  }, []);

  const dashboardCards: DashboardCardType[] = [
    {
      title: 'Dispositivos Ativos',
      value: analytics?.overview.onlineDevices || 0,
      change: 12.5,
      changeType: 'increase',
      icon: 'smartphone',
      color: 'primary',
    },
    {
      title: 'Tarefas Concluídas',
      value: analytics?.overview.completedTasks || 0,
      change: 8.2,
      changeType: 'increase',
      icon: 'check_circle',
      color: 'success',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${analytics?.overview.successRate || 0}%`,
      change: -2.1,
      changeType: 'decrease',
      icon: 'trending_up',
      color: 'info',
    },
    {
      title: 'Dias de Aquecimento',
      value: analytics?.overview.activeWarmupDays || 0,
      change: 0,
      changeType: 'increase',
      icon: 'calendar_today',
      color: 'warning',
    },
  ];

  const chartData = [
    { name: 'Seg', tarefas: 45, dispositivos: 12, sucesso: 89 },
    { name: 'Ter', tarefas: 52, dispositivos: 15, sucesso: 92 },
    { name: 'Qua', tarefas: 38, dispositivos: 10, sucesso: 85 },
    { name: 'Qui', tarefas: 61, dispositivos: 18, sucesso: 94 },
    { name: 'Sex', tarefas: 48, dispositivos: 14, sucesso: 91 },
    { name: 'Sáb', tarefas: 35, dispositivos: 8, sucesso: 87 },
    { name: 'Dom', tarefas: 42, dispositivos: 11, sucesso: 90 },
  ];

  const taskStatusData = [
    { name: 'Concluídas', value: analytics?.overview.completedTasks || 0, color: '#10B981' },
    { name: 'Pendentes', value: analytics?.overview.totalTasks - (analytics?.overview.completedTasks || 0) || 0, color: '#F59E0B' },
    { name: 'Falharam', value: analytics?.overview.failedTasks || 0, color: '#EF4444' },
  ];

  const deviceStatusData = [
    { name: 'Online', value: analytics?.overview.onlineDevices || 0, color: '#10B981' },
    { name: 'Offline', value: (analytics?.overview.totalDevices || 0) - (analytics?.overview.onlineDevices || 0), color: '#64748B' },
    { name: 'Ocupado', value: 3, color: '#F59E0B' },
    { name: 'Erro', value: 1, color: '#EF4444' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar dados do dashboard: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitoramento em tempo real do sistema de aquecimento de chip
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Refresh />}
            onClick={() => refetch()}
            variant="outlined"
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button
            startIcon={<Download />}
            onClick={() => apiService.exportAnalytics()}
            variant="outlined"
          >
            Exportar
          </Button>
        </Stack>
      </Box>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {notifications.slice(0, 3).map((notification, index) => (
            <Alert
              key={index}
              severity={notification.level}
              sx={{ mb: 1 }}
              onClose={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
            >
              {notification.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} />
            ) : (
              <DashboardCard card={card} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Performance Semanal
            </Typography>
            {isLoading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="tarefas"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Tarefas"
                  />
                  <Line
                    type="monotone"
                    dataKey="dispositivos"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Dispositivos"
                  />
                  <Line
                    type="monotone"
                    dataKey="sucesso"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Taxa de Sucesso (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Status Charts */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Task Status */}
            <Paper sx={{ p: 3, height: 190 }}>
              <Typography variant="h6" gutterBottom>
                Status das Tarefas
              </Typography>
              {isLoading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>

            {/* Device Status */}
            <Paper sx={{ p: 3, height: 190 }}>
              <Typography variant="h6" gutterBottom>
                Status dos Dispositivos
              </Typography>
              {isLoading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Real-time Monitoring */}
      <Grid container spacing={3}>
        {/* Active Devices */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Dispositivos Ativos
              </Typography>
              <StatusChip status="online" />
            </Box>
            {isLoading ? (
              <Stack spacing={1}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {devicesData?.data?.slice(0, 5).map((device: Device) => (
                  <Box
                    key={device.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {device.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {device.model} • {device.os}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <StatusChip status={device.status} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          Dia {device.currentDay} • {device.completedTasks}/{device.totalTasks} tarefas
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Bateria: {device.batteryLevel}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sinal: {device.signalStrength}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Tarefas Recentes
              </Typography>
              <Button size="small" variant="text">
                Ver todas
              </Button>
            </Box>
            {isLoading ? (
              <Stack spacing={1}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {tasksData?.data?.slice(0, 5).map((task: Task) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {task.title}
                      </Typography>
                      <StatusChip status={task.status} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Dispositivo: {task.deviceId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(task.createdAt).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* System Health */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saúde do Sistema
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                99.8%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={99.8}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Latência Média
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                45ms
              </Typography>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Taxa de Erro
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                0.2%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={98}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Conexões WebSocket
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {webSocketService.isSocketConnected() ? 'Ativo' : 'Inativo'}
              </Typography>
              <Chip
                label={webSocketService.isSocketConnected() ? 'Conectado' : 'Desconectado'}
                color={webSocketService.isSocketConnected() ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard; 