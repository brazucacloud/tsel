import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaPhone, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaDownload,
  FaSearch,
  FaFilter,
  FaEye,
  FaChartLine,
  FaMobile,
  FaUsers,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaWhatsapp,
  FaArrowLeft,
  FaArrowRight,
  FaPrint,
  FaShare
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const WhatsAppReports = () => {
  const [numbers, setNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [numberReport, setNumberReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [period, setPeriod] = useState('30d');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNumbers();
  }, []);

  useEffect(() => {
    if (selectedNumber) {
      fetchNumberReport(selectedNumber);
    }
  }, [selectedNumber, period]);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/whatsapp/numbers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNumbers(response.data.data.numbers);
    } catch (err) {
      setError('Erro ao carregar números WhatsApp');
      console.error('Numbers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNumberReport = async (phone) => {
    try {
      const response = await axios.get(`/api/reports/whatsapp/numbers/${phone}?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNumberReport(response.data.data);
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  const filteredNumbers = numbers.filter(number => {
    const matchesSearch = number.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && number.successRate > 80) ||
      (filterStatus === 'warning' && number.successRate <= 80 && number.successRate > 50) ||
      (filterStatus === 'error' && number.successRate <= 50);
    
    return matchesSearch && matchesFilter;
  });

  const exportReport = () => {
    if (!numberReport) return;
    
    const dataStr = JSON.stringify(numberReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${numberReport.phone}.json`;
    link.click();
  };

  const printReport = () => {
    window.print();
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `Relatório WhatsApp - ${numberReport?.phone}`,
        text: `Relatório detalhado do número ${numberReport?.phone}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const getStatusColor = (successRate) => {
    if (successRate > 80) return 'text-green-600 bg-green-100';
    if (successRate > 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (successRate) => {
    if (successRate > 80) return 'Ativo';
    if (successRate > 50) return 'Atenção';
    return 'Problema';
  };

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
            onClick={fetchNumbers}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <FaWhatsapp className="text-green-500 text-3xl" />
                <h1 className="text-3xl font-bold text-gray-900">Relatórios WhatsApp</h1>
              </div>
              <p className="text-gray-600">Relatórios detalhados por número de WhatsApp</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchNumbers}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaArrowRight />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Numbers List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Números</h2>
                <span className="text-sm text-gray-500">{filteredNumbers.length} de {numbers.length}</span>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativos (>80%)</option>
                  <option value="warning">Atenção (50-80%)</option>
                  <option value="error">Problemas (menos de 50%)</option>
                </select>
              </div>

              {/* Numbers List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredNumbers.map((number) => (
                  <button
                    key={number.phone}
                    onClick={() => setSelectedNumber(number.phone)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedNumber === number.phone
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FaPhone className="text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">{number.phone}</p>
                          <p className="text-sm text-gray-600">{number.totalTasks} tarefas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(number.successRate)}`}>
                          {getStatusText(number.successRate)}
                        </span>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {number.successRate}%
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedNumber && numberReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Relatório: {numberReport.phone}</h2>
                      <p className="text-gray-600">Período: {period}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                      </select>
                      <button
                        onClick={exportReport}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                      >
                        <FaDownload />
                        <span>Exportar</span>
                      </button>
                      <button
                        onClick={printReport}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <FaPrint />
                        <span>Imprimir</span>
                      </button>
                      <button
                        onClick={shareReport}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2"
                      >
                        <FaShare />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaCheckCircle className="text-blue-500" />
                        <span className="font-medium text-blue-900">Total</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{numberReport.summary.totalTasks}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="font-medium text-green-900">Completadas</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{numberReport.summary.completedTasks}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaTimesCircle className="text-red-500" />
                        <span className="font-medium text-red-900">Falharam</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{numberReport.summary.failedTasks}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaChartLine className="text-yellow-500" />
                        <span className="font-medium text-yellow-900">Sucesso</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900">{numberReport.summary.successRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Task Types Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Tarefa</h3>
                    <Doughnut
                      data={{
                        labels: Object.keys(numberReport.taskTypes),
                        datasets: [{
                          data: Object.values(numberReport.taskTypes).map(t => t.total),
                          backgroundColor: [
                            '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
                            '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
                          ]
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Daily Activity Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Diária</h3>
                    <Line
                      data={{
                        labels: numberReport.dailyActivity.map(d => d.date),
                        datasets: [{
                          label: 'Tarefas',
                          data: numberReport.dailyActivity.map(d => d.total),
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          fill: true
                        }]
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Program Progress */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso no Programa de 21 Dias</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Dia Atual</span>
                      <span className="text-lg font-bold text-green-600">
                        {numberReport.programProgress.currentDay} de {numberReport.programProgress.totalDays}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${numberReport.programProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Progresso: {numberReport.programProgress.progress}%
                    </p>
                    
                    {numberReport.programProgress.nextTasks.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Próximas Tarefas:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {numberReport.programProgress.nextTasks.map((task, index) => (
                            <li key={index}>• {task}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Recentes</h3>
                  <div className="space-y-3">
                    {numberReport.recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'failed' ? 'bg-red-500' :
                            task.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{task.type}</p>
                            <p className="text-sm text-gray-600">{task.device}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <FaPhone className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Número</h3>
                  <p className="text-gray-600">Escolha um número da lista para ver o relatório detalhado</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppReports; 