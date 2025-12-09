import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Skeleton, Stack } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ListIcon from '@mui/icons-material/List';

import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { contestService } from '../api/contestService';
import type { UpcomingContestDto } from '../model/types';

import { MyEnteredContestsDialog } from './MyEnteredContestsDialog'; 

export const UpcomingContestWidget: React.FC = () => {
    const navigate = useNavigate();
    const [contest, setContest] = useState<UpcomingContestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await contestService.getUpcomingContest();
                setContest(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    if (isLoading) {
        return <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />;
    }

    if (!contest) return null;

    const isLive = new Date(contest.startDate) <= new Date();

    return (
        <>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    background: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
                    color: 'white',
                    borderRadius: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <EmojiEventsIcon sx={{ color: '#ffd700' }} /> 
                        <Typography variant="overline" sx={{ fontWeight: 'bold', letterSpacing: 1, color: 'rgba(255,255,255,0.9)' }}>
                            TWÓJ NAJBLIŻSZY KONKURS
                        </Typography>
                        {contest.isOrganizer && <Chip label="ORGANIZATOR" size="small" color="warning" />}
                    </Stack>
                    
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {contest.name}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ opacity: 0.8 }} />
                            <Typography variant="body2">
                                Start: {new Date(contest.startDate).toLocaleString()}
                            </Typography>
                        </Box>
                        <Chip 
                            label={contest.category} 
                            size="small" 
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                        />
                    </Stack>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        onClick={() => setIsDialogOpen(true)}
                        sx={{ 
                            color: 'white', 
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                        }}
                        startIcon={<ListIcon />}
                    >
                        INNE
                    </Button>

                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => navigate(`/contest/${contest.id}`)}
                        sx={{ 
                            bgcolor: 'white', 
                            color: '#6a1b9a', 
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#f3e5f5' } 
                        }}
                        endIcon={<ArrowForwardIcon />}
                    >
                        {isLive ? "WEJDŹ TERAZ" : "SZCZEGÓŁY"}
                    </Button>
                </Stack>
            </Paper>

            <MyEnteredContestsDialog 
                open={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </>
    );
};