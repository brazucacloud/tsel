import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  FaDesktop, 
  FaMobile, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaCog,
  FaSync
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [devicesData, setDevicesData] = useState(null);
  const [tasksData, setTasksData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch overview data
      const overviewResponse = await axios.get('/api/analytics/overview', { headers });
      setOverviewData(overviewResponse.data.data);

      // Fetch devices data
      const devicesResponse = await axios.get(`/api/analytics/devices?period=${selectedPeriod}`, { headers });
      setDevicesData(devicesResponse.data.data);

      // Fetch tasks data
      const tasksResponse = await axios.get(`/api/analytics/tasks?period=${selectedPeriod}`, { headers });
      setTasksData(tasksResponse.data.data);

      // Fetch realtime data
      const realtimeResponse = await axios.get('/api/analytics/realtime', { headers });
      setRealtimeData(realtimeResponse.data.data);

    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Chart configurations
  const timelineChartData = {
    labels: overviewData?.timeline?.map(item => `${item._id}h`) || [],
    datasets: [
      {
        label: 'Tarefas Criadas',
        data: overviewData?.timeline?.map(item => 
          item.statuses.reduce((sum, status) => sum + status.count, 0)
        ) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const taskTypesChartData = {
    labels: overviewData?.taskTypes?.map(item => item.type.replace('_', ' ')) || [],
    datasets: [
      {
        label: 'Taxa de Sucesso (%)',
        data: overviewData?.taskTypes?.map(item => item.successRate) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const deviceStatusChartData = {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        data: [
          devicesData?.summary?.online || 0,
          devicesData?.summary?.offline || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const manufacturerChartData = {
    labels: devicesData?.manufacturerDistribution?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Dispositivos',
        data: devicesData?.manufacturerDistribution?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Monitoramento em tempo real do sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <FaSync />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaDesktop className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dispositivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewData?.overview?.totalDevices || 0}
              </p>
              <p className="text-sm text-green-600">
                {overviewData?.overview?.onlineDevices || 0} online
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaTasks className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewData?.overview?.totalTasks || 0}
              </p>
              <p className="text-sm text-green-600">
                {overviewData?.overview?.completedTasks || 0} completadas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <FaChartLine className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewData?.overview?.overallSuccessRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-600">Geral</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Falhas</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewData?.overview?.failedTasks || 0}
              </p>
              <p className="text-sm text-red-600">Últimas 24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade por Hora</h3>
          <Line 
            data={timelineChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Task Types Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Sucesso por Tipo</h3>
          <Bar 
            data={taskTypesChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Device Status and Manufacturer Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Dispositivos</h3>
          <div className="flex justify-center">
            <Doughnut 
              data={deviceStatusChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos por Fabricante</h3>
          <Pie 
            data={manufacturerChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Real-time Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {realtimeData?.recentActivity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'failed' ? 'bg-red-500' :
                    activity.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-600">{activity.deviceName}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
          <div className="space-y-3">
            {realtimeData?.alerts?.length > 0 ? (
              realtimeData.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-50 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  {alert.devices && (
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.devices.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                <p className="text-gray-600">Nenhum alerta ativo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers and Problematic Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Melhores Performances</h3>
          <div className="space-y-3">
            {devicesData?.topPerformers?.slice(0, 5).map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.deviceName}</p>
                  <p className="text-xs text-gray-600">{device.manufacturer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {device.successRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600">{device.totalTasks} tarefas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos com Problemas</h3>
          <div className="space-y-3">
            {devicesData?.problematicDevices?.slice(0, 5).map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.deviceName}</p>
                  <p className="text-xs text-gray-600">{device.manufacturer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    {device.failedTasks} falhas
                  </p>
                  <p className="text-xs text-gray-600">{device.totalTasks} total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 