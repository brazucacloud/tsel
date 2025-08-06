import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Info,
} from '@mui/icons-material';
import { DashboardCard as DashboardCardType } from '../types';

interface DashboardCardProps {
  card: DashboardCardType;
  onClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  card,
  onClick,
  showMenu = false,
  onMenuClick,
}) => {
  const getIconColor = () => {
    switch (card.color) {
      case 'primary':
        return '#1976d2';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'info':
        return '#3B82F6';
      case 'neutral':
        return '#64748B';
      default:
        return card.color;
    }
  };

  const getChangeColor = () => {
    if (!card.change) return 'text.secondary';
    return card.changeType === 'increase' ? 'success.main' : 'error.main';
  };

  const getChangeIcon = () => {
    if (!card.change) return null;
    return card.changeType === 'increase' ? (
      <TrendingUp fontSize="small" />
    ) : (
      <TrendingDown fontSize="small" />
    );
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-2px)' : 'none',
          boxShadow: onClick ? '0 8px 25px rgba(0, 0, 0, 0.15)' : undefined,
        },
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${getIconColor()}15`,
                color: getIconColor(),
              }}
            >
              <Box
                component="span"
                className="material-icons"
                sx={{
                  fontSize: 24,
                  fontWeight: 400,
                }}
              >
                {card.icon}
              </Box>
            </Box>
            {showMenu && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick?.(e);
                }}
                sx={{ ml: 'auto' }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '2rem',
              lineHeight: 1.2,
              mb: 1,
              color: 'text.primary',
            }}
          >
            {formatValue(card.value)}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: card.change ? 1 : 0,
              fontWeight: 500,
            }}
          >
            {card.title}
          </Typography>

          {/* Change indicator */}
          {card.change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Chip
                icon={getChangeIcon()}
                label={formatChange(card.change)}
                size="small"
                sx={{
                  backgroundColor: `${getChangeColor()}15`,
                  color: getChangeColor(),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: getChangeColor(),
                    fontSize: '1rem',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Link indicator */}
        {card.link && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              opacity: 0.6,
            }}
          >
            <Tooltip title="Clique para ver mais detalhes">
              <Info fontSize="small" color="action" />
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard; 