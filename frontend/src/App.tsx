import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Smartphone,
  Assignment,
  Analytics,
  Settings,
  AccountCircle,
  Notifications,
  Brightness4,
  Brightness7,
  Logout,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { lightTheme, darkTheme } from './theme';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Tasks from './pages/Tasks';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import apiService from './services/api';
import webSocketService from './services/websocket';
import { User } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const drawerWidth = 240;

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    // Check if user is logged in
    const token = apiService.getToken();
    const savedUser = apiService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Listen for system alerts
    webSocketService.on('system_alert', (alert) => {
      setNotifications(prev => [alert, ...prev.slice(0, 9)]);
      setSnackbar({
        open: true,
        message: alert.message,
        severity: alert.level,
      });
    });

    return () => {
      webSocketService.off('system_alert');
    };
  }, []);

  const handleLogout = () => {
    apiService.logout();
    webSocketService.disconnect();
    setUser(null);
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Dispositivos', icon: <Smartphone />, path: '/devices' },
    { text: 'Tarefas', icon: <Assignment />, path: '/tasks' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Configurações', icon: <Settings />, path: '/settings' },
  ];

  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Login onLogin={(userData) => setUser(userData)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar
              position="fixed"
              sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  sx={{ mr: 2, display: { sm: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  Chip Warmup - Sistema de Monitoramento
                </Typography>
                
                <IconButton color="inherit" onClick={handleThemeToggle}>
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                
                <IconButton color="inherit">
                  <Badge badgeContent={notifications.length} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                
                <IconButton
                  color="inherit"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <AccountCircle />
                  </Avatar>
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
              variant="permanent"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Toolbar />
              <Box sx={{ overflow: 'auto' }}>
                <List>
                  {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton
                        component="a"
                        href={item.path}
                        sx={{
                          '&.active': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>

            {/* Mobile Drawer */}
            <Drawer
              variant="temporary"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
            >
              <Toolbar />
              <Box sx={{ overflow: 'auto' }}>
                <List>
                  {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton
                        component="a"
                        href={item.path}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
              }}
            >
              <Toolbar />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Box>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onClick={() => setAnchorEl(null)}
          >
            <MenuItem>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              {user.username}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 