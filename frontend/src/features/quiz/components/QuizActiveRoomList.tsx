import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Stack, Pagination, Chip, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import type { GetActiveQuizRoomResponse } from '../model/types';

export const QuizActiveRoomsList: React.FC = () => {
    const navigate = useNavigate();
    
    const [rooms, setRooms] = useState<GetActiveQuizRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getActiveRooms({ page, size: 10, sort: 'createdAt,desc' });
                setRooms(data.content);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać listy aktywnych gier.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [page]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    if (rooms.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <MeetingRoomIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">Brak aktywnych gier w tym momencie.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                {rooms.map((room) => (
                    <Paper 
                        key={room.roomId} 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            borderLeft: '6px solid #ed6c02',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SportsEsportsIcon fontSize="small" color="warning" />
                                {room.quizTitle}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Chip 
                                    label={room.status === 'LOBBY' ? "W POCZEKALNI" : "GRA TRWA"} 
                                    color={room.status === 'LOBBY' ? "success" : "warning"} 
                                    size="small" 
                                    variant="outlined"
                                />

                                <Chip 
                                    icon={<PersonIcon />} 
                                    label={`${room.participantsCount} / ${room.maxParticipants || '∞'}`} 
                                    size="small" 
                                    variant="outlined" 
                                />
                                
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    ID: {room.roomId}
                                </Typography>
                            </Stack>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            color="warning"
                            onClick={() => navigate(`/quiz/join/${room.roomId}`)}
                        >
                            DOŁĄCZ
                        </Button>
                    </Paper>
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1} 
                        onChange={handlePageChange} 
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};