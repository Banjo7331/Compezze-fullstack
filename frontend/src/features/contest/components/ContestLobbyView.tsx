import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Button } from '@/shared/ui/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Props {
    isOrganizer: boolean;
    onStart: () => void;
}

export const ContestLobbyView: React.FC<Props> = ({ isOrganizer, onStart }) => {
    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 6, 
                textAlign: 'center', 
                minHeight: '50vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f3e5f5 0%, #fff 100%)'
            }}
        >
            <HourglassEmptyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                Lobby Konkursowe
            </Typography>
            
            <Typography variant="h6" color="text.secondary" paragraph>
                {isOrganizer 
                    ? "Jesteś organizatorem. Uruchom konkurs, gdy wszyscy będą gotowi." 
                    : "Czekaj na rozpoczęcie konkursu przez organizatora..."}
            </Typography>

            {isOrganizer ? (
                <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large" 
                    startIcon={<PlayArrowIcon />}
                    onClick={onStart}
                    sx={{ mt: 4, px: 6, py: 1.5, fontSize: '1.2rem' }}
                >
                    ROZPOCZNIJ KONKURS
                </Button>
            ) : (
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} color="secondary" />
                    <Typography variant="caption">Oczekiwanie na sygnał startu...</Typography>
                </Box>
            )}
        </Paper>
    );
};