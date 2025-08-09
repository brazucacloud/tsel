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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AlertTitle,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  Checkbox,
  InputAdornment,
  OutlinedInput,
  InputLabel as MuiInputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Settings,
  Security,
  Storage,
  NetworkCheck,
  Notifications,
  Backup,
  Restore,
  Save,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Add,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  PowerSettingsNew,
  RestartAlt,
  Update,
  Download,
  Upload,
  Sync,
  CloudDownload,
  CloudUpload,
  Security as SecurityIcon,
  Lock,
  LockOpen,
  VpnKey,
  QrCode,
  QrCodeScanner,
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
  Timer,
  HourglassEmpty,
  HourglassFull,
  Event,
  Today,
  DateRange,
  Update as UpdateIcon,
  Sync as SyncIcon,
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
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  DataUsage as DataUsageIcon,
  FilterList,
  GetApp,
  Share,
  Print,
  Email,
  WhatsApp,
  Phone,
  Message,
  VideoCall,
  Group,
  PhotoCamera,
  Mic,
  Send,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
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
  Battery90 as Battery90Icon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  Wifi as WifiOutlinedIcon,
  Bluetooth as BluetoothOutlinedIcon,
  DataUsage as DataUsageOutlinedIcon,
  Language,
  Palette,
  Brightness4,
  Brightness7,
  VolumeUp,
  VolumeOff,
  NotificationsActive,
  NotificationsOff,
  AutoAwesome,
  Tune,
  Speed,
  Memory,
  Storage as StorageIcon2,
  NetworkCheck as NetworkCheckIcon2,
  Security as SecurityIcon2,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon2,
  Error as ErrorIcon2,
  Warning as WarningIcon2,
  Info as InfoIcon2,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  RestartAlt as RestartAltIcon,
  Update as UpdateIcon2,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Sync as SyncIcon2,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Security as SecurityIcon3,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  DesktopMac as DesktopMacIcon,
  Router as RouterIcon,
  Hub as HubIcon,
  Api as ApiIcon,
  Webhook as WebhookIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  Timer as TimerIcon,
  HourglassEmpty as HourglassEmptyIcon,
  HourglassFull as HourglassFullIcon,
  Event as EventIcon2,
  Today as TodayIcon2,
  DateRange as DateRangeIcon2,
  AccessTime as AccessTimeIcon2,
  Update as UpdateIcon3,
  Sync as SyncIcon3,
  CloudSync as CloudSyncIcon2,
  CloudDone as CloudDoneIcon2,
  CloudOff as CloudOffIcon2,
  WifiOff as WifiOffIcon2,
  SignalCellular0Bar as SignalCellular0BarIcon2,
  SignalCellular1Bar as SignalCellular1BarIcon2,
  SignalCellular2Bar as SignalCellular2BarIcon2,
  SignalCellular3Bar as SignalCellular3BarIcon2,
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
  Storage as StorageIcon3,
  Memory as MemoryIcon2,
  NetworkCheck as NetworkCheckIcon3,
  Wifi as WifiIcon2,
  Bluetooth as BluetoothIcon2,
  DataUsage as DataUsageIcon2,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  VideoCall as VideoCallIcon,
  Group as GroupIcon,
  PhotoCamera as PhotoCameraIcon,
  Mic as MicIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon3,
  Error as ErrorIcon3,
  Warning as WarningIcon3,
  Info as InfoIcon3,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon2,
  Speed as SpeedIcon2,
  Schedule as ScheduleIcon2,
  Event as EventIcon3,
  Today as TodayIcon3,
  DateRange as DateRangeIcon3,
  AccessTime as AccessTimeIcon3,
  Update as UpdateIcon4,
  Sync as SyncIcon4,
  CloudSync as CloudSyncIcon3,
  CloudDone as CloudDoneIcon3,
  CloudOff as CloudOffIcon3,
  WifiOff as WifiOffIcon3,
  SignalCellular0Bar as SignalCellular0BarIcon3,
  SignalCellular1Bar as SignalCellular1BarIcon3,
  SignalCellular2Bar as SignalCellular2BarIcon3,
  SignalCellular3Bar as SignalCellular3BarIcon3,
  Battery90 as Battery90Icon2,
  SignalCellular4Bar as SignalCellular4BarIcon2,
  Wifi as WifiOutlinedIcon2,
  Bluetooth as BluetoothOutlinedIcon2,
  DataUsage as DataUsageOutlinedIcon2
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SystemSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

