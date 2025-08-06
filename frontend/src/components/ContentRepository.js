import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCloudUploadAlt,
  FaDownload,
  FaEye,
  FaTrash,
  FaSearch,
  FaFilter,
  FaFileAudio,
  FaFileVideo,
  FaFileImage,
  FaFileAlt,
  FaFilePdf,
  FaPhone,
  FaComments,
  FaChartBar,
  FaCalendarAlt,
  FaMobile,
  FaWhatsapp,
  FaArrowLeft,
  FaArrowRight,
  FaPrint,
  FaShare,
  FaUpload,
  FaFolderOpen,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const ContentRepository = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    contentType: '',
    whatsappNumber: '',
    deviceId: '',
    action: '',
    processingStatus: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    taskId: '',
    whatsappNumber: '',
    contentType: '',
    action: '',
    messageContent: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchContents();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`/api/content?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContents(response.data.data.contents);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      setError('Erro ao carregar conteúdo');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/content/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFileUpload = (event) => {
    setUploadFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      Object.keys(uploadData).forEach(key => {
        if (uploadData[key]) {
          formData.append(key, uploadData[key]);
        }
      });

      await axios.post('/api/content/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadModal(false);
      setUploadFiles([]);
      setUploadData({
        taskId: '',
        whatsappNumber: '',
        contentType: '',
        action: '',
        messageContent: ''
      });
      fetchContents();
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleDownload = async (contentId) => {
    try {
      const response = await axios.get(`/api/content/download/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'content');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro no download:', error);
    }
  };

  const handleDelete = async (contentId) => {
    if (window.confirm('Tem certeza que deseja deletar este conteúdo?')) {
      try {
        await axios.delete(`/api/content/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchContents();
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'audio': return <FaFileAudio className="text-blue-500" />;
      case 'video': return <FaFileVideo className="text-red-500" />;
      case 'image': return <FaFileImage className="text-green-500" />;
      case 'document': return <FaFilePdf className="text-orange-500" />;
      case 'message': return <FaComments className="text-purple-500" />;
      case 'call': return <FaPhone className="text-teal-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && contents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando repositório...</p>
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
            onClick={fetchContents}
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
                <FaFolderOpen className="text-blue-500 text-3xl" />
                <h1 className="text-3xl font-bold text-gray-900">Repositório de Conteúdo</h1>
              </div>
              <p className="text-gray-600">Gerencie todos os arquivos e interações do WhatsApp</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUploadModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaUpload />
                <span>Upload</span>
              </button>
              <button
                onClick={fetchContents}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
              >
                <FaArrowRight />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FaChartBar className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total de Arquivos</p>
                  <p className="text-2xl font-bold">{stats.storageUsage?.totalFiles || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FaFileImage className="text-green-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Armazenamento</p>
                  <p className="text-2xl font-bold">
                    {((stats.storageUsage?.totalSize || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Processados</p>
                  <p className="text-2xl font-bold">
                    {contents.filter(c => c.processingStatus === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FaClock className="text-yellow-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold">
                    {contents.filter(c => c.processingStatus === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conteúdo</label>
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="audio">Áudio</option>
                <option value="video">Vídeo</option>
                <option value="image">Imagem</option>
                <option value="document">Documento</option>
                <option value="message">Mensagem</option>
                <option value="call">Chamada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número WhatsApp</label>
              <input
                type="text"
                value={filters.whatsappNumber}
                onChange={(e) => handleFilterChange('whatsappNumber', e.target.value)}
                placeholder="Digite o número"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.processingStatus}
                onChange={(e) => handleFilterChange('processingStatus', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="failed">Falhou</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Lista de Conteúdo */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conteúdo ({pagination.total})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => (
                  <tr key={content._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getContentIcon(content.contentType)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {content.contentType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{content.fileName}</div>
                      <div className="text-sm text-gray-500">{content.originalName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaWhatsapp className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{content.whatsappNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {content.fileSizeMB} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(content.processingStatus)}`}>
                        {content.processingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedContent(content)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownload(content._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleDelete(content._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
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

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    <FaArrowLeft />
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Upload */}
        {uploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Upload de Conteúdo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número WhatsApp
                  </label>
                  <input
                    type="text"
                    value={uploadData.whatsappNumber}
                    onChange={(e) => setUploadData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="+55 11 99999-9999"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Conteúdo
                  </label>
                  <select
                    value={uploadData.contentType}
                    onChange={(e) => setUploadData(prev => ({ ...prev, contentType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    <option value="audio">Áudio</option>
                    <option value="video">Vídeo</option>
                    <option value="image">Imagem</option>
                    <option value="document">Documento</option>
                    <option value="message">Mensagem</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ação
                  </label>
                  <select
                    value={uploadData.action}
                    onChange={(e) => setUploadData(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione</option>
                    <option value="send">Enviar</option>
                    <option value="receive">Receber</option>
                    <option value="upload">Upload</option>
                    <option value="download">Download</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setUploadModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes do Conteúdo</h3>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="text-sm text-gray-900">{selectedContent.contentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedContent.contentType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Arquivo</label>
                    <p className="text-sm text-gray-900">{selectedContent.fileName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                    <p className="text-sm text-gray-900">{selectedContent.fileSizeMB} MB</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <p className="text-sm text-gray-900">{selectedContent.whatsappNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedContent.processingStatus)}`}>
                      {selectedContent.processingStatus}
                    </span>
                  </div>
                </div>
                
                {selectedContent.messageContent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Conteúdo da Mensagem</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedContent.messageContent}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedContent.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Criado em</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedContent.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Atualizado em</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedContent.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleDownload(selectedContent._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentRepository; 