import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Stack, Chip, IconButton, Pagination, CircularProgress, Tooltip 
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';

import { quizService } from '../api/quizService';
import type { MyQuizRoomDto } from '../model/types';
import { QuizHistoryDialog } from './QuizHistoryDialog';

export const MyQuizHistory: React.FC = () => {
    const [rooms, setRooms] = useState<MyQuizRoomDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getMyRoomsHistory({ page, size: 5, sort: 'createdAt,desc' });
                setRooms(data.content);
                setTotalPages(data.totalPages);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [page]);

    const handleOpenResults = (roomId: string) => {
        setSelectedRoomId(roomId);
        setIsDialogOpen(true);
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (rooms.length === 0) return <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Brak historii gier.</Typography>;

    return (
        <Box>
            <Stack spacing={2}>
                {rooms.map((room) => (
                    <Paper 
                        key={room.roomId} 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderLeft: `4px solid ${room.status === 'FINISHED' ? '#9e9e9e' : '#ed6c02'}`
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SportsEsportsIcon fontSize="small" color="warning" />
                                {room.quizTitle}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                                <Chip 
                                    label={room.status === 'FINISHED' ? "ZAKOŃCZONY" : "W TRAKCIE"} 
                                    color={room.status === 'FINISHED' ? "default" : "warning"} 
                                    size="small" 
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <span><PersonIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }}/> {room.totalParticipants} graczy</span>
                                    <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                                </Typography>
                            </Stack>
                        </Box>
                        
                        <Tooltip title="Zobacz Ranking">
                            <IconButton color="warning" onClick={() => handleOpenResults(room.roomId)}>
                                <EmojiEventsIcon />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} color="primary" />
                </Box>
            )}

            <QuizHistoryDialog 
                open={isDialogOpen} 
                roomId={selectedRoomId} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </Box>
    );
};