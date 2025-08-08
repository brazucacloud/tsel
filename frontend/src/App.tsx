import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Smartphone as SmartphoneIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Call as CallIcon,
  VideoCall as VideoCallIcon,
  PhotoCamera as PhotoCameraIcon,
  Mic as MicIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  Battery90 as Battery90Icon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  DataUsage as DataUsageIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Timer as TimerIcon,
  HourglassEmpty as HourglassEmptyIcon,
  HourglassFull as HourglassFullIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Update as UpdateIcon,
  Sync as SyncIcon,
  CloudSync as CloudSyncIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  WifiOff as WifiOffIcon,
  SignalCellular0Bar as SignalCellular0BarIcon,
  SignalCellular1Bar as SignalCellular1BarIcon,
  SignalCellular2Bar as SignalCellular2BarIcon,
  SignalCellular3Bar as SignalCellular3BarIcon,
  Battery20 as Battery20Icon,
  Battery30 as Battery30Icon,
  Battery50 as Battery50Icon,
  Battery60 as Battery60Icon,
  Battery80 as Battery80Icon,
  BatteryFull as BatteryFullIcon,
  BatteryChargingFull as BatteryChargingFullIcon,
  BatteryCharging20 as BatteryCharging20Icon,
  BatteryCharging30 as BatteryCharging30Icon,
  BatteryCharging50 as BatteryCharging50Icon,
  BatteryCharging60 as BatteryCharging60Icon,
  BatteryCharging80 as BatteryCharging80Icon,
  BatteryCharging90 as BatteryCharging90Icon,
  StorageOutlined as StorageOutlinedIcon,
  MemoryOutlined as MemoryOutlinedIcon,
  NetworkCheckOutlined as NetworkCheckOutlinedIcon,
  Battery90Outlined as Battery90OutlinedIcon,
  SignalCellular4BarOutlined as SignalCellular4BarOutlinedIcon,
  WifiOutlined as WifiOutlinedIcon,
  BluetoothOutlined as BluetoothOutlinedIcon,
  DataUsageOutlined as DataUsageOutlinedIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import components
import Dashboard from './components/Dashboard';
import Timeline21Days from './components/Timeline21Days';
import AndroidControl from './components/AndroidControl';

const drawerWidth = 280;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    component: 'dashboard',
    badge: null
  },
  {
    text: 'Timeline 21 Dias',
    icon: <TimelineIcon />,
    component: 'timeline',
    badge: null
  },
  {
    text: 'Controle Android',
    icon: <SmartphoneIcon />,
    component: 'android-control',
    badge: '3'
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    component: 'analytics',
    badge: null
  },
  {
    text: 'Configurações',
    icon: <SettingsIcon />,
    component: 'settings',
    badge: null
  }
];

function App() {
  const [currentComponent, setCurrentComponent] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleComponentChange = (component: string) => {
    setCurrentComponent(component);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'timeline':
        return <Timeline21Days />;
      case 'android-control':
        return <AndroidControl />;
      case 'analytics':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body1">
              Componente de Analytics em desenvolvimento...
            </Typography>
          </Box>
        );
      case 'settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Configurações
            </Typography>
            <Typography variant="body1">
              Componente de Configurações em desenvolvimento...
            </Typography>
          </Box>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
              TSEL - Sistema de Aquecimento WhatsApp
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Notificações">
                <IconButton color="inherit">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Perfil">
                <IconButton color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
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
              backgroundColor: '#f8f9fa',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            {/* Logo/Brand */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </motion.div>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                TSEL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                WhatsApp Warm-up System
              </Typography>
            </Box>

            <Divider sx={{ mx: 2, mb: 2 }} />

            {/* Menu Items */}
            <List>
              {menuItems.map((item) => (
                <motion.div
                  key={item.text}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    button
                    onClick={() => handleComponentChange(item.component)}
                    sx={{
                      mx: 1,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: currentComponent === item.component ? 'primary.main' : 'transparent',
                      color: currentComponent === item.component ? 'white' : 'text.primary',
                      '&:hover': {
                        backgroundColor: currentComponent === item.component ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: currentComponent === item.component ? 'white' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.badge && (
                      <Badge
                        badgeContent={item.badge}
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: currentComponent === item.component ? 'white' : undefined,
                            color: currentComponent === item.component ? 'primary.main' : undefined,
                          },
                        }}
                      />
                    )}
                  </ListItem>
                </motion.div>
              ))}
            </List>

            <Divider sx={{ mx: 2, my: 2 }} />

            {/* Quick Stats */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Status Rápido
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        3
                      </Typography>
                      <Typography variant="caption">Online</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        2
                      </Typography>
                      <Typography variant="caption">Aquecendo</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Toolbar />
          {renderComponent()}
        </Box>

        {/* Speed Dial */}
        <SpeedDial
          ariaLabel="Ações rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Adicionar Dispositivo"
            onClick={() => console.log('Adicionar dispositivo')}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Atualizar"
            onClick={() => console.log('Atualizar')}
          />
          <SpeedDialAction
            icon={<CloudDownloadIcon />}
            tooltipTitle="Baixar APK"
            onClick={() => console.log('Baixar APK')}
          />
          <SpeedDialAction
            icon={<SettingsIcon />}
            tooltipTitle="Configurações"
            onClick={() => handleComponentChange('settings')}
          />
        </SpeedDial>
      </Box>
    </ThemeProvider>
  );
}

export default App; 