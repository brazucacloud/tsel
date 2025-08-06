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
  FaWhatsapp, 
  FaPhone, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaExclamationTriangle,
  FaSearch,
  FaEye,
  FaDownload,
  FaRefresh
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

const WhatsAppAnalytics = () => {
  const [whatsappData, setWhatsappData] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [numberDetail, setNumberDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');

  const fetchWhatsAppData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`/api/analytics/whatsapp-numbers?period=${selectedPeriod}`, { headers });
      setWhatsappData(response.data.data);

    } catch (err) {
      setError('Erro ao carregar dados do WhatsApp');
      console.error('WhatsApp Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('/api/analytics/21-day-program', { headers });
      setProgramData(response.data.data);
    } catch (err) {
      console.error('Program data error:', err);
    }
  };

  const fetchNumberDetail = async (phone) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`/api/analytics/number-detail/${phone}?period=${selectedPeriod}`, { headers });
      setNumberDetail(response.data.data);
    } catch (err) {
      console.error('Number detail error:', err);
    }
  };

  useEffect(() => {
    fetchWhatsAppData();
    fetchProgramData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedNumber) {
      fetchNumberDetail(selectedNumber);
    }
  }, [selectedNumber, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
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
            onClick={fetchWhatsAppData}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Chart configurations
  const dailyActivityChartData = {
    labels: whatsappData?.dailyActivity?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Tarefas',
        data: whatsappData?.dailyActivity?.map(item => item.totalTasks) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Números Ativos',
        data: whatsappData?.dailyActivity?.map(item => item.activeNumbers) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4
      }
    ]
  };

  const successRateChartData = {
    labels: whatsappData?.dailyActivity?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Taxa de Sucesso (%)',
        data: whatsappData?.dailyActivity?.map(item => item.successRate) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const numberStatusChartData = {
    labels: ['Completadas', 'Falharam', 'Pendentes', 'Executando'],
    datasets: [
      {
        data: [
          whatsappData?.summary?.totalCompleted || 0,
          whatsappData?.summary?.totalFailed || 0,
          whatsappData?.numbers?.reduce((sum, num) => sum + num.pendingTasks, 0) || 0,
          whatsappData?.numbers?.reduce((sum, num) => sum + num.runningTasks, 0) || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const program21DaysChartData = {
    labels: numberDetail?.program21Days?.map(item => `Dia ${item.day}`) || [],
    datasets: [
      {
        label: 'Tarefas',
        data: numberDetail?.program21Days?.map(item => item.tasks) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Taxa de Sucesso (%)',
        data: numberDetail?.program21Days?.map(item => item.successRate) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaWhatsapp className="text-green-500 mr-3" />
              Analytics WhatsApp
            </h1>
            <p className="text-gray-600">Relatórios completos e programa de 21 dias</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
            <button 
              onClick={fetchWhatsAppData}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
            >
              <FaRefresh />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'program'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Programa 21 Dias
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'numbers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Números Detalhados
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <FaPhone className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Números Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {whatsappData?.summary?.totalNumbers || 0}
                  </p>
                  <p className="text-sm text-green-600">Últimos {selectedPeriod}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FaWhatsapp className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tarefas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {whatsappData?.summary?.totalTasks || 0}
                  </p>
                  <p className="text-sm text-blue-600">
                    {whatsappData?.summary?.totalCompleted || 0} completadas
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
                    {whatsappData?.summary?.avgSuccessRate || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Média geral</p>
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
                    {whatsappData?.summary?.totalFailed || 0}
                  </p>
                  <p className="text-sm text-red-600">Últimos {selectedPeriod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Diária</h3>
              <Line 
                data={dailyActivityChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Sucesso Diária</h3>
              <Line 
                data={successRateChartData}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Tarefas</h3>
              <div className="flex justify-center">
                <Doughnut 
                  data={numberStatusChartData}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Números Mais Ativos</h3>
              <div className="space-y-3">
                {whatsappData?.mostActive?.slice(0, 5).map((number, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{number._id}</p>
                        <p className="text-xs text-gray-600">{number.daysActive} dias ativo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {number.totalTasks} tarefas
                      </p>
                      <p className="text-xs text-gray-600">
                        {number.successRate.toFixed(1)}% sucesso
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Tab */}
      {activeTab === 'program' && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programa de 21 Dias</h2>
            
            {/* Program Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Total Números</p>
                <p className="text-2xl font-bold text-green-900">{programData?.summary?.totalNumbers || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">No Programa</p>
                <p className="text-2xl font-bold text-blue-900">{programData?.summary?.numbersInProgram || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Completados</p>
                <p className="text-2xl font-bold text-yellow-900">{programData?.summary?.numbersCompleted || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Taxa Conclusão</p>
                <p className="text-2xl font-bold text-purple-900">
                  {programData?.summary?.completionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>

            {/* Number Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Número para Visualizar Programa
              </label>
              <select 
                value={selectedNumber} 
                onChange={(e) => setSelectedNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione um número...</option>
                {programData?.numbers?.map((number, index) => (
                  <option key={index} value={number.phone}>
                    {number.phone} (Dia {number.stats.currentDay}/21)
                  </option>
                ))}
              </select>
            </div>

            {/* Program Chart */}
            {selectedNumber && numberDetail && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Programa de 21 Dias - {selectedNumber}
                </h3>
                <Line 
                  data={program21DaysChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
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
            )}
          </div>

          {/* Program Table */}
          {selectedNumber && numberDetail && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Programa</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarefas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completadas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Falharam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sucesso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {numberDetail.program21Days.map((day, index) => (
                      <tr key={index} className={day.tasks > 0 ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.tasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {day.completed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {day.failed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.successRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Numbers Tab */}
      {activeTab === 'numbers' && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Números Detalhados</h2>
            
            {/* Search */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Número
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Digite o número..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      onChange={(e) => setSelectedNumber(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => fetchNumberDetail(selectedNumber)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                  >
                    <FaEye />
                    <span>Visualizar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Numbers List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Tarefas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Falharam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa Sucesso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Ativo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {whatsappData?.numbers?.map((number, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {number._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {number.totalTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {number.completedTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {number.failedTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {number.successRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {number.daysActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedNumber(number._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <FaEye />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaDownload />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Number Detail */}
          {selectedNumber && numberDetail && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes do Número: {selectedNumber}
              </h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Total Tarefas</p>
                  <p className="text-2xl font-bold text-blue-900">{numberDetail.summary.totalTasks}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-900">{numberDetail.summary.completedTasks}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-600">Falharam</p>
                  <p className="text-2xl font-bold text-red-900">{numberDetail.summary.failedTasks}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">Taxa Sucesso</p>
                  <p className="text-2xl font-bold text-yellow-900">{numberDetail.summary.successRate}%</p>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Tarefas Recentes</h4>
                <div className="space-y-2">
                  {numberDetail.recentTasks.slice(0, 10).map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'failed' ? 'bg-red-500' :
                          task.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-600">{task.deviceName}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppAnalytics; 