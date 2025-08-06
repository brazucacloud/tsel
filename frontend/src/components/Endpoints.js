import React, { useState } from 'react';
import { 
  FaCode, 
  FaCopy, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaBook
} from 'react-icons/fa';

const Endpoints = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [testResults, setTestResults] = useState({});

  const baseUrl = 'http://localhost:3001';

  const endpoints = {
    'Autenticação': {
      'POST /api/auth/device/register': {
        description: 'Registrar novo dispositivo',
        method: 'POST',
        url: `${baseUrl}/api/auth/device/register`,
        body: {
          deviceId: 'string',
          deviceName: 'string',
          manufacturer: 'string',
          model: 'string',
          androidVersion: 'string',
          appVersion: 'string'
        },
        response: {
          success: true,
          token: 'jwt_token',
          device: 'device_object'
        }
      },
      'POST /api/auth/device/login': {
        description: 'Login de dispositivo',
        method: 'POST',
        url: `${baseUrl}/api/auth/device/login`,
        body: {
          deviceId: 'string'
        },
        response: {
          success: true,
          token: 'jwt_token'
        }
      },
      'POST /api/auth/admin/login': {
        description: 'Login de administrador',
        method: 'POST',
        url: `${baseUrl}/api/auth/admin/login`,
        body: {
          email: 'string',
          password: 'string'
        },
        response: {
          success: true,
          token: 'jwt_token',
          admin: 'admin_object'
        }
      }
    },
    'Dispositivos': {
      'GET /api/devices': {
        description: 'Listar todos os dispositivos',
        method: 'GET',
        url: `${baseUrl}/api/devices`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          devices: 'array'
        }
      },
      'GET /api/devices/:id': {
        description: 'Obter dispositivo específico',
        method: 'GET',
        url: `${baseUrl}/api/devices/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          device: 'device_object'
        }
      },
      'POST /api/devices': {
        description: 'Criar novo dispositivo',
        method: 'POST',
        url: `${baseUrl}/api/devices`,
        headers: {
          'Authorization': 'Bearer token'
        },
        body: {
          deviceId: 'string',
          deviceName: 'string',
          manufacturer: 'string',
          model: 'string'
        },
        response: {
          success: true,
          device: 'device_object'
        }
      },
      'PUT /api/devices/:id': {
        description: 'Atualizar dispositivo',
        method: 'PUT',
        url: `${baseUrl}/api/devices/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        body: {
          deviceName: 'string',
          isOnline: 'boolean'
        },
        response: {
          success: true,
          device: 'device_object'
        }
      },
      'DELETE /api/devices/:id': {
        description: 'Remover dispositivo',
        method: 'DELETE',
        url: `${baseUrl}/api/devices/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          message: 'Dispositivo removido'
        }
      }
    },
    'Tarefas': {
      'GET /api/tasks': {
        description: 'Listar todas as tarefas',
        method: 'GET',
        url: `${baseUrl}/api/tasks`,
        headers: {
          'Authorization': 'Bearer token'
        },
        query: {
          status: 'string (optional)',
          type: 'string (optional)',
          deviceId: 'string (optional)',
          page: 'number (optional)',
          limit: 'number (optional)'
        },
        response: {
          success: true,
          tasks: 'array',
          pagination: 'object'
        }
      },
      'GET /api/tasks/:id': {
        description: 'Obter tarefa específica',
        method: 'GET',
        url: `${baseUrl}/api/tasks/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          task: 'task_object'
        }
      },
      'POST /api/tasks': {
        description: 'Criar nova tarefa',
        method: 'POST',
        url: `${baseUrl}/api/tasks`,
        headers: {
          'Authorization': 'Bearer token'
        },
        body: {
          deviceId: 'string',
          type: 'string',
          parameters: 'object',
          priority: 'string',
          description: 'string'
        },
        response: {
          success: true,
          task: 'task_object'
        }
      },
      'PUT /api/tasks/:id': {
        description: 'Atualizar tarefa',
        method: 'PUT',
        url: `${baseUrl}/api/tasks/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        body: {
          status: 'string',
          result: 'object (optional)',
          error: 'string (optional)'
        },
        response: {
          success: true,
          task: 'task_object'
        }
      },
      'DELETE /api/tasks/:id': {
        description: 'Remover tarefa',
        method: 'DELETE',
        url: `${baseUrl}/api/tasks/:id`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          message: 'Tarefa removida'
        }
      }
    },
    'Analytics': {
      'GET /api/analytics/overview': {
        description: 'Visão geral do dashboard',
        method: 'GET',
        url: `${baseUrl}/api/analytics/overview`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          data: 'analytics_object'
        }
      },
      'GET /api/analytics/devices': {
        description: 'Estatísticas de dispositivos',
        method: 'GET',
        url: `${baseUrl}/api/analytics/devices`,
        headers: {
          'Authorization': 'Bearer token'
        },
        query: {
          period: 'string (24h|7d|30d)',
          status: 'string (optional)',
          manufacturer: 'string (optional)'
        },
        response: {
          success: true,
          data: 'devices_analytics'
        }
      },
      'GET /api/analytics/tasks': {
        description: 'Estatísticas de tarefas',
        method: 'GET',
        url: `${baseUrl}/api/analytics/tasks`,
        headers: {
          'Authorization': 'Bearer token'
        },
        query: {
          period: 'string (24h|7d|30d)',
          type: 'string (optional)',
          status: 'string (optional)'
        },
        response: {
          success: true,
          data: 'tasks_analytics'
        }
      },
      'GET /api/analytics/realtime': {
        description: 'Dados em tempo real',
        method: 'GET',
        url: `${baseUrl}/api/analytics/realtime`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          data: 'realtime_data'
        }
      },
      'GET /api/analytics/export': {
        description: 'Exportar dados',
        method: 'GET',
        url: `${baseUrl}/api/analytics/export`,
        headers: {
          'Authorization': 'Bearer token'
        },
        query: {
          type: 'string (tasks|devices)',
          format: 'string (json|csv)',
          period: 'string (24h|7d|30d)'
        },
        response: {
          success: true,
          data: 'exported_data'
        }
      }
    },
    'Relatórios WhatsApp': {
      'GET /api/reports/whatsapp/numbers': {
        description: 'Listar todos os números WhatsApp',
        method: 'GET',
        url: `${baseUrl}/api/reports/whatsapp/numbers`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          numbers: 'array'
        }
      },
      'GET /api/reports/whatsapp/numbers/:phone': {
        description: 'Relatório detalhado por número',
        method: 'GET',
        url: `${baseUrl}/api/reports/whatsapp/numbers/:phone`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          report: 'detailed_report'
        }
      },
      'GET /api/reports/whatsapp/21days': {
        description: 'Programa de 21 dias',
        method: 'GET',
        url: `${baseUrl}/api/reports/whatsapp/21days`,
        headers: {
          'Authorization': 'Bearer token'
        },
        response: {
          success: true,
          program: '21days_program'
        }
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const testEndpoint = async (endpoint, method, url) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(url, {
        method,
        headers,
        ...(method !== 'GET' && { body: JSON.stringify({}) })
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: response.ok,
          status: response.status,
          data: result
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: error.message
        }
      }));
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Endpoints</h1>
              <p className="text-gray-600">Documentação completa da API</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => copyToClipboard(baseUrl)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaCopy />
                <span>Copiar Base URL</span>
              </button>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
              >
                <FaBook />
                <span>Documentação Completa</span>
              </a>
            </div>
          </div>
        </div>

        {/* Endpoints Sections */}
        {Object.entries(endpoints).map(([section, sectionEndpoints]) => (
          <div key={section} className="mb-8">
            <div className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleSection(section)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <h2 className="text-xl font-semibold text-gray-900">{section}</h2>
                {expandedSections[section] ? <FaEyeSlash /> : <FaEye />}
              </button>

              {expandedSections[section] && (
                <div className="border-t border-gray-200">
                  {Object.entries(sectionEndpoints).map(([endpoint, details]) => (
                    <div key={endpoint} className="p-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getMethodColor(details.method)}`}>
                              {details.method}
                            </span>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {endpoint}
                            </code>
                          </div>
                          <p className="text-gray-600">{details.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(details.url)}
                            className="p-2 text-gray-500 hover:text-blue-600"
                            title="Copiar URL"
                          >
                            {copiedEndpoint === details.url ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                          <button
                            onClick={() => testEndpoint(endpoint, details.method, details.url)}
                            className="p-2 text-gray-500 hover:text-green-600"
                            title="Testar Endpoint"
                          >
                            <FaPlay />
                          </button>
                        </div>
                      </div>

                      {/* URL */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL:</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                            {details.url}
                          </code>
                        </div>
                      </div>

                      {/* Headers */}
                      {details.headers && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Headers:</label>
                          <pre className="bg-gray-100 px-3 py-2 rounded text-sm overflow-x-auto">
                            {JSON.stringify(details.headers, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Query Parameters */}
                      {details.query && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Query Parameters:</label>
                          <pre className="bg-gray-100 px-3 py-2 rounded text-sm overflow-x-auto">
                            {JSON.stringify(details.query, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Request Body */}
                      {details.body && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Request Body:</label>
                          <pre className="bg-gray-100 px-3 py-2 rounded text-sm overflow-x-auto">
                            {JSON.stringify(details.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Response */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Response:</label>
                        <pre className="bg-gray-100 px-3 py-2 rounded text-sm overflow-x-auto">
                          {JSON.stringify(details.response, null, 2)}
                        </pre>
                      </div>

                      {/* Test Results */}
                      {testResults[endpoint] && (
                        <div className="mt-4 p-4 rounded-lg border">
                          <h4 className="font-medium mb-2">Resultado do Teste:</h4>
                          {testResults[endpoint].success ? (
                            <div className="text-green-600">
                              <div className="flex items-center space-x-2 mb-2">
                                <FaCheck />
                                <span>Status: {testResults[endpoint].status}</span>
                              </div>
                              <pre className="bg-green-50 px-3 py-2 rounded text-sm overflow-x-auto">
                                {JSON.stringify(testResults[endpoint].data, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <div className="text-red-600">
                              <div className="flex items-center space-x-2 mb-2">
                                <FaTimes />
                                <span>Erro: {testResults[endpoint].error || testResults[endpoint].status}</span>
                              </div>
                              {testResults[endpoint].data && (
                                <pre className="bg-red-50 px-3 py-2 rounded text-sm overflow-x-auto">
                                  {JSON.stringify(testResults[endpoint].data, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => copyToClipboard('curl -X GET "http://localhost:3001/api/health"')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Health Check</div>
              <div className="text-sm text-gray-600">Testar se a API está funcionando</div>
            </button>
            <button
              onClick={() => copyToClipboard('curl -X POST "http://localhost:3001/api/auth/admin/login" -H "Content-Type: application/json" -d \'{"email":"admin@chipwarmup.com","password":"admin123"}\'')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Login Admin</div>
              <div className="text-sm text-gray-600">Obter token de administrador</div>
            </button>
            <button
              onClick={() => copyToClipboard('curl -X GET "http://localhost:3001/api/analytics/overview" -H "Authorization: Bearer YOUR_TOKEN"')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Dashboard Data</div>
              <div className="text-sm text-gray-600">Obter dados do dashboard</div>
            </button>
            <button
              onClick={() => copyToClipboard('curl -X GET "http://localhost:3001/api/reports/whatsapp/21days" -H "Authorization: Bearer YOUR_TOKEN"')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Programa 21 Dias</div>
              <div className="text-sm text-gray-600">Ver programa de aquecimento</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Endpoints; 