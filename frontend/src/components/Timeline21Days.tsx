import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  ExpandMore,
  Message,
  Call,
  VideoCall,
  Group,
  PhotoCamera,
  Mic,
  Person,
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Schedule,
  CalendarToday,
  AccessTime,
  TrendingUp,
  TrendingDown,
  Speed,
  Notifications,
  Settings,
  Analytics,
  WhatsApp,
  Phone,
  Send,
  EmojiEmotions,
  AttachFile,
  LocationOn,
  Language,
  Storage,
  Memory,
  NetworkCheck,
  Battery90,
  SignalCellular4Bar,
  Wifi,
  Bluetooth,
  DataUsage
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DaySchedule {
  day: number;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  tasks: Task[];
  progress: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  estimatedTime: string;
  description: string;
}

interface Task {
  id: string;
  type: 'message' | 'call' | 'video_call' | 'group' | 'status' | 'media' | 'profile' | 'security' | 'conversation' | 'contact';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  time: string;
  description: string;
  progress: number;
  result?: any;
  error?: string;
  priority: 'low' | 'medium' | 'high';
}

const Timeline21Days: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Gerar cronograma de 21 dias
  const generate21DaySchedule = (): DaySchedule[] => {
    const schedule: DaySchedule[] = [];
    
    const dayDescriptions = [
      "Configuração inicial e primeiras interações",
      "Primeiras interações e entrada em grupos",
      "Conversas e grupos - início do aquecimento",
      "Aumento gradual de atividades",
      "Intensificação das interações",
      "Mais conversas e chamadas",
      "Semana 1 completa - rotina estabelecida",
      "Início da semana 2 - mais intenso",
      "Chamadas de vídeo e grupos",
      "Status e mídia - variedade de atividades",
      "Meio do processo - rotina consolidada",
      "Aumento de contatos e interações",
      "Chamadas mais longas e grupos ativos",
      "Status frequentes e mídia diversa",
      "Semana 2 completa - aquecimento avançado",
      "Início da semana 3 - máxima atividade",
      "Pico de interações e chamadas",
      "Grupos ativos e conversas intensas",
      "Status diários e mídia constante",
      "Penúltimo dia - preparação final",
      "Último dia - conclusão do aquecimento"
    ];

    for (let day = 1; day <= 21; day++) {
      const dayTasks = generateDayTasks(day);
      const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
      const failedTasks = dayTasks.filter(t => t.status === 'failed').length;
      const progress = day < 8 ? (day / 7) * 100 : day < 15 ? 50 + ((day - 7) / 7) * 30 : 80 + ((day - 14) / 7) * 20;
      
      schedule.push({
        day,
        status: day < 8 ? 'completed' : day === 8 ? 'in_progress' : 'pending',
        tasks: dayTasks,
        progress: Math.min(progress, 100),
        totalTasks: dayTasks.length,
        completedTasks,
        failedTasks,
        estimatedTime: `${Math.floor(Math.random() * 3) + 2}h ${Math.floor(Math.random() * 30) + 15}min`,
        description: dayDescriptions[day - 1] || `Dia ${day} do aquecimento`
      });
    }
    
    return schedule;
  };

  const generateDayTasks = (day: number): Task[] => {
    const tasks: Task[] = [];
    const taskTypes = ['message', 'call', 'video_call', 'group', 'status', 'media', 'profile', 'security', 'conversation', 'contact'];
    
    // Número de tarefas aumenta gradualmente
    const baseTasks = 5;
    const additionalTasks = Math.floor((day - 1) / 3) * 2;
    const totalTasks = baseTasks + additionalTasks;
    
    for (let i = 0; i < totalTasks; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      tasks.push({
        id: `${day}-${i}`,
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)] as any,
        status: day < 8 ? 'completed' : day === 8 ? (i < 3 ? 'completed' : 'running') : 'pending',
        time,
        description: generateTaskDescription(day, i),
        progress: day < 8 ? 100 : day === 8 ? (i < 3 ? 100 : Math.floor(Math.random() * 100)) : 0,
        priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
      });
    }
    
    return tasks.sort((a, b) => a.time.localeCompare(b.time));
  };

  const generateTaskDescription = (day: number, taskIndex: number): string => {
    const descriptions = [
      `Enviar mensagem para contato ${taskIndex + 1}`,
      `Fazer chamada de áudio para ${taskIndex + 1}`,
      `Chamada de vídeo com ${taskIndex + 1}`,
      `Entrar no grupo ${taskIndex + 1}`,
      `Postar status do dia ${day}`,
      `Enviar mídia para ${taskIndex + 1}`,
      `Atualizar foto do perfil`,
      `Configurar verificação em duas etapas`,
      `Conversar com ${taskIndex + 1}`,
      `Adicionar contato ${taskIndex + 1}`,
      `Encaminhar mensagem para ${taskIndex + 1}`,
      `Enviar emoji para ${taskIndex + 1}`,
      `Compartilhar localização`,
      `Enviar documento para ${taskIndex + 1}`,
      `Criar grupo com ${taskIndex + 1} pessoas`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'message': return <Message />;
      case 'call': return <Call />;
      case 'video_call': return <VideoCall />;
      case 'group': return <Group />;
      case 'status': return <PhotoCamera />;
      case 'media': return <Mic />;
      case 'profile': return <Person />;
      case 'security': return <Settings />;
      case 'conversation': return <WhatsApp />;
      case 'contact': return <Phone />;
      default: return <Message />;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'message': return '#4caf50';
      case 'call': return '#2196f3';
      case 'video_call': return '#9c27b0';
      case 'group': return '#ff9800';
      case 'status': return '#e91e63';
      case 'media': return '#607d8b';
      case 'profile': return '#795548';
      case 'security': return '#f44336';
      case 'conversation': return '#00bcd4';
      case 'contact': return '#8bc34a';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in_progress': return <TrendingUp />;
      case 'pending': return <Schedule />;
      case 'failed': return <Error />;
      default: return <Warning />;
    }
  };

  const schedule = generate21DaySchedule();

  const handleDayClick = (day: DaySchedule) => {
    setSelectedDay(day);
    setDialogOpen(true);
  };

  const handleExpandDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Cronograma de 21 Dias
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Timeline completo do processo de aquecimento de chips WhatsApp
        </Typography>
      </Box>

      {/* Timeline */}
      <Timeline position="alternate">
        {schedule.map((day, index) => (
          <TimelineItem key={day.day}>
            <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Dia {day.day}
              </Typography>
              <Typography variant="body2">
                {day.time}
              </Typography>
              <Typography variant="caption">
                {day.estimatedTime}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot 
                color={getStatusColor(day.status) as any}
                sx={{ 
                  bgcolor: getStatusColor(day.status) === 'success' ? '#4caf50' : 
                          getStatusColor(day.status) === 'warning' ? '#ff9800' : 
                          getStatusColor(day.status) === 'error' ? '#f44336' : '#757575'
                }}
              >
                {getStatusIcon(day.status)}
              </TimelineDot>
              {index < schedule.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedDay?.day === day.day ? 2 : 1,
                    borderColor: selectedDay?.day === day.day ? 'primary.main' : 'divider'
                  }}
                  onClick={() => handleDayClick(day)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {day.description}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(day.status)}
                        label={day.status.replace('_', ' ')}
                        color={getStatusColor(day.status) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2">Progresso</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {day.progress.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={day.progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {day.completedTasks}/{day.totalTasks} tarefas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.failedTasks} falhas
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {day.estimatedTime}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandDay(day.day);
                        }}
                      >
                        <ExpandMore 
                          sx={{ 
                            transform: expandedDay === day.day ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }} 
                        />
                      </IconButton>
                    </Box>

                    {/* Expanded Tasks */}
                    {expandedDay === day.day && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Tarefas do Dia {day.day}
                        </Typography>
                        <List dense>
                          {day.tasks.slice(0, 5).map((task) => (
                            <ListItem key={task.id} sx={{ py: 0.5 }}>
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: getTaskColor(task.type),
                                    width: 24,
                                    height: 24
                                  }}
                                >
                                  {getTaskIcon(task.type)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={task.description}
                                secondary={`${task.time} - ${task.status}`}
                                primaryTypographyProps={{ variant: 'body2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                              <Chip
                                label={task.priority}
                                size="small"
                                color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                                variant="outlined"
                              />
                            </ListItem>
                          ))}
                          {day.tasks.length > 5 && (
                            <ListItem>
                              <ListItemText
                                primary={`+${day.tasks.length - 5} mais tarefas`}
                                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Day Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDay && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Dia {selectedDay.day} - {selectedDay.description}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedDay.estimatedTime} • {selectedDay.totalTasks} tarefas
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedDay.status)}
                  label={selectedDay.status.replace('_', ' ')}
                  color={getStatusColor(selectedDay.status) as any}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Progresso Geral
                </Typography>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Progresso do Dia</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {selectedDay.progress.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedDay.progress} 
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Estatísticas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {selectedDay.completedTasks}
                        </Typography>
                        <Typography variant="body2">Completadas</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {selectedDay.failedTasks}
                        </Typography>
                        <Typography variant="body2">Falhadas</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {selectedDay.totalTasks - selectedDay.completedTasks - selectedDay.failedTasks}
                        </Typography>
                        <Typography variant="body2">Pendentes</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Todas as Tarefas
                </Typography>
                <List>
                  {selectedDay.tasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getTaskColor(task.type) }}>
                          {getTaskIcon(task.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.description}
                        secondary={`${task.time} • ${task.status} • Prioridade: ${task.priority}`}
                      />
                      <Box display="flex" alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={task.progress} 
                          sx={{ width: 80, mr: 2 }}
                        />
                        <Typography variant="body2">
                          {task.progress}%
                        </Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // Aqui você pode adicionar lógica para controlar as tarefas
                  console.log('Controlando tarefas do dia', selectedDay.day);
                }}
              >
                Controlar Tarefas
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Timeline21Days; 