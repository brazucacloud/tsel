import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useQuery } from 'react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Download, Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import apiService from '../services/api';
import { AnalyticsData } from '../types';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>(
    'analytics-detailed',
    apiService.getAnalytics,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const { data: taskAnalytics } = useQuery(
    'task-analytics',
    apiService.getTaskAnalytics
  );

  const { data: deviceAnalytics } = useQuery(
    'device-analytics',
    apiService.getDeviceAnalytics
  );

  // Sample data for charts
  const performanceData = [
    { day: 'Seg', tasks: 45, devices: 12, success: 89 },
    { day: 'Ter', tasks: 52, devices: 15, success: 92 },
    { day: 'Qua', tasks: 38, devices: 10, success: 85 },
    { day: 'Qui', tasks: 61, devices: 18, success: 94 },
    { day: 'Sex', tasks: 48, devices: 14, success: 91 },
    { day: 'Sáb', tasks: 35, devices: 8, success: 87 },
    { day: 'Dom', tasks: 42, devices: 11, success: 90 },
  ];

  const taskTypeData = [
    { name: 'Mensagens', value: 35, color: '#1976d2' },
    { name: 'Chamadas', value: 20, color: '#10B981' },
    { name: 'Grupos', value: 15, color: '#F59E0B' },
    { name: 'Status', value: 10, color: '#EF4444' },
    { name: 'Contatos', value: 8, color: '#8B5CF6' },
    { name: 'Mídia', value: 12, color: '#06B6D4' },
  ];

  const deviceStatusData = [
    { name: 'Online', value: analytics?.overview.onlineDevices || 0, color: '#10B981' },
    { name: 'Offline', value: (analytics?.overview.totalDevices || 0) - (analytics?.overview.onlineDevices || 0), color: '#64748B' },
    { name: 'Ocupado', value: 3, color: '#F59E0B' },
    { name: 'Erro', value: 1, color: '#EF4444' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const handleExport = async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    try {
      const blob = await apiService.exportAnalytics(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar dados de analytics: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Analytics Detalhado
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise completa e relatórios do sistema de aquecimento de chip
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={selectedPeriod}
                label="Período"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="1d">Último dia</MenuItem>
                <MenuItem value="7d">Última semana</MenuItem>
                <MenuItem value="30d">Último mês</MenuItem>
                <MenuItem value="90d">Últimos 3 meses</MenuItem>
              </Select>
            </FormControl>
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
              onClick={() => handleExport('csv')}
              variant="contained"
            >
              Exportar
            </Button>
          </Stack>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {analytics?.overview.totalDevices || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Dispositivos
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +12.5%
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {analytics?.overview.completedTasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tarefas Concluídas
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +8.2%
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                {analytics?.overview.successRate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taxa de Sucesso
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingDown fontSize="small" color="error" />
                <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                  -2.1%
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {analytics?.overview.averageCompletionTime || 0}s
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tempo Médio de Conclusão
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  -5.3%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Performance Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Performance Semanal
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stackId="1"
                    stroke="#1976d2"
                    fill="#1976d2"
                    fillOpacity={0.6}
                    name="Tarefas"
                  />
                  <Area
                    type="monotone"
                    dataKey="devices"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Dispositivos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Task Types Chart */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Tipos de Tarefas
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Analytics */}
        <Grid container spacing={3}>
          {/* Device Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Status dos Dispositivos
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Task Success Rate */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Taxa de Sucesso por Dia
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Taxa de Sucesso (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Device Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance dos Dispositivos
              </Typography>
              <Grid container spacing={2}>
                {analytics?.devices?.performance?.slice(0, 6).map((device, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {device.deviceName}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Taxa de Sucesso
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              {device.successRate}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Tempo Médio
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {device.averageCompletionTime}s
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`${device.completedTasks}/${device.totalTasks} tarefas`}
                            size="small"
                            color="info"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* System Health */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Saúde do Sistema
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      99.8%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      45ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latência Média
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      0.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taxa de Erro
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      1.2K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tarefas/hora
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Analytics; 