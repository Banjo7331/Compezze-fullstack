import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, IconButton, Typography, 
    Box, CircularProgress, Alert, Divider, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

import { quizService } from '../api/quizService';
import type { GetQuizRoomDetailsResponse } from '../model/types';
import { QuizLeaderboardTable } from './QuizLeadboardTable';

interface QuizHistoryDialogProps {
    roomId: string | null;
    open: boolean;
    onClose: () => void;
}

export const QuizHistoryDialog: React.FC<QuizHistoryDialogProps> = ({ roomId, open, onClose }) => {
    const [data, setData] = useState<GetQuizRoomDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && roomId) {
            const load = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const details = await quizService.getRoomDetails(roomId);
                    setData(details);
                } catch (err) {
                    setError("Nie udało się pobrać rankingu.");
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }
    }, [open, roomId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle 
                component="div" 
                sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff3e0' }}
            >
                <Typography variant="h6" component="h2" fontWeight="bold">
                    Wyniki Quizu
                </Typography>
                
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : data ? (
                    <Box>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h5" gutterBottom>{data.quizTitle}</Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                                <Chip icon={<PersonIcon />} label={`${data.currentParticipants} graczy`} size="small" />
                                <Chip icon={<CalendarTodayIcon />} label={data.status === 'FINISHED' ? 'Zakończony' : 'W trakcie'} color={data.status === 'FINISHED' ? 'default' : 'success'} size="small" />
                            </Box>
                        </Box>

                        <Divider>🏆 TOP 5 🏆</Divider>

                        <QuizLeaderboardTable
                            leaderboard={data.currentResults?.leaderboard || []} 
                        />
                    </Box>
                ) : (
                    <Typography sx={{ p: 2 }}>Brak danych.</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};