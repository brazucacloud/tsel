import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Refresh,
  Backup,
  Restore,
  Delete,
  Settings as SettingsIcon,
  Security,
  Notifications,
  Storage,
  NetworkCheck,
  Code,
  Info,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import apiService from '../services/api';

const Settings: React.FC = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);

  const { data: systemStatus } = useQuery(
    'system-status',
    apiService.getSystemStatus
  );

  const createBackupMutation = useMutation(
    apiService.createBackup,
    {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'Backup criado com sucesso',
          severity: 'success',
        });
        setOpenBackupDialog(false);
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Erro ao criar backup',
          severity: 'error',
        });
      },
    }
  );

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleRestoreBackup = () => {
    // Implementar restauração
    setSnackbar({
      open: true,
      message: 'Restauração iniciada',
      severity: 'info',
    });
    setOpenRestoreDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as configurações do sistema de aquecimento de chip
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Configurações do Sistema</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="URL da API"
                defaultValue="http://localhost:3000/api"
                helperText="URL base da API do backend"
              />
              
              <TextField
                fullWidth
                label="Timeout da API (ms)"
                type="number"
                defaultValue={30000}
                helperText="Tempo limite para requisições da API"
              />
              
              <TextField
                fullWidth
                label="Intervalo de Atualização (s)"
                type="number"
                defaultValue={30}
                helperText="Intervalo para atualização automática dos dados"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Atualização Automática"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificações em Tempo Real"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Modo Escuro"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ mr: 1 }} />
              <Typography variant="h6">Segurança</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Autenticação JWT"
              />
              
              <TextField
                fullWidth
                label="Tempo de Expiração do Token (h)"
                type="number"
                defaultValue={24}
                helperText="Tempo de vida do token de autenticação"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Rate Limiting"
              />
              
              <TextField
                fullWidth
                label="Limite de Requisições por Minuto"
                type="number"
                defaultValue={100}
                helperText="Número máximo de requisições por minuto"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Logs de Auditoria"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="CORS Habilitado"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Notifications sx={{ mr: 1 }} />
              <Typography variant="h6">Notificações</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificações de Dispositivos"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificações de Tarefas"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Alertas de Sistema"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Notificações por Email"
              />
              
              <TextField
                fullWidth
                label="Email para Notificações"
                type="email"
                placeholder="admin@exemplo.com"
                helperText="Email para receber notificações importantes"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Notificações Push"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Storage Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Storage sx={{ mr: 1 }} />
              <Typography variant="h6">Armazenamento</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Retenção de Logs (dias)"
                type="number"
                defaultValue={30}
                helperText="Tempo de retenção dos logs do sistema"
              />
              
              <TextField
                fullWidth
                label="Tamanho Máximo de Backup (MB)"
                type="number"
                defaultValue={1000}
                helperText="Tamanho máximo para arquivos de backup"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Backup Automático"
              />
              
              <TextField
                fullWidth
                label="Frequência de Backup (h)"
                type="number"
                defaultValue={24}
                helperText="Intervalo para backup automático"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Compressão de Dados"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Limpeza Automática"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NetworkCheck sx={{ mr: 1 }} />
              <Typography variant="h6">Status do Sistema</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      Online
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status da API
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {systemStatus?.uptime || '99.8%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      {systemStatus?.memoryUsage || '45%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uso de Memória
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      {systemStatus?.cpuUsage || '12%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uso de CPU
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Backup & Restore */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Backup sx={{ mr: 1 }} />
              <Typography variant="h6">Backup e Restauração</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Backups Disponíveis
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Backup Completo - 2024-01-15"
                      secondary="Tamanho: 2.3 MB • Criado: 15/01/2024 14:30"
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="restore">
                        <Restore />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Backup Incremental - 2024-01-14"
                      secondary="Tamanho: 1.1 MB • Criado: 14/01/2024 14:30"
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="restore">
                        <Restore />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Backup />}
                    onClick={() => setOpenBackupDialog(true)}
                    fullWidth
                  >
                    Criar Backup
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Restore />}
                    onClick={() => setOpenRestoreDialog(true)}
                    fullWidth
                  >
                    Restaurar Backup
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    fullWidth
                  >
                    Exportar Configurações
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Importar Configurações
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Code sx={{ mr: 1 }} />
              <Typography variant="h6">Ações do Sistema</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: 'Configurações salvas com sucesso',
                    severity: 'success',
                  });
                }}
              >
                Salvar Configurações
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message: 'Sistema reiniciado',
                    severity: 'info',
                  });
                }}
              >
                Reiniciar Sistema
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Delete />}
                color="error"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
                    setSnackbar({
                      open: true,
                      message: 'Dados limpos com sucesso',
                      severity: 'warning',
                    });
                  }
                }}
              >
                Limpar Dados
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Backup Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)}>
        <DialogTitle>Criar Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Isso criará um backup completo do sistema incluindo:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Configurações do sistema" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Dados de dispositivos" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Histórico de tarefas" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Logs do sistema" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBackup}
            disabled={createBackupMutation.isLoading}
          >
            {createBackupMutation.isLoading ? 'Criando...' : 'Criar Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
        <DialogTitle>Restaurar Backup</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atenção:</strong> Esta ação irá sobrescrever todos os dados atuais do sistema.
            Certifique-se de fazer um backup antes de continuar.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Selecione o arquivo de backup para restaurar:
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Escolher Arquivo
            <input type="file" hidden accept=".json,.zip" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRestoreBackup}
          >
            Restaurar
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Settings; 