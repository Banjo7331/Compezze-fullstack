import React from 'react';
import { Box, Typography, CircularProgress, Chip, Stack, Paper, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Button } from '@/shared/ui/Button';
import { InviteUsersPanel } from './InviteUserPanel';
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
                <Typography variant="h6" color="text.secondary">
                    Kod Pokoju: <strong>{roomId}</strong>
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: isHost ? 8 : 12 }}>
                    <Paper elevation={3} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Dołączyli do gry ({participants.length})
                            </Typography>
                            {participants.length > 0 && <CircularProgress size={20} />}
                        </Stack>

                        <Grid container spacing={1}>
                            {participants.map((p, idx) => (
                                <Grid size="auto" key={idx}>
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
                                <Typography color="text.disabled" width="100%" align="center">
                                    Czekanie na graczy...
                                </Typography>
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
                </Grid>

                {isHost && (
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InviteUsersPanel roomId={roomId} />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};