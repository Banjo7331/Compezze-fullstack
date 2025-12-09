import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Stack, Chip, IconButton, Pagination, CircularProgress, Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService';
import type { MySurveyRoomDto } from '../model/types';
import { SurveyResultsDialog } from './SurveyRoomResultsDialog';

export const MySurveyRoomHistory: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<MySurveyRoomDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenResults = (id: string) => {
        setSelectedRoomId(id);
        setIsDialogOpen(true);
    };

    const handleCloseResults = () => {
        setIsDialogOpen(false);
        setSelectedRoomId(null);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await surveyService.getMyRoomsHistory({ page, size: 5, sort: 'createdAt,desc' });
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

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;

    if (rooms.length === 0) {
        return <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Brak historii sesji.</Typography>;
    }

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
                            borderLeft: `4px solid ${room.isOpen ? '#4caf50' : '#9e9e9e'}`
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {room.surveyTitle}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                                <Chip 
                                    label={room.isOpen ? "AKTYWNY" : "ZAKOŃCZONY"} 
                                    color={room.isOpen ? "success" : "default"} 
                                    size="small" 
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon fontSize="inherit" sx={{ mr: 0.5 }}/> {room.totalParticipants}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <BarChartIcon fontSize="inherit" sx={{ mr: 0.5 }}/> {room.totalSubmissions}
                                    </span>
                                    <span>
                                        {new Date(room.createdAt).toLocaleDateString()}
                                    </span>
                                </Typography>
                            </Stack>
                        </Box>
                        
                        <Tooltip title="Zobacz Wyniki">
                            <IconButton color="primary" onClick={() => handleOpenResults(room.roomId)}>
                                <VisibilityIcon />
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
            <SurveyResultsDialog 
                open={isDialogOpen}
                roomId={selectedRoomId}
                onClose={handleCloseResults}
            />
        </Box>
    );
};