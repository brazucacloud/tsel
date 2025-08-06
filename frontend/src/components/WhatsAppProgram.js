import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaPlay,
  FaPause,
  FaStop,
  FaDownload,
  FaPrint,
  FaShare,
  FaBookmark,
  FaEye,
  FaEyeSlash,
  FaWhatsapp,
  FaMobile,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

const WhatsAppProgram = () => {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/whatsapp/21days', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgram(response.data.data);
    } catch (err) {
      setError('Erro ao carregar programa de 21 dias');
      console.error('Program error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  const selectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
  };

  const startProgram = () => {
    setIsPlaying(true);
    setCurrentProgress(0);
    // Simular progresso
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
  };

  const pauseProgram = () => {
    setIsPlaying(false);
  };

  const stopProgram = () => {
    setIsPlaying(false);
    setCurrentProgress(0);
  };

  const exportProgram = () => {
    const dataStr = JSON.stringify(program, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'programa-21-dias-whatsapp.json';
    link.click();
  };

  const printProgram = () => {
    window.print();
  };

  const shareProgram = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Programa de Aquecimento WhatsApp - 21 Dias',
        text: 'Programa completo para aquecimento seguro de números WhatsApp',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
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
            onClick={fetchProgram}
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
                <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
              </div>
              <p className="text-gray-600">{program.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={startProgram}
                disabled={isPlaying}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <FaPlay />
                <span>Iniciar</span>
              </button>
              <button
                onClick={pauseProgram}
                disabled={!isPlaying}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <FaPause />
                <span>Pausar</span>
              </button>
              <button
                onClick={stopProgram}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <FaStop />
                <span>Parar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isPlaying && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso do Programa</span>
                <span className="text-sm font-medium text-gray-700">{currentProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Dias</p>
                <p className="text-2xl font-bold text-gray-900">{program.totalDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
                <p className="text-2xl font-bold text-gray-900">{program.summary.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média por Dia</p>
                <p className="text-2xl font-bold text-gray-900">{program.summary.averageTasksPerDay}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progression</p>
                <p className="text-sm font-bold text-gray-900">Gradual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ações</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportProgram}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaDownload />
                <span>Exportar</span>
              </button>
              <button
                onClick={printProgram}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              >
                <FaPrint />
                <span>Imprimir</span>
              </button>
              <button
                onClick={shareProgram}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2"
              >
                <FaShare />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Program Days */}
        <div className="space-y-6">
          {Object.entries(program.program).map(([dayNumber, dayData]) => (
            <div key={dayNumber} className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleDay(dayNumber)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <span className="text-green-600 font-bold text-lg">{dayData.day}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dayData.title}</h3>
                    <p className="text-gray-600">{dayData.tasks.length} tarefas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FaWhatsapp className="text-green-500" />
                    <span className="text-sm text-gray-600">WhatsApp</span>
                  </div>
                  {expandedDays[dayNumber] ? <FaEyeSlash /> : <FaEye />}
                </div>
              </button>

              {expandedDays[dayNumber] && (
                <div className="border-t border-gray-200 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Tarefas do Dia {dayData.day}</h4>
                      <div className="space-y-3">
                        {dayData.tasks.map((task, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                            </div>
                            <p className="text-sm text-gray-700">{task}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Informações do Dia</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaInfoCircle className="text-blue-500" />
                            <span className="font-medium text-blue-900">Dica do Dia</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {dayData.day <= 7 ? 'Fase inicial - foco na configuração e primeiros contatos' :
                             dayData.day <= 14 ? 'Fase intermediária - expansão de atividades' :
                             'Fase avançada - consolidação e otimização'}
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaCheckCircle className="text-green-500" />
                            <span className="font-medium text-green-900">Objetivos</span>
                          </div>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Aumentar gradualmente a atividade</li>
                            <li>• Manter comportamento natural</li>
                            <li>• Evitar padrões suspeitos</li>
                            <li>• Construir credibilidade</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaExclamationTriangle className="text-yellow-500" />
                            <span className="font-medium text-yellow-900">Precauções</span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Não exceder limites diários</li>
                            <li>• Manter intervalos naturais</li>
                            <li>• Variar horários de atividade</li>
                            <li>• Monitorar respostas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => selectDay(dayNumber)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                        >
                          <FaPlay />
                          <span>Executar Dia {dayData.day}</span>
                        </button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                          <FaBookmark />
                          <span>Marcar como Favorito</span>
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Duração estimada: {Math.ceil(dayData.tasks.length * 2)} minutos
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Executando Dia {selectedDay}
                  </h2>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {program.program[selectedDay]?.tasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{task}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Executando...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppProgram; 