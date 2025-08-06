import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  FaWhatsapp, 
  FaCode, 
  FaCalendarAlt, 
  FaPhone, 
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaFolderOpen,
  FaMobile,
  FaShare
} from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import Endpoints from './components/Endpoints';
import WhatsAppProgram from './components/WhatsAppProgram';
import WhatsAppReports from './components/WhatsAppReports';
import ContentRepository from './components/ContentRepository';
import SendableContentLibrary from './components/SendableContentLibrary';
import AndroidIntegration from './components/AndroidIntegration';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulado

  const menuItems = [
    { name: 'Dashboard', icon: <FaChartLine />, path: '/dashboard' },
    { name: 'API Endpoints', icon: <FaCode />, path: '/endpoints' },
    { name: 'Programa 21 Dias', icon: <FaCalendarAlt />, path: '/program' },
    { name: 'Relatórios WhatsApp', icon: <FaPhone />, path: '/reports' },
    { name: 'Repositório de Conteúdo', icon: <FaFolderOpen />, path: '/content' },
    { name: 'Biblioteca de Conteúdo Enviável', icon: <FaShare />, path: '/sendable-content' },
    { name: 'Integração Android', icon: <FaMobile />, path: '/android' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <FaWhatsapp className="text-green-500 text-4xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Chip Warmup</h1>
            <p className="text-gray-600">Sistema de Aquecimento WhatsApp</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(true)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Entrar no Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {sidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className="flex items-center space-x-3 ml-4 lg:ml-0">
                  <FaWhatsapp className="text-green-500 text-2xl" />
                  <h1 className="text-xl font-semibold text-gray-900">Chip Warmup</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Admin</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <FaSignOutAlt />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.path}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>
              
              {/* Mobile close button */}
              <div className="lg:hidden p-4 border-t border-gray-200">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <FaTimes className="mr-2" />
                  Fechar Menu
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:ml-0">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/endpoints" element={<Endpoints />} />
              <Route path="/program" element={<WhatsAppProgram />} />
              <Route path="/reports" element={<WhatsAppReports />} />
              <Route path="/content" element={<ContentRepository />} />
              <Route path="/sendable-content" element={<SendableContentLibrary />} />
              <Route path="/android" element={<AndroidIntegration />} />
            </Routes>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
};

export default App; 