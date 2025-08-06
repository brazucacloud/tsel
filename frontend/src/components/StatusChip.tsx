import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  CheckCircle,
  Error,
  Pending,
  PlayArrow,
  Stop,
  Warning,
  Schedule,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { TaskStatus } from '../types';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'icon'> {
  status: TaskStatus | 'online' | 'offline' | 'busy' | 'error';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'small',
  showIcon = true,
  ...chipProps
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Concluído',
          color: 'success' as const,
          icon: <CheckCircle fontSize="small" />,
          backgroundColor: '#10B98115',
          textColor: '#10B981',
        };
      case 'running':
        return {
          label: 'Executando',
          color: 'primary' as const,
          icon: <PlayArrow fontSize="small" />,
          backgroundColor: '#1976D215',
          textColor: '#1976D2',
        };
      case 'pending':
        return {
          label: 'Pendente',
          color: 'warning' as const,
          icon: <Schedule fontSize="small" />,
          backgroundColor: '#F59E0B15',
          textColor: '#F59E0B',
        };
      case 'failed':
        return {
          label: 'Falhou',
          color: 'error' as const,
          icon: <Error fontSize="small" />,
          backgroundColor: '#EF444415',
          textColor: '#EF4444',
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'default' as const,
          icon: <Cancel fontSize="small" />,
          backgroundColor: '#64748B15',
          textColor: '#64748B',
        };
      case 'retrying':
        return {
          label: 'Tentando',
          color: 'info' as const,
          icon: <Refresh fontSize="small" />,
          backgroundColor: '#3B82F615',
          textColor: '#3B82F6',
        };
      case 'online':
        return {
          label: 'Online',
          color: 'success' as const,
          icon: <CheckCircle fontSize="small" />,
          backgroundColor: '#10B98115',
          textColor: '#10B981',
        };
      case 'offline':
        return {
          label: 'Offline',
          color: 'default' as const,
          icon: <Stop fontSize="small" />,
          backgroundColor: '#64748B15',
          textColor: '#64748B',
        };
      case 'busy':
        return {
          label: 'Ocupado',
          color: 'warning' as const,
          icon: <Pending fontSize="small" />,
          backgroundColor: '#F59E0B15',
          textColor: '#F59E0B',
        };
      case 'error':
        return {
          label: 'Erro',
          color: 'error' as const,
          icon: <Error fontSize="small" />,
          backgroundColor: '#EF444415',
          textColor: '#EF4444',
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <Warning fontSize="small" />,
          backgroundColor: '#64748B15',
          textColor: '#64748B',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      icon={showIcon ? config.icon : undefined}
      size={size}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? 24 : 32,
        '& .MuiChip-icon': {
          color: config.textColor,
          fontSize: size === 'small' ? '1rem' : '1.25rem',
        },
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        },
        ...chipProps.sx,
      }}
      {...chipProps}
    />
  );
};

export default StatusChip; 