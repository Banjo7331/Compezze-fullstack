import React from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Stack, Pagination, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';
import { useSurveyActiveRooms } from '../hooks/useSurveyActiveRooms';

export const ActiveRoomsList = () => {
    const { rooms, isLoading, error, page, totalPages, setPage } = useSurveyActiveRooms();
    const navigate = useNavigate();

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (rooms.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <MeetingRoomIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No active rooms available at the moment.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                {rooms.map((room) => (
                    <Paper key={room.roomId} elevation={2} sx={{ p: 2, borderLeft: '6px solid #4caf50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{room.surveyTitle}</Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Chip 
                                    icon={<PersonIcon />} 
                                    label={`${room.currentParticipants} / ${room.maxParticipants || '∞'}`} 
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
                            color="success"
                            onClick={() => navigate(`/survey/join/${room.roomId}`)}
                        >
                            Join
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