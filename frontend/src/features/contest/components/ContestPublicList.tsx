import React from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Stack, Pagination, Chip, Alert } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { useNavigate } from 'react-router-dom';
import { usePublicContests } from '../hooks/usePublicContests';

export const ContestPublicList: React.FC = () => {
    const { contests, isLoading, error, page, totalPages, setPage } = usePublicContests();
    const navigate = useNavigate();

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    
    if (contests.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#fafafa', borderRadius: 2 }}>
                <SearchOffIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Brak aktywnych konkursów
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    W tej chwili nie ma żadnych publicznych konkursów, do których można dołączyć.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                {contests.map((contest) => (
                    <Paper 
                        key={contest.id} 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderLeft: '6px solid #9c27b0', // Fioletowy akcent (Secondary)
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                        }}
                    >
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                <EmojiEventsIcon color="secondary" fontSize="small" />
                                <Typography variant="h6" fontWeight="bold">
                                    {contest.name}
                                </Typography>
                            </Stack>
                            
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                                <Chip 
                                    label={contest.category} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ fontSize: '0.7rem' }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                    <CalendarTodayIcon fontSize="inherit" />
                                    <Typography variant="caption">
                                        Start: {new Date(contest.startDate).toLocaleDateString()} {new Date(contest.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            color="secondary"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(`/contest/${contest.id}`)}
                        >
                            Zobacz
                        </Button>
                    </Paper>
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1} 
                        onChange={handlePageChange} 
                        color="secondary" 
                    />
                </Box>
            )}
        </Box>
    );
};