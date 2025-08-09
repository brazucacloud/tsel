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
  RadioGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  OutlinedInput,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemButton,
  Collapse,
  Drawer,
  AppBar,
  Toolbar,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Skeleton,
  AlertTitle,
  Breadcrumbs,
  Link,
  Pagination,
  FormLabel,
  FormHelperText,
  Autocomplete,
  DatePicker,
  TimePicker,
  DateTimePicker,
  LocalizationProvider,
  AdapterDateFns,
  ptBR
} from '@mui/material';
import {
  Assessment,
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
  TrendingUp,
  TrendingDown,
  Speed,
  Security,
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
  Assessment as AssessmentIcon,
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
  AccessTime,
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
  PushPin,
  Star,
  StarBorder,
  MoreVert,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Alarm,
  Language,
  Palette,
  Brightness4,
  Brightness7,
  AutoAwesome,
  Tune,
  FileDownload,
  FileUpload,
  CloudDownload,
  CloudUpload,
  PictureAsPdf,
  TableChart,
  InsertChart,
  Analytics,
  DataObject,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon2,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  Timer as TimerIcon,
  HourglassEmpty as HourglassEmptyIcon,
  HourglassFull as HourglassFullIcon,
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
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  DataUsage as DataUsageIcon,
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
  Notifications as NotificationsIcon,
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
  PushPin as PushPinIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Alarm as AlarmIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  AutoAwesome as AutoAwesomeIcon,
  Tune as TuneIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  InsertChart as InsertChartIcon,
  Analytics as AnalyticsIcon,
  DataObject as DataObjectIcon,
  Code as CodeIcon2,
  BugReport as BugReportIcon2,
  Build as BuildIcon2,
  Engineering as EngineeringIcon2,
  Science as ScienceIcon2,
  Psychology as PsychologyIcon2,
  Assessment as AssessmentIcon3,
  BarChart as BarChartIcon2,
  PieChart as PieChartIcon2,
  Timeline as TimelineIcon2,
  ShowChart as ShowChartIcon2,
  Timer as TimerIcon2,
  HourglassEmpty as HourglassEmptyIcon2,
  HourglassFull as HourglassFullIcon2,
  Event as EventIcon2,
  Today as TodayIcon2,
  DateRange as DateRangeIcon2,
  AccessTime as AccessTimeIcon2,
  Update as UpdateIcon2,
  Sync as SyncIcon2,
  CloudSync as CloudSyncIcon2,
  CloudDone as CloudDoneIcon2,
  CloudOff as CloudOffIcon2,
  WifiOff as WifiOffIcon2,
  SignalCellular0Bar as SignalCellular0BarIcon2,
  SignalCellular1Bar as SignalCellular1BarIcon2,
  SignalCellular2Bar as SignalCellular2BarIcon2,
  SignalCellular3Bar as SignalCellular3BarIcon2,
  Battery20 as Battery20Icon2,
  Battery30 as Battery30Icon2,
  Battery50 as Battery50Icon2,
  Battery60 as Battery60Icon2,
  Battery80 as Battery80Icon2,
  BatteryFull as BatteryFullIcon2,
  BatteryChargingFull as BatteryChargingFullIcon2,
  BatteryCharging20 as BatteryCharging20Icon2,
  BatteryCharging30 as BatteryCharging30Icon2,
  BatteryCharging50 as BatteryCharging50Icon2,
  BatteryCharging60 as BatteryCharging60Icon2,
  BatteryCharging80 as BatteryCharging80Icon2,
  BatteryCharging90 as BatteryCharging90Icon2,
  Storage as StorageIcon2,
  Memory as MemoryIcon2,
  NetworkCheck as NetworkCheckIcon2,
  Wifi as WifiIcon2,
  Bluetooth as BluetoothIcon2,
  DataUsage as DataUsageIcon2,
  FilterList as FilterListIcon2,
  Search as SearchIcon2,
  Add as AddIcon2,
  Edit as EditIcon2,
  Save as SaveIcon2,
  Cancel as CancelIcon2,
  Refresh as RefreshIcon2,
  CheckCircle as CheckCircleIcon2,
  Error as ErrorIcon2,
  Warning as WarningIcon2,
  Info as InfoIcon2,
  PriorityHigh as PriorityHighIcon2,
  Schedule as ScheduleIcon2,
  Notifications as NotificationsIcon2,
  NotificationsActive as NotificationsActiveIcon2,
  NotificationsOff as NotificationsOffIcon2,
  NotificationsNone as NotificationsNoneIcon2,
  NotificationsPaused as NotificationsPausedIcon2,
  VolumeUp as VolumeUpIcon2,
  VolumeOff as VolumeOffIcon2,
  Settings as SettingsIcon2,
  Delete as DeleteIcon2,
  MarkEmailRead as MarkEmailReadIcon2,
  MarkEmailUnread as MarkEmailUnreadIcon2,
  Archive as ArchiveIcon2,
  Unarchive as UnarchiveIcon2,
  PushPin as PushPinIcon2,
  Star as StarIcon2,
  StarBorder as StarBorderIcon2,
  MoreVert as MoreVertIcon2,
  ExpandMore as ExpandMoreIcon2,
  ExpandLess as ExpandLessIcon2,
  KeyboardArrowDown as KeyboardArrowDownIcon2,
  KeyboardArrowUp as KeyboardArrowUpIcon2,
  Alarm as AlarmIcon2,
  Language as LanguageIcon2,
  Palette as PaletteIcon2,
  Brightness4 as Brightness4Icon2,
  Brightness7 as Brightness7Icon2,
  AutoAwesome as AutoAwesomeIcon2,
  Tune as TuneIcon2,
  FileDownload as FileDownloadIcon2,
  FileUpload as FileUploadIcon2,
  CloudDownload as CloudDownloadIcon2,
  CloudUpload as CloudUploadIcon2,
  PictureAsPdf as PictureAsPdfIcon2,
  TableChart as TableChartIcon2,
  InsertChart as InsertChartIcon2,
  Analytics as AnalyticsIcon2,
  DataObject as DataObjectIcon2
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, FunnelChart, Funnel, Treemap, TreemapItem } from 'recharts';

