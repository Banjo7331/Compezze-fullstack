import React from 'react';
import { Box, Typography, Paper, Button, Divider, Stack, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';

import { QuizRoomStatus } from '../model/types';
import type { LeaderboardEntryDto } from '../model/socket.types';

interface QuizResultViewProps {
    status: string;
    isHost: boolean;
    leaderboard: LeaderboardEntryDto[];
    onNext: () => void;
    onClose: () => void; // Host: Zamknij sesję (podczas gry)
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({ 
    status, 
    isHost, 
    leaderboard, 
    onNext, 
    onClose 
}) => {
    const isFinished = status === QuizRoomStatus.FINISHED;

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return { bgcolor: '#fff9c4', border: '2px solid #fbc02d', icon: '🥇' };
            case 2: return { bgcolor: '#f5f5f5', border: '2px solid #bdbdbd', icon: '🥈' };
            case 3: return { bgcolor: '#ffebee', border: '2px solid #ffab91', icon: '🥉' };
            default: return { bgcolor: 'white', border: '1px solid #eee', icon: `#${rank}` };
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 5, textAlign: 'center', maxWidth: 800, mx: 'auto', mt: 5, borderRadius: 4 }}>
            
            <Box sx={{ mb: 4 }}>
                {isFinished ? (
                    <>
                        <EmojiEventsIcon sx={{ fontSize: 80, color: '#fbc02d', mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                            Koniec Gry!
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Oto ostateczni zwycięzcy:
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            Koniec Czasu! ⏳
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Runda zakończona. Spójrz na aktualny ranking.
                        </Typography>
                    </>
                )}
            </Box>

            <Divider sx={{ my: 3 }}>
                <Chip label="RANKING (TOP 5)" />
            </Divider>

            <Stack spacing={2} sx={{ mb: 6 }}>
                {leaderboard.length === 0 ? (
                    <Typography color="text.secondary" fontStyle="italic">Brak wyników...</Typography>
                ) : (
                    leaderboard.slice(0, 5).map((entry) => {
                        const style = getRankStyle(entry.rank);
                        return (
                            <Box 
                                key={entry.userId || entry.rank} 
                                sx={{ 
                                    p: 2, 
                                    borderRadius: 3, 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    bgcolor: style.bgcolor,
                                    border: style.border,
                                    boxShadow: entry.rank <= 3 ? 2 : 0,
                                    transform: entry.rank === 1 ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h5" component="span">
                                        {style.icon}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {entry.nickname}
                                    </Typography>
                                </Box>
                                
                                <Typography variant="h5" fontWeight="bold" color="primary.main">
                                    {entry.score} <Typography component="span" variant="caption" color="text.secondary">pkt</Typography>
                                </Typography>
                            </Box>
                        );
                    })
                )}
            </Stack>

            {/* AKCJE HOSTA (TYLKO PODCZAS GRY) */}
            {isHost && !isFinished && (
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                        variant="outlined" 
                        color="error" 
                        size="large" 
                        onClick={onClose}
                        startIcon={<CloseIcon />}
                    >
                        Zakończ Quiz
                    </Button>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={onNext}
                        endIcon={<NavigateNextIcon />}
                        sx={{ px: 4 }}
                    >
                        Następne Pytanie
                    </Button>
                </Stack>
            )}
            
            {/* DLA GRACZA: Jeśli gra trwa, a runda się skończyła -> Info */}
            {!isHost && !isFinished && (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    Czekaj na ruch gospodarza...
                </Typography>
            )}
        </Paper>
    );
};