import React, { useState } from 'react';
import {
    Paper, Box, Typography, Chip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TableSortLabel, Tooltip, IconButton
} from '@mui/material';
import { Block as IgnoreIcon } from '@mui/icons-material';

const getDirectoryColor = (count) => {
    if (count === 0) return '#7b1fa2';
    if (count <= 15) return '#4caf50';
    if (count <= 20) return '#ffc107';
    if (count <= 25) return '#ff9800';
    return '#f44336';
};

const DirectoryMetricsTable = ({ directoryData, onIgnoreDirectory }) => {
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('fileCount');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedData = React.useMemo(() => {
        return [...directoryData].sort((a, b) => {
            if (orderBy === 'fileCount') {
                return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
            }
            if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
            if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [order, orderBy, directoryData]);

    return (
        <Paper variant="outlined" sx={{ mt: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="h6">Diretórios por Quantidade de Arquivos</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'path' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'path'}
                                    direction={orderBy === 'path' ? order : 'asc'}
                                    onClick={() => handleRequestSort('path')}
                                >
                                    Diretório
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'fileCount' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'fileCount'}
                                    direction={orderBy === 'fileCount' ? order : 'asc'}
                                    onClick={() => handleRequestSort('fileCount')}
                                >
                                    Qtd. Arquivos
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map(dir => (
                            <TableRow key={dir.path}>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{dir.path}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={dir.fileCount}
                                        size="small"
                                        sx={{ backgroundColor: getDirectoryColor(dir.fileCount), color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Adicionar diretório à lista de ignorados">
                                        <IconButton size="small" onClick={() => onIgnoreDirectory(dir.path)}>
                                            <IgnoreIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DirectoryMetricsTable;