import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Button,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  MoreVert,
  Refresh,
  Download,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { TableColumn } from '../types';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string;
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (row: T) => void;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }[];
  emptyMessage?: string;
  searchPlaceholder?: string;
}

function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  error,
  title,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onExport,
  actions = [],
  emptyMessage = 'Nenhum dado encontrado',
  searchPlaceholder = 'Pesquisar...',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((column) => {
          const value = row[column.field as keyof T];
          if (value === null || value === undefined) return false;
          return String(value)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([field, filterValue]) => {
      if (filterValue !== '' && filterValue !== null && filterValue !== undefined) {
        result = result.filter((row) => {
          const value = row[field as keyof T];
          if (typeof filterValue === 'string') {
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          }
          return value === filterValue;
        });
      }
    });

    // Apply sorting
    if (sortField && sortable) {
      result.sort((a, b) => {
        const aValue = a[sortField as keyof T];
        const bValue = b[sortField as keyof T];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, activeFilters, sortField, sortDirection, columns, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredAndSortedData;
    const startIndex = page * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage, pagination]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setSortField('');
    setSortDirection('asc');
    setPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <Sort />;
    return sortDirection === 'asc' ? <Sort /> : <Sort />;
  };

  const renderCell = (row: T, column: TableColumn) => {
    const value = row[column.field as keyof T];

    if (column.renderCell) {
      return column.renderCell(value, row);
    }

    if (column.type === 'date' && value) {
      return new Date(value as string).toLocaleDateString('pt-BR');
    }

    if (column.type === 'boolean') {
      return (
        <Chip
          label={value ? 'Sim' : 'Não'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      );
    }

    return String(value || '');
  };

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    <Skeleton variant="text" width="80%" height={24} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      <Skeleton variant="text" width="90%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ width: '100%', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      {(title || searchable || filterable || onRefresh || onExport) && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            
            <Stack direction="row" spacing={1}>
              {searchable && (
                <TextField
                  size="small"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}

              {filterable && (
                <>
                  <Button
                    startIcon={<FilterList />}
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    variant="outlined"
                    size="small"
                  >
                    Filtros
                  </Button>
                  <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                  >
                    {columns
                      .filter((col) => col.filterable !== false)
                      .map((column) => (
                        <MenuItem key={column.field}>
                          <TextField
                            label={column.headerName}
                            value={activeFilters[column.field] || ''}
                            onChange={(e) => handleFilterChange(column.field, e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </MenuItem>
                      ))}
                    <MenuItem>
                      <Button onClick={clearFilters} fullWidth>
                        Limpar Filtros
                      </Button>
                    </MenuItem>
                  </Menu>
                </>
              )}

              {onRefresh && (
                <Tooltip title="Atualizar">
                  <IconButton onClick={onRefresh}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              )}

              {onExport && (
                <Tooltip title="Exportar">
                  <IconButton onClick={onExport}>
                    <Download />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Table */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.type === 'number' ? 'right' : 'left'}
                  sx={{
                    fontWeight: 600,
                    cursor: column.sortable !== false && sortable ? 'pointer' : 'default',
                    minWidth: column.width,
                    '&:hover': column.sortable !== false && sortable ? { backgroundColor: 'action.hover' } : {},
                  }}
                  onClick={() => {
                    if (column.sortable !== false && sortable) {
                      handleSort(column.field);
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {column.headerName}
                    {column.sortable !== false && sortable && getSortIcon(column.field)}
                  </Box>
                </TableCell>
              ))}
              {(onEdit || onDelete || onView || actions.length > 0) && (
                <TableCell align="center" sx={{ width: 100 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView || actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {},
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.type === 'number' ? 'right' : 'left'}
                    >
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView || actions.length > 0) && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {onView && (
                          <Tooltip title="Visualizar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(row);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {actions.map((action, actionIndex) => (
                          <Tooltip key={actionIndex} title={action.label}>
                            <IconButton
                              size="small"
                              color={action.color}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={filteredAndSortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </Paper>
  );
}

export default DataTable; 