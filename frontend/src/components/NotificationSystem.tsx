import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Badge,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  NotificationsNone,
  NotificationsPaused,
  VolumeUp,
  VolumeOff,
  Settings,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  Archive,
  Unarchive,
  FilterList,
  Search,
  Add,
  Edit,
  Save,
  Cancel,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Info,
  PriorityHigh,
  Schedule,
  Email,
  WhatsApp,
  Sms,
  PushPin,
  Star,
  StarBorder,
  MoreVert,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AccessTime,
  Today,
  DateRange,
  Timer,
  Alarm,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  NotificationsNone as NotificationsNoneIcon,
  NotificationsPaused as NotificationsPausedIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  PushPin as PushPinIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  AccessTime as AccessTimeIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Timer as TimerIcon,
  Alarm as AlarmIcon,
  Smartphone,
  Tablet,
  Laptop,
  DesktopMac,
  Router,
  Hub,
  Api,
  Webhook,
  Code,
  BugReport,
  Build,
  Engineering,
  Science,
  Psychology,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  ShowChart,
  HourglassEmpty,
  HourglassFull,
  Event,
  Update,
  Sync,
  CloudSync,
  CloudDone,
  CloudOff,
  WifiOff,
  SignalCellular0Bar,
  SignalCellular1Bar,
  SignalCellular2Bar,
  SignalCellular3Bar,
  Battery20,
  Battery30,
  Battery50,
  Battery60,
  Battery80,
  BatteryFull,
  BatteryChargingFull,
  BatteryCharging20,
  BatteryCharging30,
  BatteryCharging50,
  BatteryCharging60,
  BatteryCharging80,
  BatteryCharging90,
  Storage,
  Memory,
  NetworkCheck,
  Wifi,
  Bluetooth,
  DataUsage,
  GetApp,
  Share,
  Print,
  Phone,
  Message,
  VideoCall,
  Group,
  PhotoCamera,
  Mic,
  Send,
  TrendingUp,
  TrendingDown,
  Speed,
  Security,
  Lock,
  LockOpen,
  VpnKey,
  QrCode,
  QrCodeScanner,
  Language,
  Palette,
  Brightness4,
  Brightness7,
  AutoAwesome,
  Tune
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationSystemProps {
  onNotificationChange?: (notifications: any) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'device' | 'task' | 'security' | 'performance' | 'backup';
  timestamp: Date;
  read: boolean;
  archived: boolean;
  starred: boolean;
  pinned: boolean;
  source: string;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  volume: number;
  desktop: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
  categories: {
    system: boolean;
    device: boolean;
    task: boolean;
    security: boolean;
    performance: boolean;
    backup: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  autoArchive: {
    enabled: boolean;
    days: number;
  };
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ onNotificationChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    volume: 70,
    desktop: true,
    email: false,
    sms: false,
    whatsapp: false,
    push: true,
    categories: {
      system: true,
      device: true,
      task: true,
      security: true,
      performance: true,
      backup: true
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      critical: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    autoArchive: {
      enabled: true,
      days: 30
    }
  });

  const [filters, setFilters] = useState({
    read: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadNotifications();
    startRealTimeUpdates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filters, searchTerm]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simular carregamento de notificações
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Dispositivo Conectado',
          message: 'Novo dispositivo Android foi conectado ao sistema',
          type: 'success',
          priority: 'medium',
          category: 'device',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          archived: false,
          starred: false,
          pinned: false,
          source: 'Android Integration'
        },
        {
          id: '2',
          title: 'Tarefa Falhou',
          message: 'A tarefa de warmup do número +5511999999999 falhou após 3 tentativas',
          type: 'error',
          priority: 'high',
          category: 'task',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          archived: false,
          starred: true,
          pinned: false,
          source: 'Task Manager'
        },
        {
          id: '3',
          title: 'Backup Automático',
          message: 'Backup automático realizado com sucesso. 2.5GB de dados salvos',
          type: 'success',
          priority: 'low',
          category: 'backup',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: true,
          archived: false,
          starred: false,
          pinned: false,
          source: 'Backup System'
        },
        {
          id: '4',
          title: 'Alerta de Segurança',
          message: 'Tentativa de login suspeita detectada do IP 192.168.1.100',
          type: 'warning',
          priority: 'critical',
          category: 'security',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          archived: false,
          starred: true,
          pinned: true,
          source: 'Security Monitor'
        },
        {
          id: '5',
          title: 'Performance Degradada',
          message: 'Uso de CPU atingiu 85%. Considere otimizar as configurações',
          type: 'warning',
          priority: 'medium',
          category: 'performance',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          read: true,
          archived: false,
          starred: false,
          pinned: false,
          source: 'Performance Monitor'
        }
      ];

      setNotifications(mockNotifications);
      setSnackbar({
        open: true,
        message: 'Notificações carregadas com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar notificações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Atualização em Tempo Real',
        message: `Sistema sincronizado em ${new Date().toLocaleTimeString()}`,
        type: 'info',
        priority: 'low',
        category: 'system',
        timestamp: new Date(),
        read: false,
        archived: false,
        starred: false,
        pinned: false,
        source: 'Real-time Monitor'
      };

      setNotifications(prev => [newNotification, ...prev]);
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filtro por leitura
    if (filters.read !== 'all') {
      filtered = filtered.filter(n => 
        filters.read === 'read' ? n.read : !n.read
      );
    }

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    // Filtro por prioridade
    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Filtro por data
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(n => {
        switch (filters.dateRange) {
          case 'today':
            return n.timestamp >= today;
          case 'yesterday':
            return n.timestamp >= yesterday && n.timestamp < today;
          case 'week':
            return n.timestamp >= weekAgo;
          default:
            return true;
        }
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const toggleStar = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    );
  };

  const togglePin = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <SettingsIcon />;
      case 'device': return <Smartphone />;
      case 'task': return <ScheduleIcon />;
      case 'security': return <Security />;
      case 'performance': return <Speed />;
      case 'backup': return <Backup />;
      default: return <NotificationsIcon />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return timestamp.toLocaleDateString();
  };

  const renderNotificationList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar notificações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.read}
            onChange={(e) => setFilters({ ...filters, read: e.target.value })}
            label="Status"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="unread">Não lidas</MenuItem>
            <MenuItem value="read">Lidas</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Categoria</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            label="Categoria"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="system">Sistema</MenuItem>
            <MenuItem value="device">Dispositivo</MenuItem>
            <MenuItem value="task">Tarefa</MenuItem>
            <MenuItem value="security">Segurança</MenuItem>
            <MenuItem value="performance">Performance</MenuItem>
            <MenuItem value="backup">Backup</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Prioridade</InputLabel>
          <Select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            label="Prioridade"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="critical">Crítica</MenuItem>
            <MenuItem value="high">Alta</MenuItem>
            <MenuItem value="medium">Média</MenuItem>
            <MenuItem value="low">Baixa</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Período</InputLabel>
          <Select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            label="Período"
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="today">Hoje</MenuItem>
            <MenuItem value="yesterday">Ontem</MenuItem>
            <MenuItem value="week">Última semana</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'es' : ''}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={markAllAsRead}
          disabled={filteredNotifications.every(n => n.read)}
        >
          Marcar todas como lidas
        </Button>
      </Box>

      <AnimatePresence>
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              sx={{
                mb: 2,
                border: notification.pinned ? 2 : 1,
                borderColor: notification.pinned ? 'primary.main' : 'divider',
                backgroundColor: notification.read ? 'background.paper' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: notification.read ? 'grey.300' : 'primary.main',
                      color: notification.read ? 'grey.600' : 'white'
                    }}
                  >
                    {getTypeIcon(notification.type)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {notification.title}
                          {notification.pinned && <PushPinIcon color="primary" fontSize="small" />}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={notification.category}
                            size="small"
                            icon={getCategoryIcon(notification.category)}
                          />
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            • {notification.source}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleStar(notification.id)}
                          color={notification.starred ? 'primary' : 'default'}
                        >
                          {notification.starred ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => togglePin(notification.id)}
                          color={notification.pinned ? 'primary' : 'default'}
                        >
                          <PushPinIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredNotifications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <NotificationsNoneIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhuma notificação encontrada
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Tente ajustar os filtros ou verificar se há novas notificações
          </Typography>
        </Box>
      )}
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configurações Gerais
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  />
                }
                label="Notificações habilitadas"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sound}
                    onChange={(e) => setSettings({ ...settings, sound: e.target.checked })}
                  />
                }
                label="Som de notificação"
              />
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Volume</Typography>
                <Slider
                  value={settings.volume}
                  onChange={(_, value) => setSettings({ ...settings, volume: value as number })}
                  disabled={!settings.sound}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Canais de Notificação
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.desktop}
                    onChange={(e) => setSettings({ ...settings, desktop: e.target.checked })}
                  />
                }
                label="Notificações desktop"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.checked })}
                  />
                }
                label="Notificações por email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sms}
                    onChange={(e) => setSettings({ ...settings, sms: e.target.checked })}
                  />
                }
                label="Notificações por SMS"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.checked })}
                  />
                }
                label="Notificações por WhatsApp"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filtros de Notificação
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Categorias
                  </Typography>
                  <FormGroup>
                    {Object.entries(settings.categories).map(([category, enabled]) => (
                      <FormControlLabel
                        key={category}
                        control={
                          <Checkbox
                            checked={enabled}
                            onChange={(e) => setSettings({
                              ...settings,
                              categories: {
                                ...settings.categories,
                                [category]: e.target.checked
                              }
                            })}
                          />
                        }
                        label={category.charAt(0).toUpperCase() + category.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Prioridades
                  </Typography>
                  <FormGroup>
                    {Object.entries(settings.priorities).map(([priority, enabled]) => (
                      <FormControlLabel
                        key={priority}
                        control={
                          <Checkbox
                            checked={enabled}
                            onChange={(e) => setSettings({
                              ...settings,
                              priorities: {
                                ...settings.priorities,
                                [priority]: e.target.checked
                              }
                            })}
                          />
                        }
                        label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const tabs = [
    { label: 'Notificações', icon: <Notifications />, count: filteredNotifications.length },
    { label: 'Configurações', icon: <Settings /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsActive sx={{ mr: 2, color: 'primary.main' }} />
          Sistema de Notificações
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Gerencie todas as notificações do sistema em tempo real
        </Typography>
      </motion.div>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Carregando notificações...
          </Typography>
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                  {index === 0 && tab.count > 0 && (
                    <Badge badgeContent={tab.count} color="primary" />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {activeTab === 0 ? renderNotificationList() : renderSettings()}
      </Box>

      {/* Dialog para ações da notificação */}
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              Ações da Notificação
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedNotification.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedNotification.message}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={selectedNotification.category} />
                <Chip
                  label={selectedNotification.priority}
                  color={getPriorityColor(selectedNotification.priority) as any}
                />
                <Chip label={selectedNotification.source} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => markAsRead(selectedNotification.id)}
                disabled={selectedNotification.read}
                startIcon={<MarkEmailReadIcon />}
              >
                Marcar como lida
              </Button>
              <Button
                onClick={() => archiveNotification(selectedNotification.id)}
                startIcon={<ArchiveIcon />}
              >
                Arquivar
              </Button>
              <Button
                onClick={() => deleteNotification(selectedNotification.id)}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Excluir
              </Button>
              <Button onClick={() => setSelectedNotification(null)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
    </Box>
  );
};

export default NotificationSystem;

