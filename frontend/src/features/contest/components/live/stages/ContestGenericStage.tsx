import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export const ContestGenericStage: React.FC<{ name: string }> = ({ name }) => (
    <Paper sx={{ p: 8, textAlign: 'center', bgcolor: '#fafafa' }}>
        <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h3" gutterBottom>{name}</Typography>
        <Typography variant="h6" color="text.secondary">Proszę czekać...</Typography>
    </Paper>
);