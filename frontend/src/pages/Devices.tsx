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
} from '@mui/material';
import { Add, Refresh, Download } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import DataTable from '../components/DataTable';
import StatusChip from '../components/StatusChip';
import apiService from '../services/api';
import webSocketService from '../services/websocket';
import { Device, TableColumn } from '../types';

const Devices: React.FC = () => {
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const queryClient = useQueryClient();

  const { data: devicesData, isLoading, error, refetch } = useQuery(
    ['devices', page],
    () => apiService.getDevices(page, 20),
    {
      keepPreviousData: true,
    }
  );

  const deleteDeviceMutation = useMutation(
    (deviceId: string) => apiService.deleteDevice(deviceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devices');
        setSnackbar({
          open: true,
          message: 'Dispositivo excluído com sucesso',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Erro ao excluir dispositivo',
          severity: 'error',
        });
      },
    }
  );

  const pingDeviceMutation = useMutation(
    (deviceId: string) => apiService.pingDevice(deviceId),
    {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'Ping enviado com sucesso',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Erro ao enviar ping',
          severity: 'error',
        });
      },
    }
  );

  const columns: TableColumn[] = [
    {
      field: 'name',
      headerName: 'Nome',
      width: 200,
    },
    {
      field: 'deviceId',
      headerName: 'ID do Dispositivo',
      width: 150,
    },
    {
      field: 'model',
      headerName: 'Modelo',
      width: 150,
    },
    {
      field: 'os',
      headerName: 'Sistema Operacional',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value) => <StatusChip status={value} />,
    },
    {
      field: 'whatsappType',
      headerName: 'WhatsApp',
      width: 100,
      renderCell: (value) => (
        <StatusChip
          status={value === 'business' ? 'online' : 'offline'}
          label={value === 'business' ? 'Business' : 'Normal'}
        />
      ),
    },
    {
      field: 'currentDay',
      headerName: 'Dia Atual',
      width: 100,
      type: 'number',
    },
    {
      field: 'batteryLevel',
      headerName: 'Bateria',
      width: 100,
      type: 'number',
      renderCell: (value) => `${value}%`,
    },
    {
      field: 'signalStrength',
      headerName: 'Sinal',
      width: 100,
      type: 'number',
      renderCell: (value) => `${value}%`,
    },
    {
      field: 'lastSeen',
      headerName: 'Última Atividade',
      width: 150,
      type: 'date',
      renderCell: (value) => new Date(value).toLocaleString('pt-BR'),
    },
  ];

  const handleView = (device: Device) => {
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const handleEdit = (device: Device) => {
    // Implementar edição
    console.log('Editar dispositivo:', device);
  };

  const handleDelete = (device: Device) => {
    if (window.confirm(`Deseja realmente excluir o dispositivo "${device.name}"?`)) {
      deleteDeviceMutation.mutate(device.id);
    }
  };

  const handlePing = (device: Device) => {
    pingDeviceMutation.mutate(device.id);
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportAnalytics('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dispositivos.csv';
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

  const actions = [
    {
      label: 'Ping',
      icon: <Refresh fontSize="small" />,
      onClick: handlePing,
      color: 'info' as const,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dispositivos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie e monitore todos os dispositivos conectados
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
            Adicionar Dispositivo
          </Button>
        </Stack>
      </Box>

      {/* Devices Table */}
      <DataTable
        data={devicesData?.data || []}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        title="Lista de Dispositivos"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => refetch()}
        onExport={handleExport}
        actions={actions}
        emptyMessage="Nenhum dispositivo encontrado"
        searchPlaceholder="Pesquisar dispositivos..."
      />

      {/* Device Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedDevice(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDevice ? 'Detalhes do Dispositivo' : 'Adicionar Dispositivo'}
        </DialogTitle>
        <DialogContent>
          {selectedDevice ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDevice.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                ID: {selectedDevice.deviceId}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Modelo
                  </Typography>
                  <Typography variant="body1">{selectedDevice.model}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sistema Operacional
                  </Typography>
                  <Typography variant="body1">{selectedDevice.os}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusChip status={selectedDevice.status} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    WhatsApp
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.whatsappType === 'business' ? 'Business' : 'Normal'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dia Atual
                  </Typography>
                  <Typography variant="body1">{selectedDevice.currentDay}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bateria
                  </Typography>
                  <Typography variant="body1">{selectedDevice.batteryLevel}%</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sinal
                  </Typography>
                  <Typography variant="body1">{selectedDevice.signalStrength}%</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última Atividade
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedDevice.lastSeen).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estatísticas
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {selectedDevice.totalTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Tarefas
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="success.main">
                      {selectedDevice.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Concluídas
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="error.main">
                      {selectedDevice.failedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Falharam
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nome do Dispositivo"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="ID do Dispositivo"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Modelo"
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Sistema Operacional</InputLabel>
                <Select label="Sistema Operacional">
                  <MenuItem value="android">Android</MenuItem>
                  <MenuItem value="ios">iOS</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Tipo de WhatsApp</InputLabel>
                <Select label="Tipo de WhatsApp">
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedDevice(null);
            }}
          >
            Fechar
          </Button>
          {!selectedDevice && (
            <Button variant="contained">
              Adicionar
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

export default Devices; 