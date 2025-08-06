import React, { useState } from 'react';
import { 
  FaCode, 
  FaCopy, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaWhatsapp,
  FaDatabase,
  FaChartLine,
  FaUsers,
  FaCog,
  FaShieldAlt
} from 'react-icons/fa';

const APIEndpoints = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [testResults, setTestResults] = useState({});

  const baseURL = 'http://localhost:3001';

  const endpoints = [
    {
      category: 'Autenticação',
      icon: <FaShieldAlt className="text-blue-500" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/device/register',
          description: 'Registrar novo dispositivo',
          example: {
            body: {
              deviceId: 'device_123',
              deviceName: 'Samsung Galaxy S23',
              manufacturer: 'Samsung',
              model: 'Galaxy S23',
              androidVersion: '13',
              appVersion: '2.1.0'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/auth/device/login',
          description: 'Login de dispositivo',
          example: {
            body: {
              deviceId: 'device_123'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/auth/admin/login',
          description: 'Login de administrador',
          example: {
            body: {
              email: 'admin@chipwarmup.com',
              password: 'admin123'
            }
          }
        }
      ]
    },
    {
      category: 'Dispositivos',
      icon: <FaUsers className="text-green-500" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/devices',
          description: 'Listar todos os dispositivos',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/devices/:id',
          description: 'Obter dispositivo específico',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/devices',
          description: 'Criar novo dispositivo',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              deviceId: 'device_456',
              deviceName: 'iPhone 15',
              manufacturer: 'Apple',
              model: 'iPhone 15',
              androidVersion: '17',
              appVersion: '2.1.0'
            }
          }
        },
        {
          method: 'PUT',
          path: '/api/devices/:id',
          description: 'Atualizar dispositivo',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              isOnline: true,
              lastSeen: new Date().toISOString()
            }
          }
        },
        {
          method: 'DELETE',
          path: '/api/devices/:id',
          description: 'Remover dispositivo',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        }
      ]
    },
    {
      category: 'Tarefas',
      icon: <FaCog className="text-purple-500" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/tasks',
          description: 'Listar todas as tarefas',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              status: 'completed',
              type: 'whatsapp_message',
              deviceId: 'device_123'
            }
          }
        },
        {
          method: 'POST',
          path: '/api/tasks',
          description: 'Criar nova tarefa',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              deviceId: 'device_123',
              type: 'whatsapp_message',
              parameters: {
                phone: '+5511999999999',
                message: 'Olá! Esta é uma mensagem automática.',
                delay: 5000
              },
              priority: 'normal',
              description: 'Enviar mensagem WhatsApp'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/tasks/:id',
          description: 'Obter tarefa específica',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'PUT',
          path: '/api/tasks/:id',
          description: 'Atualizar tarefa',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              status: 'completed',
              result: {
                messageId: 'msg_123456',
                timestamp: new Date().toISOString()
              }
            }
          }
        },
        {
          method: 'DELETE',
          path: '/api/tasks/:id',
          description: 'Remover tarefa',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        }
      ]
    },
    {
      category: 'Analytics',
      icon: <FaChartLine className="text-orange-500" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/analytics/overview',
          description: 'Visão geral do dashboard',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/devices',
          description: 'Estatísticas de dispositivos',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              period: '7d',
              status: 'online'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/tasks',
          description: 'Estatísticas de tarefas',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              period: '30d',
              type: 'whatsapp_message'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/realtime',
          description: 'Dados em tempo real',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/whatsapp-numbers',
          description: 'Relatório de números WhatsApp',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              period: '30d',
              status: 'completed'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/21-day-program',
          description: 'Programa de 21 dias',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              phone: '+5511999999999'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/number-detail/:phone',
          description: 'Detalhes de número específico',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              period: '30d'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/analytics/export',
          description: 'Exportar dados',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            query: {
              type: 'tasks',
              format: 'json',
              period: '7d'
            }
          }
        }
      ]
    },
    {
      category: 'WhatsApp Específico',
      icon: <FaWhatsapp className="text-green-500" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/whatsapp/send-message',
          description: 'Enviar mensagem WhatsApp',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              deviceId: 'device_123',
              phone: '+5511999999999',
              message: 'Mensagem automática',
              delay: 5000
            }
          }
        },
        {
          method: 'POST',
          path: '/api/whatsapp/send-media',
          description: 'Enviar mídia WhatsApp',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              deviceId: 'device_123',
              phone: '+5511999999999',
              mediaUrl: 'https://example.com/image.jpg',
              caption: 'Legenda da imagem',
              delay: 8000
            }
          }
        },
        {
          method: 'POST',
          path: '/api/whatsapp/send-group',
          description: 'Enviar mensagem para grupo',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            },
            body: {
              deviceId: 'device_123',
              groupId: 'group_123',
              message: 'Mensagem para grupo',
              delay: 3000
            }
          }
        }
      ]
    },
    {
      category: 'Sistema',
      icon: <FaDatabase className="text-gray-500" />,
      endpoints: [
        {
          method: 'GET',
          path: '/health',
          description: 'Health check do sistema',
          example: {}
        },
        {
          method: 'GET',
          path: '/api/system/info',
          description: 'Informações do sistema',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/system/stats',
          description: 'Estatísticas do sistema',
          example: {
            headers: {
              'Authorization': 'Bearer <token>'
            }
          }
        }
      ]
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const testEndpoint = async (endpoint) => {
    try {
      const url = `${baseURL}${endpoint.path}`;
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.example?.headers
        }
      };

      if (endpoint.example?.body) {
        options.body = JSON.stringify(endpoint.example.body);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      setTestResults({
        ...testResults,
        [endpoint.path]: {
          success: response.ok,
          status: response.status,
          data: result
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        [endpoint.path]: {
          success: false,
          error: error.message
        }
      });
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaCode className="text-blue-500 mr-3" />
              API Endpoints
            </h1>
            <p className="text-gray-600">Documentação completa da API com exemplos e testes</p>
          </div>
          <div className="text-sm text-gray-500">
            Base URL: <code className="bg-gray-200 px-2 py-1 rounded">{baseURL}</code>
          </div>
        </div>
      </div>

      {/* Endpoints by Category */}
      <div className="space-y-8">
        {endpoints.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg shadow-md">
            {/* Category Header */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                {category.icon}
                <span className="ml-3">{category.category}</span>
              </h2>
            </div>

            {/* Endpoints List */}
            <div className="divide-y divide-gray-200">
              {category.endpoints.map((endpoint, endpointIndex) => (
                <div key={endpointIndex} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Method and Path */}
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {endpoint.path}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${baseURL}${endpoint.path}`)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedEndpoint === `${baseURL}${endpoint.path}` ? <FaCheck className="text-green-500" /> : <FaCopy />}
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-3">{endpoint.description}</p>

                      {/* Example */}
                      {endpoint.example && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Exemplo:</h4>
                          
                          {/* Headers */}
                          {endpoint.example.headers && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Headers:</p>
                              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(endpoint.example.headers, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Query Parameters */}
                          {endpoint.example.query && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Query Parameters:</p>
                              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(endpoint.example.query, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Body */}
                          {endpoint.example.body && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Body:</p>
                              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(endpoint.example.body, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Empty example */}
                          {!endpoint.example.headers && !endpoint.example.query && !endpoint.example.body && (
                            <p className="text-xs text-gray-500">Nenhum parâmetro necessário</p>
                          )}
                        </div>
                      )}

                      {/* Test Result */}
                      {testResults[endpoint.path] && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          testResults[endpoint.path].success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {testResults[endpoint.path].success ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaTimes className="text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              testResults[endpoint.path].success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {testResults[endpoint.path].success ? 'Sucesso' : 'Erro'}
                            </span>
                            {testResults[endpoint.path].status && (
                              <span className="text-xs text-gray-500">
                                Status: {testResults[endpoint.path].status}
                              </span>
                            )}
                          </div>
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(testResults[endpoint.path].data || testResults[endpoint.path].error, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Test Button */}
                    <div className="ml-4">
                      <button
                        onClick={() => testEndpoint(endpoint)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                      >
                        <FaPlay />
                        <span>Testar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Referência Rápida</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Autenticação</h3>
            <p className="text-sm text-gray-600">
              Todos os endpoints (exceto /health) requerem token JWT no header Authorization
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Formato de Resposta</h3>
            <p className="text-sm text-gray-600">
              Todas as respostas seguem o formato: {'{success: boolean, data: any, message?: string}'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Códigos de Status</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>200: Sucesso</li>
              <li>400: Erro de validação</li>
              <li>401: Não autorizado</li>
              <li>404: Não encontrado</li>
              <li>500: Erro interno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIEndpoints; 