interface SettingsData {
  general: {
    language: string;
    theme: string;
    autoSave: boolean;
    notifications: boolean;
    sound: boolean;
    volume: number;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    ipWhitelist: string[];
    encryptionLevel: string;
  };
  performance: {
    cacheEnabled: boolean;
    cacheSize: number;
    compression: boolean;
    maxConnections: number;
    timeout: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    cloudBackup: boolean;
    encryption: boolean;
  };
  network: {
    proxyEnabled: boolean;
    proxyUrl: string;
    proxyPort: number;
    sslEnabled: boolean;
    rateLimit: number;
  };
  api: {
    apiEnabled: boolean;
    apiKey: string;
    webhookUrl: string;
    corsEnabled: boolean;
    corsOrigins: string[];
  };
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [settings, setSettings] = useState<SettingsData>({
    general: {
      language: 'pt-BR',
      theme: 'light',
      autoSave: true,
      notifications: true,
      sound: true,
      volume: 70
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      ipWhitelist: ['127.0.0.1', '192.168.1.0/24'],
      encryptionLevel: 'AES-256'
    },
    performance: {
      cacheEnabled: true,
      cacheSize: 512,
      compression: true,
      maxConnections: 100,
      timeout: 30
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      cloudBackup: false,
      encryption: true
    },
    network: {
      proxyEnabled: false,
      proxyUrl: '',
      proxyPort: 8080,
      sslEnabled: true,
      rateLimit: 1000
    },
    api: {
      apiEnabled: true,
      apiKey: 'sk-1234567890abcdef',
      webhookUrl: '',
      corsEnabled: true,
      corsOrigins: ['http://localhost:3000', 'https://app.example.com']
    }
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [backupDialog, setBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simular carregamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: 'Configurações carregadas com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
      
      setSnackbar({
        open: true,
        message: 'Configurações salvas com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const generateApiKey = () => {
    const newKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    handleSettingChange('api', 'apiKey', newKey);
  };

  const handleBackup = async () => {
    setBackupDialog(false);
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSnackbar({
        open: true,
        message: 'Backup realizado com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao realizar backup',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoreDialog(false);
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSnackbar({
        open: true,
        message: 'Restauração realizada com sucesso',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao restaurar configurações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetDialog(false);
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      loadSettings();
      setSnackbar({
        open: true,
        message: 'Configurações resetadas para padrão',
        severity: 'info'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao resetar configurações',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'Geral', icon: <Settings />, color: 'primary' },
    { label: 'Segurança', icon: <Security />, color: 'error' },
    { label: 'Performance', icon: <Speed />, color: 'warning' },
    { label: 'Backup', icon: <Backup />, color: 'info' },
    { label: 'Rede', icon: <NetworkCheck />, color: 'secondary' },
    { label: 'API', icon: <Api />, color: 'success' }
  ];

  const renderGeneralSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                Idioma e Tema
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={settings.general.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                >
                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="es-ES">Español</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tema</InputLabel>
                <Select
                  value={settings.general.theme}
                  onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Escuro</MenuItem>
                  <MenuItem value="auto">Automático</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Notificações
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.notifications}
                    onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
                  />
                }
                label="Ativar notificações"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.sound}
                    onChange={(e) => handleSettingChange('general', 'sound', e.target.checked)}
                  />
                }
                label="Som de notificação"
              />
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Volume</Typography>
                <Slider
                  value={settings.general.volume}
                  onChange={(_, value) => handleSettingChange('general', 'volume', value)}
                  disabled={!settings.general.sound}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                Automação
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.autoSave}
                    onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                  />
                }
                label="Salvamento automático"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderSecuritySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                Autenticação
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                }
                label="Autenticação de dois fatores"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Política de senha</InputLabel>
                <Select
                  value={settings.security.passwordPolicy}
                  onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                >
                  <MenuItem value="weak">Fraca</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="strong">Forte</MenuItem>
                  <MenuItem value="very-strong">Muito Forte</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Timeout da sessão (minutos)</InputLabel>
                <Select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                >
                  <MenuItem value={15}>15 minutos</MenuItem>
                  <MenuItem value={30}>30 minutos</MenuItem>
                  <MenuItem value={60}>1 hora</MenuItem>
                  <MenuItem value={120}>2 horas</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Criptografia
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Nível de criptografia</InputLabel>
                <Select
                  value={settings.security.encryptionLevel}
                  onChange={(e) => handleSettingChange('security', 'encryptionLevel', e.target.value)}
                >
                  <MenuItem value="AES-128">AES-128</MenuItem>
                  <MenuItem value="AES-256">AES-256</MenuItem>
                  <MenuItem value="ChaCha20">ChaCha20</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                Whitelist de IP
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                IPs permitidos para acesso ao sistema
              </Typography>
              <Box sx={{ mt: 2 }}>
                {settings.security.ipWhitelist.map((ip, index) => (
                  <Chip
                    key={index}
                    label={ip}
                    onDelete={() => {
                      const newList = settings.security.ipWhitelist.filter((_, i) => i !== index);
                      handleSettingChange('security', 'ipWhitelist', newList);
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => {
                    const newIp = prompt('Digite o IP ou range (ex: 192.168.1.0/24):');
                    if (newIp) {
                      const newList = [...settings.security.ipWhitelist, newIp];
                      handleSettingChange('security', 'ipWhitelist', newList);
                    }
                  }}
                >
                  Adicionar IP
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderPerformanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cache
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.cacheEnabled}
                    onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                  />
                }
                label="Ativar cache"
              />
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Tamanho do cache (MB)</Typography>
                <Slider
                  value={settings.performance.cacheSize}
                  onChange={(_, value) => handleSettingChange('performance', 'cacheSize', value)}
                  disabled={!settings.performance.cacheEnabled}
                  valueLabelDisplay="auto"
                  min={64}
                  max={2048}
                  step={64}
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.performance.compression}
                    onChange={(e) => handleSettingChange('performance', 'compression', e.target.checked)}
                  />
                }
                label="Compressão de dados"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                Conexões
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Máximo de conexões</InputLabel>
                <Select
                  value={settings.performance.maxConnections}
                  onChange={(e) => handleSettingChange('performance', 'maxConnections', e.target.value)}
                >
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Timeout (segundos)</InputLabel>
                <Select
                  value={settings.performance.timeout}
                  onChange={(e) => handleSettingChange('performance', 'timeout', e.target.value)}
                >
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                  <MenuItem value={120}>120</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderBackupSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
                Backup Automático
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.backup.autoBackup}
                    onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                  />
                }
                label="Ativar backup automático"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequência</InputLabel>
                <Select
                  value={settings.backup.backupFrequency}
                  onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                  disabled={!settings.backup.autoBackup}
                >
                  <MenuItem value="hourly">A cada hora</MenuItem>
                  <MenuItem value="daily">Diário</MenuItem>
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensal</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Retenção (dias)</InputLabel>
                <Select
                  value={settings.backup.retentionDays}
                  onChange={(e) => handleSettingChange('backup', 'retentionDays', e.target.value)}
                >
                  <MenuItem value={7}>7 dias</MenuItem>
                  <MenuItem value={30}>30 dias</MenuItem>
                  <MenuItem value={90}>90 dias</MenuItem>
                  <MenuItem value={365}>1 ano</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Backup na Nuvem
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.backup.cloudBackup}
                    onChange={(e) => handleSettingChange('backup', 'cloudBackup', e.target.checked)}
                  />
                }
                label="Backup na nuvem"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.backup.encryption}
                    onChange={(e) => handleSettingChange('backup', 'encryption', e.target.checked)}
                  />
                }
                label="Criptografar backup"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Restore sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ações de Backup
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Backup />}
                  onClick={() => setBackupDialog(true)}
                  disabled={loading}
                >
                  Fazer Backup Agora
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Restore />}
                  onClick={() => setRestoreDialog(true)}
                  disabled={loading}
                >
                  Restaurar Backup
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Refresh />}
                  onClick={() => setResetDialog(true)}
                  disabled={loading}
                >
                  Resetar Configurações
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderNetworkSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Router sx={{ mr: 1, verticalAlign: 'middle' }} />
                Proxy
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.network.proxyEnabled}
                    onChange={(e) => handleSettingChange('network', 'proxyEnabled', e.target.checked)}
                  />
                }
                label="Usar proxy"
              />
              <TextField
                fullWidth
                margin="normal"
                label="URL do Proxy"
                value={settings.network.proxyUrl}
                onChange={(e) => handleSettingChange('network', 'proxyUrl', e.target.value)}
                disabled={!settings.network.proxyEnabled}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Porta do Proxy"
                type="number"
                value={settings.network.proxyPort}
                onChange={(e) => handleSettingChange('network', 'proxyPort', parseInt(e.target.value))}
                disabled={!settings.network.proxyEnabled}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Segurança de Rede
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.network.sslEnabled}
                    onChange={(e) => handleSettingChange('network', 'sslEnabled', e.target.checked)}
                  />
                }
                label="SSL/TLS habilitado"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Rate Limit (req/min)</InputLabel>
                <Select
                  value={settings.network.rateLimit}
                  onChange={(e) => handleSettingChange('network', 'rateLimit', e.target.value)}
                >
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                  <MenuItem value={1000}>1000</MenuItem>
                  <MenuItem value={5000}>5000</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderApiSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configurações da API
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.api.apiEnabled}
                    onChange={(e) => handleSettingChange('api', 'apiEnabled', e.target.checked)}
                  />
                }
                label="API habilitada"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Chave da API</InputLabel>
                <OutlinedInput
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.api.apiKey}
                  onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowApiKey(!showApiKey)}
                        edge="end"
                      >
                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                onClick={generateApiKey}
                sx={{ mt: 1 }}
              >
                Gerar Nova Chave
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Webhook sx={{ mr: 1, verticalAlign: 'middle' }} />
                Webhooks
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                label="URL do Webhook"
                value={settings.api.webhookUrl}
                onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
                placeholder="https://api.example.com/webhook"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.api.corsEnabled}
                    onChange={(e) => handleSettingChange('api', 'corsEnabled', e.target.checked)}
                  />
                }
                label="CORS habilitado"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                Origens CORS Permitidas
              </Typography>
              <Box sx={{ mt: 2 }}>
                {settings.api.corsOrigins.map((origin, index) => (
                  <Chip
                    key={index}
                    label={origin}
                    onDelete={() => {
                      const newList = settings.api.corsOrigins.filter((_, i) => i !== index);
                      handleSettingChange('api', 'corsOrigins', newList);
                    }}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => {
                    const newOrigin = prompt('Digite a origem CORS (ex: https://app.example.com):');
                    if (newOrigin) {
                      const newList = [...settings.api.corsOrigins, newOrigin];
                      handleSettingChange('api', 'corsOrigins', newList);
                    }
                  }}
                >
                  Adicionar Origem
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderSecuritySettings();
      case 2:
        return renderPerformanceSettings();
      case 3:
        return renderBackupSettings();
      case 4:
        return renderNetworkSettings();
      case 5:
        return renderApiSettings();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Settings sx={{ mr: 2, color: 'primary.main' }} />
          Configurações do Sistema
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Gerencie todas as configurações do sistema, incluindo segurança, performance, backup e API.
        </Typography>
      </motion.div>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Carregando configurações...
          </Typography>
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                minHeight: 64,
                '&.Mui-selected': {
                  color: `${tab.color}.main`
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {renderTabContent()}
      </Box>

      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Ações
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Salve as alterações ou restaure as configurações padrão
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadSettings}
            disabled={loading}
          >
            Recarregar
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={saveSettings}
            disabled={saving || loading}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </Box>
      </Paper>

      {/* Dialogs */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
        <DialogTitle>Fazer Backup</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja fazer um backup manual das configurações atuais?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancelar</Button>
          <Button onClick={handleBackup} variant="contained">
            Fazer Backup
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
        <DialogTitle>Restaurar Backup</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja restaurar as configurações de um backup anterior?
            Esta ação irá sobrescrever as configurações atuais.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancelar</Button>
          <Button onClick={handleRestore} variant="contained" color="warning">
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Resetar Configurações</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja resetar todas as configurações para os valores padrão?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancelar</Button>
          <Button onClick={handleReset} variant="contained" color="error">
            Resetar
          </Button>
        </DialogActions>
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

export default SystemSettings;

