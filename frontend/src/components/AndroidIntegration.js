import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMobile,
  FaWifi,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaPlay,
  FaPause,
  FaStop,
  FaSync,
  FaEye,
  FaTrash,
  FaPlus,
  FaCog,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaDownload,
  FaUpload,
  FaNetworkWired,
  FaSignal,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSync,
  FaPowerOff,
  FaRegDotCircle
} from 'react-icons/fa';

const AndroidIntegration = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceTasks, setDeviceTasks] = useState([]);
  const [deviceStats, setDeviceStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    manufacturer: '',
    search: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDevices();
  }, [filters]);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceTasks(selectedDevice._id);
      fetchDeviceStats(selectedDevice._id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.manufacturer) params.append('manufacturer', filters.manufacturer);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/devices?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDevices(response.data.data.devices || response.data.data);
    } catch (error) {
      setError('Erro ao carregar dispositivos');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTasks = async (deviceId) => {
    try {
      const response = await axios.get(`/api/tasks?deviceId=${deviceId}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceTasks(response.data.data.tasks || response.data.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas do dispositivo:', error);
    }
  };

  const fetchDeviceStats = async (deviceId) => {
    try {
      const response = await axios.get(`/api/android/status?deviceId=${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dispositivo:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getBatteryIcon = (level) => {
    if (level >= 80) return <FaBatteryFull className="text-green-500" />;
    if (level >= 60) return <FaBatteryThreeQuarters className="text-green-500" />;
    if (level >= 40) return <FaBatteryHalf className="text-yellow-500" />;
    if (level >= 20) return <FaBatteryQuarter className="text-orange-500" />;
    return <FaBatteryEmpty className="text-red-500" />;
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getNetworkIcon = (networkStatus) => {
    switch (networkStatus) {
      case 'wifi': return <FaWifi className="text-blue-500" />;
      case 'mobile': return <FaSignal className="text-green-500" />;
      case 'ethernet': return <FaNetworkWired className="text-purple-500" />;
      default: return <FaRegDotCircle className="text-gray-500" />;
    }
  };

  const handleDeviceAction = async (deviceId, action) => {
    try {
      switch (action) {
        case 'restart':
          await axios.post(`/api/devices/${deviceId}/restart`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'disconnect':
          await axios.post(`/api/android/disconnect`, { deviceId }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'delete':
          if (window.confirm('Tem certeza que deseja deletar este dispositivo?')) {
            await axios.delete(`/api/devices/${deviceId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchDevices();
          }
          break;
      }
    } catch (error) {
      console.error('Erro na ação do dispositivo:', error);
    }
  };

  const createTaskForDevice = async (deviceId) => {
    try {
      const taskData = {
        deviceId,
        type: 'whatsapp_message',
        priority: 'normal',
        parameters: {
          message: 'Teste de integração Android',
          phoneNumber: '+5511999999999'
        }
      };

      await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (selectedDevice && selectedDevice._id === deviceId) {
        fetchDeviceTasks(deviceId);
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  if (loading && devices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dispositivos Android...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDevices}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                <FaMobile className="text-green-500 text-3xl" />
                <h1 className="text-3xl font-bold text-gray-900">Integração Android</h1>
              </div>
              <p className="text-gray-600">Gerencie dispositivos Android remotos e distribuição de tarefas</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDevices}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaSync />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FaMobile className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total de Dispositivos</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FaWifi className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold">
                  {devices.filter(d => d.isOnline).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FaPlay className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Executando Tarefas</p>
                <p className="text-2xl font-bold">
                  {devices.filter(d => d.status === 'running').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FaChartLine className="text-orange-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {devices.length > 0 
                    ? Math.round((devices.filter(d => d.lastTaskStatus === 'completed').length / devices.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Dispositivos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Dispositivos Android</h2>
                  
                  {/* Filtros */}
                  <div className="flex items-center space-x-4">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Buscar dispositivo..."
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <div
                    key={device._id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedDevice?._id === device._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaMobile className="text-gray-600 text-xl" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {device.deviceName}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.isOnline)}`}>
                              {device.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{device.model}</span>
                            <span>{device.manufacturer}</span>
                            <span>Android {device.androidVersion}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {device.batteryLevel && (
                              <div className="flex items-center space-x-1">
                                {getBatteryIcon(device.batteryLevel)}
                                <span className="text-xs text-gray-500">{device.batteryLevel}%</span>
                              </div>
                            )}
                            
                            {device.networkStatus && (
                              <div className="flex items-center space-x-1">
                                {getNetworkIcon(device.networkStatus)}
                                <span className="text-xs text-gray-500 capitalize">{device.networkStatus}</span>
                              </div>
                            )}
                            
                            {device.location && (
                              <div className="flex items-center space-x-1">
                                <FaMapMarkerAlt className="text-red-500 text-xs" />
                                <span className="text-xs text-gray-500">Localizado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createTaskForDevice(device._id);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-md"
                          title="Criar Tarefa"
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeviceAction(device._id, 'restart');
                          }}
                          className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-md"
                          title="Reiniciar"
                        >
                          <FaSync />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeviceAction(device._id, 'disconnect');
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-md"
                          title="Desconectar"
                        >
                          <FaPowerOff />
                        </button>
                      </div>
                    </div>
                    
                    {device.lastSeen && (
                      <div className="mt-2 text-xs text-gray-500">
                        Última atividade: {new Date(device.lastSeen).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel de Detalhes */}
          <div className="lg:col-span-1">
            {selectedDevice ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Detalhes do Dispositivo</h3>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                {/* Informações do Dispositivo */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedDevice.deviceName}</h4>
                    <p className="text-sm text-gray-500">{selectedDevice.model}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Fabricante:</span>
                      <p className="font-medium">{selectedDevice.manufacturer}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Android:</span>
                      <p className="font-medium">{selectedDevice.androidVersion}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">App Version:</span>
                      <p className="font-medium">{selectedDevice.appVersion}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDevice.isOnline)}`}>
                        {selectedDevice.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Estatísticas do Dispositivo */}
                  {deviceStats && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Estatísticas</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tarefas Pendentes:</span>
                          <p className="font-medium">{deviceStats.tasks?.pending || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Executando:</span>
                          <p className="font-medium">{deviceStats.tasks?.running || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Completadas Hoje:</span>
                          <p className="font-medium">{deviceStats.tasks?.completedToday || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Bateria:</span>
                          <div className="flex items-center space-x-1">
                            {getBatteryIcon(deviceStats.device?.batteryLevel)}
                            <span className="font-medium">{deviceStats.device?.batteryLevel || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tarefas Recentes */}
                  {deviceTasks.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Tarefas Recentes</h4>
                      <div className="space-y-2">
                        {deviceTasks.slice(0, 5).map((task) => (
                          <div key={task._id} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium capitalize">{task.type.replace('_', ' ')}</p>
                              <p className="text-gray-500">{task.status}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === 'completed' ? 'text-green-600 bg-green-100' :
                              task.status === 'running' ? 'text-blue-600 bg-blue-100' :
                              task.status === 'failed' ? 'text-red-600 bg-red-100' :
                              'text-gray-600 bg-gray-100'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Ações</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => createTaskForDevice(selectedDevice._id)}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center space-x-2"
                      >
                        <FaPlus />
                        <span>Criar Tarefa</span>
                      </button>
                      <button
                        onClick={() => handleDeviceAction(selectedDevice._id, 'restart')}
                        className="w-full px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center justify-center space-x-2"
                      >
                        <FaSync />
                        <span>Reiniciar</span>
                      </button>
                      <button
                        onClick={() => handleDeviceAction(selectedDevice._id, 'disconnect')}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center justify-center space-x-2"
                      >
                        <FaPowerOff />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-500">
                  <FaMobile className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>Selecione um dispositivo para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AndroidIntegration; 