import React from 'react';
import { Box, Typography, CircularProgress, Chip, Stack, Paper, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Button } from '@/shared/ui/Button';
import type { LeaderboardEntryDto } from '../model/socket.types';

interface QuizLobbyProps {
    isHost: boolean;
    roomId: string;
    participants: LeaderboardEntryDto[];
    onStart: () => void;
}

export const QuizLobby: React.FC<QuizLobbyProps> = ({ isHost, roomId, participants, onStart }) => {
    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <SportsEsportsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" gutterBottom fontWeight="bold">
                    {isHost ? "Panel Hosta" : "Oczekiwanie na start..."}
                </Typography>
            </Box>

            {/* ✅ TERAZ TO JEST PROSTA KARTA, bez wbudowanego panelu zaproszeń */}
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Dołączyli do gry ({participants.length})
                    </Typography>
                    {participants.length > 0 && <CircularProgress size={20} />}
                </Stack>

                <Grid container spacing={1}>
                    {participants.map((p, idx) => (
                        <Grid key={idx}> 
                            <Chip 
                                icon={<PersonIcon />} 
                                label={p.nickname} 
                                color="primary" 
                                variant="outlined" 
                                sx={{ px: 1 }}
                            />
                        </Grid>
                    ))}
                    
                    {participants.length === 0 && (
                        <Grid size={12} sx={{ width: '100%' }}> 
                            <Typography color="text.disabled" align="center">
                                Czekanie na graczy...
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {isHost && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        color="success"
                        onClick={onStart} 
                        disabled={participants.length === 0}
                        sx={{ px: 6, py: 1.5, fontSize: '1.2rem', borderRadius: 4 }}
                    >
                        ROZPOCZNIJ QUIZ 🚀
                    </Button>
                </Box>
            )}
        </Box>
    );
};