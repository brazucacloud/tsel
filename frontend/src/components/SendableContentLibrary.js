import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaDownload, 
  FaCopy, 
  FaEye,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaLanguage,
  FaStar,
  FaClock,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaMusic,
  FaMapMarkerAlt,
  FaUser,
  FaPollH,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const SendableContentLibrary = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    contentType: '',
    category: '',
    programDay: '',
    taskType: '',
    language: '',
    isActive: '',
    isApproved: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'message',
    category: 'custom',
    text: '',
    programDay: 1,
    taskType: 'anytime',
    priority: 5,
    tags: '',
    language: 'pt-BR',
    sendTime: '09:00',
    timezone: 'America/Sao_Paulo',
    requiresConfirmation: false
  });

  const contentTypeOptions = [
    { value: 'message', label: 'Mensagem', icon: <FaFileAlt /> },
    { value: 'image', label: 'Imagem', icon: <FaImage /> },
    { value: 'video', label: 'Vídeo', icon: <FaVideo /> },
    { value: 'audio', label: 'Áudio', icon: <FaMusic /> },
    { value: 'document', label: 'Documento', icon: <FaFileAlt /> },
    { value: 'sticker', label: 'Sticker', icon: <FaImage /> },
    { value: 'contact', label: 'Contato', icon: <FaUser /> },
    { value: 'location', label: 'Localização', icon: <FaMapMarkerAlt /> },
    { value: 'poll', label: 'Enquete', icon: <FaPollH /> }
  ];

  const categoryOptions = [
    { value: 'greeting', label: 'Saudação' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'promotion', label: 'Promoção' },
    { value: 'support', label: 'Suporte' },
    { value: 'news', label: 'Notícias' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'business', label: 'Negócio' },
    { value: 'personal', label: 'Pessoal' },
    { value: 'custom', label: 'Customizado' }
  ];

  const taskTypeOptions = [
    { value: 'morning', label: 'Manhã' },
    { value: 'afternoon', label: 'Tarde' },
    { value: 'evening', label: 'Noite' },
    { value: 'night', label: 'Madrugada' },
    { value: 'anytime', label: 'Qualquer hora' }
  ];

  const languageOptions = [
    { value: 'pt-BR', label: 'Português (BR)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' }
  ];

  useEffect(() => {
    fetchContent();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`/api/sendable-content?${params}`);
      setContent(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/sendable-content/stats/overview');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'requiresConfirmation') {
          formDataToSend.append(key, formData[key].toString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedContent) {
        await axios.put(`/api/sendable-content/${selectedContent._id}`, formDataToSend);
      } else {
        await axios.post('/api/sendable-content', formDataToSend);
      }

      setShowModal(false);
      setSelectedContent(null);
      resetForm();
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        await axios.delete(`/api/sendable-content/${id}`);
        fetchContent();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/sendable-content/${id}/approve`);
      fetchContent();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const handleClone = async (id) => {
    try {
      await axios.post(`/api/sendable-content/${id}/clone`);
      fetchContent();
    } catch (error) {
      console.error('Error cloning content:', error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`/api/sendable-content/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `content-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: 'message',
      category: 'custom',
      text: '',
      programDay: 1,
      taskType: 'anytime',
      priority: 5,
      tags: '',
      language: 'pt-BR',
      sendTime: '09:00',
      timezone: 'America/Sao_Paulo',
      requiresConfirmation: false
    });
  };

  const openEditModal = (item) => {
    setSelectedContent(item);
    setFormData({
      title: item.title,
      description: item.description,
      contentType: item.contentType,
      category: item.category,
      text: item.text || '',
      programDay: item.programDay,
      taskType: item.taskType,
      priority: item.priority,
      tags: item.tags.join(', '),
      language: item.language,
      sendTime: item.sendTime,
      timezone: item.timezone,
      requiresConfirmation: item.requiresConfirmation
    });
    setShowModal(true);
  };

  const getContentTypeIcon = (type) => {
    const option = contentTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : <FaFileAlt />;
  };

  const getStatusBadge = (item) => {
    if (!item.isActive) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">Inativo</span>;
    }
    if (!item.isApproved) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">Pendente</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">Aprovado</span>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      1: 'bg-gray-100 text-gray-600',
      2: 'bg-blue-100 text-blue-600',
      3: 'bg-green-100 text-green-600',
      4: 'bg-yellow-100 text-yellow-600',
      5: 'bg-orange-100 text-orange-600',
      6: 'bg-red-100 text-red-600',
      7: 'bg-purple-100 text-purple-600',
      8: 'bg-pink-100 text-pink-600',
      9: 'bg-indigo-100 text-indigo-600',
      10: 'bg-red-200 text-red-700'
    };
    return <span className={`px-2 py-1 text-xs rounded ${colors[priority] || colors[5]}`}>{priority}</span>;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca de Conteúdo Enviável</h1>
        <p className="text-gray-600">Gerencie o conteúdo que será enviado pelos dispositivos Android durante o programa de 21 dias</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaFileAlt className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.total || 0) - (stats.approved || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaStar className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uso Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsage || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaFilter />
              Filtros
            </button>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conteúdo..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedContent(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Novo Conteúdo
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.contentType}
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              {contentTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.programDay}
              onChange={(e) => handleFilterChange('programDay', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os dias</option>
              {Array.from({ length: 21 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>Dia {day}</option>
              ))}
            </select>
            <select
              value={filters.isApproved}
              onChange={(e) => handleFilterChange('isApproved', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="true">Aprovados</option>
              <option value="false">Pendentes</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando conteúdo...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <FaLanguage className="text-gray-400" />
                          <span className="text-xs text-gray-500">{item.language}</span>
                          {item.tags.length > 0 && (
                            <>
                              <FaTag className="text-gray-400" />
                              <span className="text-xs text-gray-500">{item.tags.slice(0, 2).join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(item.contentType)}
                        <span className="text-sm text-gray-900">
                          {contentTypeOptions.find(opt => opt.value === item.contentType)?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm text-gray-900">Dia {item.programDay}</span>
                        <span className="text-xs text-gray-500">({item.taskType})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.usageCount}</div>
                      {item.successRate > 0 && (
                        <div className="text-xs text-gray-500">{item.successRate.toFixed(1)}% sucesso</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedContent(item)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Visualizar"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        {!item.isApproved && (
                          <button
                            onClick={() => handleApprove(item._id)}
                            className="p-1 text-yellow-600 hover:text-yellow-800"
                            title="Aprovar"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleClone(item._id)}
                          className="p-1 text-purple-600 hover:text-purple-800"
                          title="Clonar"
                        >
                          <FaCopy />
                        </button>
                        {item.mediaPath && (
                          <button
                            onClick={() => handleDownload(item._id)}
                            className="p-1 text-indigo-600 hover:text-indigo-800"
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {selectedContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conteúdo *</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {contentTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {formData.contentType === 'message' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto da Mensagem *</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia do Programa *</label>
                  <select
                    value={formData.programDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, programDay: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 21 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>Dia {day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tarefa</label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {taskTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Envio</label>
                  <input
                    type="time"
                    value={formData.sendTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresConfirmation"
                  checked={formData.requiresConfirmation}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresConfirmation: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="requiresConfirmation" className="text-sm text-gray-700">
                  Requer confirmação antes do envio
                </label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedContent ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Detail Modal */}
      {selectedContent && !showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Detalhes do Conteúdo</h2>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedContent.title}</h3>
                <p className="text-gray-600">{selectedContent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {contentTypeOptions.find(opt => opt.value === selectedContent.contentType)?.label}
                </div>
                <div>
                  <span className="font-medium">Categoria:</span> {categoryOptions.find(opt => opt.value === selectedContent.category)?.label}
                </div>
                <div>
                  <span className="font-medium">Dia do Programa:</span> {selectedContent.programDay}
                </div>
                <div>
                  <span className="font-medium">Tipo de Tarefa:</span> {taskTypeOptions.find(opt => opt.value === selectedContent.taskType)?.label}
                </div>
                <div>
                  <span className="font-medium">Prioridade:</span> {selectedContent.priority}
                </div>
                <div>
                  <span className="font-medium">Idioma:</span> {languageOptions.find(opt => opt.value === selectedContent.language)?.label}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {getStatusBadge(selectedContent)}
                </div>
                <div>
                  <span className="font-medium">Uso:</span> {selectedContent.usageCount} vezes
                </div>
              </div>
              {selectedContent.text && (
                <div>
                  <span className="font-medium">Texto:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedContent.text}</p>
                </div>
              )}
              {selectedContent.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedContent.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => openEditModal(selectedContent)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendableContentLibrary; 