interface AdvancedReportsProps {
  onReportGenerated?: (report: any) => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'performance' | 'security' | 'operations' | 'custom';
  type: 'summary' | 'detailed' | 'comparative' | 'trend' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  lastGenerated?: Date;
  nextGeneration?: Date;
  enabled: boolean;
  parameters: ReportParameter[];
}

interface ReportParameter {
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiselect' | 'number' | 'text' | 'boolean';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: any;
}

interface ReportData {
  id: string;
  templateId: string;
  name: string;
  generatedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  size?: number;
  downloadUrl?: string;
  parameters: any;
  metadata: any;
}

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ onReportGenerated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<any>({});
  const [exportDialog, setExportDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
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
    loadTemplates();
    loadReports();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Relatório de Performance Geral',
          description: 'Visão geral da performance do sistema, incluindo métricas de dispositivos e tarefas',
          category: 'performance',
          type: 'summary',
          format: 'pdf',
          schedule: 'daily',
          enabled: true,
          parameters: [
            {
              name: 'dateRange',
              type: 'dateRange',
              label: 'Período',
              required: true
            },
            {
              name: 'includeDevices',
              type: 'boolean',
              label: 'Incluir dispositivos',
              required: false,
              defaultValue: true
            },
            {
              name: 'includeTasks',
              type: 'boolean',
              label: 'Incluir tarefas',
              required: false,
              defaultValue: true
            }
          ]
        },
        {
          id: '2',
          name: 'Análise de Dispositivos Detalhada',
          description: 'Relatório detalhado sobre o status e performance de todos os dispositivos',
          category: 'analytics',
          type: 'detailed',
          format: 'excel',
          schedule: 'weekly',
          enabled: true,
          parameters: [
            {
              name: 'deviceTypes',
              type: 'multiselect',
              label: 'Tipos de dispositivo',
              required: false,
              options: ['Android', 'iOS', 'Desktop', 'Tablet']
            },
            {
              name: 'statusFilter',
              type: 'select',
              label: 'Status',
              required: false,
              options: ['Todos', 'Online', 'Offline', 'Erro']
            }
          ]
        },
        {
          id: '3',
          name: 'Relatório de Segurança',
          description: 'Análise de eventos de segurança e tentativas de acesso',
          category: 'security',
          type: 'trend',
          format: 'pdf',
          schedule: 'monthly',
          enabled: true,
          parameters: [
            {
              name: 'securityLevel',
              type: 'select',
              label: 'Nível de segurança',
              required: true,
              options: ['Baixo', 'Médio', 'Alto', 'Crítico']
            }
          ]
        },
        {
          id: '4',
          name: 'Exportação de Dados WhatsApp',
          description: 'Exportação completa de dados do WhatsApp para análise',
          category: 'operations',
          type: 'detailed',
          format: 'csv',
          schedule: 'manual',
          enabled: true,
          parameters: [
            {
              name: 'phoneNumbers',
              type: 'multiselect',
              label: 'Números de telefone',
              required: true,
              options: ['+5511999999999', '+5511888888888', '+5511777777777']
            },
            {
              name: 'dataTypes',
              type: 'multiselect',
              label: 'Tipos de dados',
              required: true,
              options: ['Mensagens', 'Contatos', 'Grupos', 'Mídia']
            }
          ]
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar templates',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const mockReports: ReportData[] = [
        {
          id: '1',
          templateId: '1',
          name: 'Relatório de Performance - 2024-01-15',
          generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'completed',
          format: 'pdf',
          size: 2048576,
          downloadUrl: '/reports/performance-2024-01-15.pdf',
          parameters: { dateRange: '2024-01-01 to 2024-01-15' },
          metadata: { generatedBy: 'System', version: '1.0' }
        },
        {
          id: '2',
          templateId: '2',
          name: 'Análise de Dispositivos - 2024-01-10',
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'completed',
          format: 'excel',
          size: 1048576,
          downloadUrl: '/reports/devices-2024-01-10.xlsx',
          parameters: { deviceTypes: ['Android', 'iOS'] },
          metadata: { generatedBy: 'Admin', version: '1.0' }
        },
        {
          id: '3',
          templateId: '3',
          name: 'Relatório de Segurança - Dezembro 2023',
          generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'completed',
          format: 'pdf',
          size: 3145728,
          downloadUrl: '/reports/security-dec-2023.pdf',
          parameters: { securityLevel: 'Alto' },
          metadata: { generatedBy: 'System', version: '1.0' }
        }
      ];

      setReports(mockReports);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar relatórios',
        severity: 'error'
      });
    }
  };

  const generateReport = async (template: ReportTemplate, parameters: any) => {
    setGenerating(true);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newReport: ReportData = {
        id: Date.now().toString(),
        templateId: template.id,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date(),
        status: 'completed',
        format: template.format,
        size: Math.floor(Math.random() * 5000000) + 1000000,
        downloadUrl: `/reports/${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${template.format}`,
        parameters,
        metadata: { generatedBy: 'User', version: '1.0' }
      };

      setReports(prev => [newReport, ...prev]);
      setSnackbar({
        open: true,
        message: 'Relatório gerado com sucesso',
        severity: 'success'
      });

      if (onReportGenerated) {
        onReportGenerated(newReport);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao gerar relatório',
        severity: 'error'
      });
    } finally {
      setGenerating(false);
      setExportDialog(false);
    }
  };

  const downloadReport = (report: ReportData) => {
    // Simular download
    const link = document.createElement('a');
    link.href = report.downloadUrl || '#';
    link.download = report.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true,
      message: 'Download iniciado',
      severity: 'info'
    });
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setSnackbar({
      open: true,
      message: 'Relatório excluído',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PictureAsPdfIcon />;
      case 'excel': return <TableChartIcon />;
      case 'csv': return <InsertChartIcon />;
      case 'json': return <DataObjectIcon />;
      case 'html': return <CodeIcon />;
      default: return <FileDownloadIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <AnalyticsIcon />;
      case 'performance': return <Speed />;
      case 'security': return <Security />;
      case 'operations': return <Settings />;
      case 'custom': return <Build />;
      default: return <AssessmentIcon />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTemplates = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Templates de Relatório
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setTemplateDialog(true)}
        >
          Novo Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getCategoryIcon(template.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={template.type}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={template.format.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={template.schedule}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => {
                        setSelectedTemplate(template);
                        setExportDialog(true);
                      }}
                    >
                      Gerar Relatório
                    </Button>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );

  const renderReports = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Relatórios Gerados
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Histórico de todos os relatórios gerados pelo sistema
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Formato</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tamanho</TableCell>
              <TableCell>Gerado em</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {report.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {templates.find(t => t.id === report.templateId)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getFormatIcon(report.format)}
                    <Typography variant="body2">
                      {report.format.toUpperCase()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={getStatusColor(report.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {report.size ? formatFileSize(report.size) : 'N/A'}
                </TableCell>
                <TableCell>
                  {report.generatedAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => downloadReport(report)}
                      disabled={report.status !== 'completed'}
                    >
                      <FileDownload />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </motion.div>
  );

  const renderAnalytics = () => (
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
                Relatórios por Categoria
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Performance', value: 35 },
                      { name: 'Analytics', value: 25 },
                      { name: 'Security', value: 20 },
                      { name: 'Operations', value: 20 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Performance', value: 35 },
                      { name: 'Analytics', value: 25 },
                      { name: 'Security', value: 20 },
                      { name: 'Operations', value: 20 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Relatórios Gerados por Mês
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { month: 'Jan', reports: 12 },
                    { month: 'Fev', reports: 15 },
                    { month: 'Mar', reports: 8 },
                    { month: 'Abr', reports: 20 },
                    { month: 'Mai', reports: 18 },
                    { month: 'Jun', reports: 25 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="reports" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance de Geração de Relatórios
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { time: '00:00', avgTime: 2.5 },
                    { time: '04:00', avgTime: 1.8 },
                    { time: '08:00', avgTime: 3.2 },
                    { time: '12:00', avgTime: 4.1 },
                    { time: '16:00', avgTime: 3.8 },
                    { time: '20:00', avgTime: 2.9 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="avgTime" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderParameterInput = (parameter: ReportParameter) => {
    switch (parameter.type) {
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={parameter.label}
            required={parameter.required}
            defaultValue={parameter.defaultValue}
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'dateRange':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Data inicial"
              required={parameter.required}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Data final"
              required={parameter.required}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      case 'select':
        return (
          <FormControl fullWidth required={parameter.required}>
            <InputLabel>{parameter.label}</InputLabel>
            <Select
              label={parameter.label}
              defaultValue={parameter.defaultValue}
            >
              {parameter.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'multiselect':
        return (
          <FormControl fullWidth required={parameter.required}>
            <InputLabel>{parameter.label}</InputLabel>
            <Select
              multiple
              label={parameter.label}
              defaultValue={parameter.defaultValue || []}
            >
              {parameter.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={parameter.label}
            required={parameter.required}
            defaultValue={parameter.defaultValue}
          />
        );
      case 'text':
        return (
          <TextField
            fullWidth
            label={parameter.label}
            required={parameter.required}
            defaultValue={parameter.defaultValue}
          />
        );
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={parameter.defaultValue}
              />
            }
            label={parameter.label}
          />
        );
      default:
        return null;
    }
  };

  const tabs = [
    { label: 'Templates', icon: <Assessment /> },
    { label: 'Relatórios', icon: <FileDownload /> },
    { label: 'Analytics', icon: <Analytics /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Assessment sx={{ mr: 2, color: 'primary.main' }} />
          Relatórios Avançados
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Gere relatórios personalizados e exporte dados em diversos formatos
        </Typography>
      </motion.div>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Carregando templates...
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
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {activeTab === 0 && renderTemplates()}
        {activeTab === 1 && renderReports()}
        {activeTab === 2 && renderAnalytics()}
      </Box>

      {/* Dialog para geração de relatório */}
      <Dialog
        open={exportDialog}
        onClose={() => setExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              Gerar Relatório: {selectedTemplate.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedTemplate.description}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Parâmetros do Relatório
                </Typography>
                <Grid container spacing={2}>
                  {selectedTemplate.parameters.map((parameter, index) => (
                    <Grid item xs={12} key={index}>
                      {renderParameterInput(parameter)}
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Configurações de Exportação
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Formato</InputLabel>
                      <Select
                        value={selectedTemplate.format}
                        label="Formato"
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="excel">Excel</MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                        <MenuItem value="html">HTML</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="Incluir gráficos"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExportDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={() => generateReport(selectedTemplate, reportParameters)}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={20} /> : <FileDownload />}
              >
                {generating ? 'Gerando...' : 'Gerar Relatório'}
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

export default AdvancedReports;

