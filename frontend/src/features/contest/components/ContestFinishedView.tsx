import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ContestLeaderboard } from './ContestLeaderboard';
import type { ContestLeaderboardEntryDto } from '../model/types';

interface Props {
    leaderboard: ContestLeaderboardEntryDto[];
    currentUserId?: string | null; 
    contestId: string;
}

export const ContestFinishedView: React.FC<Props> = ({ leaderboard, currentUserId, contestId }) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Karta Główna */}
            <Paper elevation={4} sx={{ p: 6, borderRadius: 4, width: '100%', textAlign: 'center', bgcolor: '#fffde7' }}>
                
                <EmojiEventsIcon sx={{ fontSize: 80, color: '#fbc02d', mb: 2 }} />
                
                <Typography variant="h3" fontWeight="bold" gutterBottom color="primary.main">
                    Konkurs Zakończony!
                </Typography>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Dziękujemy za udział. Oto ostateczne wyniki:
                </Typography>

                {/* Sekcja Rankingu - scrollowana, jeśli długa */}
                <Box sx={{ 
                    maxHeight: '500px', 
                    overflowY: 'auto', 
                    mb: 4, 
                    textAlign: 'left',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <ContestLeaderboard 
                        leaderboard={leaderboard} 
                        currentUserId={currentUserId} 
                    />
                </Box>

                <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/contest/${contestId}`)}
                    sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 'bold' }}
                >
                    Wróć do Strony Głównej
                </Button>

            </Paper>
        </Container>
    );
};