import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import { Add, Refresh, Download, PlayArrow, Stop, Pause } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import DataTable from '../components/DataTable';
import StatusChip from '../components/StatusChip';
import apiService from '../services/api';
import { Task, TableColumn, TaskType, TaskStatus } from '../types';

const Tasks: React.FC = () => {
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const queryClient = useQueryClient();

  const { data: tasksData, isLoading, error, refetch } = useQuery(
    ['tasks', page],
    () => apiService.getTasks(page, 20),
    {
      keepPreviousData: true,
    }
  );

  const deleteTaskMutation = useMutation(
    (taskId: string) => apiService.deleteTask(taskId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        setSnackbar({
          open: true,
          message: 'Tarefa excluída com sucesso',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir tarefa',
          severity: 'error',
        });
      },
    }
  );

  const updateTaskMutation = useMutation(
    ({ taskId, data }: { taskId: string; data: any }) => apiService.updateTask(taskId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        setSnackbar({
          open: true,
          message: 'Tarefa atualizada com sucesso',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar tarefa',
          severity: 'error',
        });
      },
    }
  );

  const getTaskTypeLabel = (type: TaskType) => {
    const typeMap: Record<TaskType, string> = {
      whatsapp_message: 'Mensagem WhatsApp',
      whatsapp_call: 'Chamada WhatsApp',
      whatsapp_group: 'Grupo WhatsApp',
      whatsapp_status: 'Status WhatsApp',
      whatsapp_profile: 'Perfil WhatsApp',
      whatsapp_contact: 'Contato WhatsApp',
      whatsapp_security: 'Segurança WhatsApp',
      whatsapp_media: 'Mídia WhatsApp',
      whatsapp_audio: 'Áudio WhatsApp',
      whatsapp_video: 'Vídeo WhatsApp',
      whatsapp_document: 'Documento WhatsApp',
      whatsapp_sticker: 'Figurinha WhatsApp',
      whatsapp_emoji: 'Emoji WhatsApp',
      whatsapp_link: 'Link WhatsApp',
      whatsapp_forward: 'Encaminhar WhatsApp',
      whatsapp_reaction: 'Reação WhatsApp',
      whatsapp_archive: 'Arquivar WhatsApp',
      whatsapp_mute: 'Silenciar WhatsApp',
      whatsapp_block: 'Bloquear WhatsApp',
      whatsapp_delete: 'Excluir WhatsApp',
      whatsapp_favorite: 'Favoritar WhatsApp',
      whatsapp_pin: 'Fixar WhatsApp',
      whatsapp_clear: 'Limpar WhatsApp',
      whatsapp_share: 'Compartilhar WhatsApp',
      whatsapp_vcard: 'VCard WhatsApp',
      whatsapp_gif: 'GIF WhatsApp',
      whatsapp_pdf: 'PDF WhatsApp',
      whatsapp_image: 'Imagem WhatsApp',
      whatsapp_temporary: 'Temporário WhatsApp',
      whatsapp_ring: 'Toque WhatsApp',
      whatsapp_unread: 'Não Lida WhatsApp',
      whatsapp_group_create: 'Criar Grupo WhatsApp',
      whatsapp_group_join: 'Entrar Grupo WhatsApp',
      whatsapp_group_leave: 'Sair Grupo WhatsApp',
      whatsapp_group_silence: 'Silenciar Grupo WhatsApp',
      whatsapp_profile_photo: 'Foto Perfil WhatsApp',
      whatsapp_status_message: 'Mensagem Status WhatsApp',
      whatsapp_contact_add: 'Adicionar Contato WhatsApp',
      whatsapp_contact_delete: 'Excluir Contato WhatsApp',
      whatsapp_contact_share: 'Compartilhar Contato WhatsApp',
      whatsapp_contact_fix: 'Fixar Contato WhatsApp',
      whatsapp_contact_save: 'Salvar Contato WhatsApp',
      whatsapp_contact_block: 'Bloquear Contato WhatsApp',
      whatsapp_contact_unblock: 'Desbloquear Contato WhatsApp',
      whatsapp_contact_search: 'Buscar Contato WhatsApp',
      whatsapp_contact_import: 'Importar Contato WhatsApp',
      whatsapp_contact_export: 'Exportar Contato WhatsApp',
      whatsapp_contact_backup: 'Backup Contato WhatsApp',
      whatsapp_contact_restore: 'Restaurar Contato WhatsApp',
      whatsapp_contact_sync: 'Sincronizar Contato WhatsApp',
      whatsapp_contact_merge: 'Mesclar Contato WhatsApp',
      whatsapp_contact_split: 'Dividir Contato WhatsApp',
      whatsapp_contact_validate: 'Validar Contato WhatsApp',
      whatsapp_contact_clean: 'Limpar Contato WhatsApp',
      whatsapp_contact_organize: 'Organizar Contato WhatsApp',
      whatsapp_contact_tag: 'Tag Contato WhatsApp',
      whatsapp_contact_note: 'Nota Contato WhatsApp',
      whatsapp_contact_favorite: 'Favoritar Contato WhatsApp',
      whatsapp_contact_pin: 'Fixar Contato WhatsApp',
      whatsapp_contact_archive: 'Arquivar Contato WhatsApp',
      whatsapp_contact_delete_all: 'Excluir Todos Contatos WhatsApp',
      whatsapp_contact_restore_all: 'Restaurar Todos Contatos WhatsApp',
      whatsapp_contact_backup_all: 'Backup Todos Contatos WhatsApp',
      whatsapp_contact_sync_all: 'Sincronizar Todos Contatos WhatsApp',
      whatsapp_contact_merge_all: 'Mesclar Todos Contatos WhatsApp',
      whatsapp_contact_split_all: 'Dividir Todos Contatos WhatsApp',
      whatsapp_contact_validate_all: 'Validar Todos Contatos WhatsApp',
      whatsapp_contact_clean_all: 'Limpar Todos Contatos WhatsApp',
      whatsapp_contact_organize_all: 'Organizar Todos Contatos WhatsApp',
      whatsapp_contact_tag_all: 'Tag Todos Contatos WhatsApp',
      whatsapp_contact_note_all: 'Nota Todos Contatos WhatsApp',
      whatsapp_contact_favorite_all: 'Favoritar Todos Contatos WhatsApp',
      whatsapp_contact_pin_all: 'Fixar Todos Contatos WhatsApp',
      whatsapp_contact_archive_all: 'Arquivar Todos Contatos WhatsApp',
      whatsapp_contact_delete_selected: 'Excluir Contatos Selecionados WhatsApp',
      whatsapp_contact_restore_selected: 'Restaurar Contatos Selecionados WhatsApp',
      whatsapp_contact_backup_selected: 'Backup Contatos Selecionados WhatsApp',
      whatsapp_contact_sync_selected: 'Sincronizar Contatos Selecionados WhatsApp',
      whatsapp_contact_merge_selected: 'Mesclar Contatos Selecionados WhatsApp',
      whatsapp_contact_split_selected: 'Dividir Contatos Selecionados WhatsApp',
      whatsapp_contact_validate_selected: 'Validar Contatos Selecionados WhatsApp',
      whatsapp_contact_clean_selected: 'Limpar Contatos Selecionados WhatsApp',
      whatsapp_contact_organize_selected: 'Organizar Contatos Selecionados WhatsApp',
      whatsapp_contact_tag_selected: 'Tag Contatos Selecionados WhatsApp',
      whatsapp_contact_note_selected: 'Nota Contatos Selecionados WhatsApp',
      whatsapp_contact_favorite_selected: 'Favoritar Contatos Selecionados WhatsApp',
      whatsapp_contact_pin_selected: 'Fixar Contatos Selecionados WhatsApp',
      whatsapp_contact_archive_selected: 'Arquivar Contatos Selecionados WhatsApp',
    };
    return typeMap[type] || type;
  };

  const columns: TableColumn[] = [
    {
      field: 'title',
      headerName: 'Título',
      width: 200,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150,
      renderCell: (value) => getTaskTypeLabel(value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value) => <StatusChip status={value} />,
    },
    {
      field: 'priority',
      headerName: 'Prioridade',
      width: 100,
      renderCell: (value) => (
        <Chip
          label={value}
          size="small"
          color={
            value === 'critical' ? 'error' :
            value === 'high' ? 'warning' :
            value === 'medium' ? 'info' : 'default'
          }
        />
      ),
    },
    {
      field: 'deviceId',
      headerName: 'Dispositivo',
      width: 150,
    },
    {
      field: 'scheduledFor',
      headerName: 'Agendada Para',
      width: 150,
      type: 'date',
      renderCell: (value) => new Date(value).toLocaleString('pt-BR'),
    },
    {
      field: 'createdAt',
      headerName: 'Criada Em',
      width: 150,
      type: 'date',
      renderCell: (value) => new Date(value).toLocaleString('pt-BR'),
    },
    {
      field: 'retryCount',
      headerName: 'Tentativas',
      width: 100,
      type: 'number',
    },
  ];

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleEdit = (task: Task) => {
    // Implementar edição
    console.log('Editar tarefa:', task);
  };

  const handleDelete = (task: Task) => {
    if (window.confirm(`Deseja realmente excluir a tarefa "${task.title}"?`)) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleStart = (task: Task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'running' as TaskStatus }
    });
  };

  const handleStop = (task: Task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'cancelled' as TaskStatus }
    });
  };

  const handlePause = (task: Task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: 'pending' as TaskStatus }
    });
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportAnalytics('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tarefas.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao exportar dados',
        severity: 'error',
      });
    }
  };

  const getTaskActions = (task: Task) => {
    const actions = [];

    if (task.status === 'pending') {
      actions.push({
        label: 'Iniciar',
        icon: <PlayArrow fontSize="small" />,
        onClick: () => handleStart(task),
        color: 'success' as const,
      });
    }

    if (task.status === 'running') {
      actions.push(
        {
          label: 'Pausar',
          icon: <Pause fontSize="small" />,
          onClick: () => handlePause(task),
          color: 'warning' as const,
        },
        {
          label: 'Parar',
          icon: <Stop fontSize="small" />,
          onClick: () => handleStop(task),
          color: 'error' as const,
        }
      );
    }

    return actions;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Tarefas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie e monitore todas as tarefas do sistema
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Refresh />}
            onClick={() => refetch()}
            variant="outlined"
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button
            startIcon={<Download />}
            onClick={handleExport}
            variant="outlined"
          >
            Exportar
          </Button>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Nova Tarefa
          </Button>
        </Stack>
      </Box>

      {/* Tasks Table */}
      <DataTable
        data={tasksData?.data || []}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        title="Lista de Tarefas"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        onExport={handleExport}
        actions={getTaskActions}
        emptyMessage="Nenhuma tarefa encontrada"
        searchPlaceholder="Pesquisar tarefas..."
      />

      {/* Task Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTask(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Detalhes da Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <DialogContent>
          {selectedTask ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTask.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedTask.description}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body1">{getTaskTypeLabel(selectedTask.type)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusChip status={selectedTask.status} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prioridade
                  </Typography>
                  <Chip
                    label={selectedTask.priority}
                    size="small"
                    color={
                      selectedTask.priority === 'critical' ? 'error' :
                      selectedTask.priority === 'high' ? 'warning' :
                      selectedTask.priority === 'medium' ? 'info' : 'default'
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dispositivo
                  </Typography>
                  <Typography variant="body1">{selectedTask.deviceId}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Agendada Para
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.scheduledFor).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tentativas
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.retryCount}/{selectedTask.maxRetries}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Criada Em
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Atualizada Em
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.updatedAt).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              </Box>

              {selectedTask.result && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Resultado
                  </Typography>
                  <Typography variant="body2" sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
                    {JSON.stringify(selectedTask.result, null, 2)}
                  </Typography>
                </Box>
              )}

              {selectedTask.error && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Erro
                  </Typography>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {selectedTask.error}
                  </Alert>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Título da Tarefa"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Descrição"
                margin="normal"
                multiline
                rows={3}
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Tipo de Tarefa</InputLabel>
                <Select label="Tipo de Tarefa">
                  <MenuItem value="whatsapp_message">Mensagem WhatsApp</MenuItem>
                  <MenuItem value="whatsapp_call">Chamada WhatsApp</MenuItem>
                  <MenuItem value="whatsapp_group">Grupo WhatsApp</MenuItem>
                  <MenuItem value="whatsapp_status">Status WhatsApp</MenuItem>
                  <MenuItem value="whatsapp_profile">Perfil WhatsApp</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Prioridade</InputLabel>
                <Select label="Prioridade">
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="ID do Dispositivo"
                margin="normal"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedTask(null);
            }}
          >
            Fechar
          </Button>
          {!selectedTask && (
            <Button variant="contained">
              Criar Tarefa
            </Button>
          )}
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

export default Tasks; 