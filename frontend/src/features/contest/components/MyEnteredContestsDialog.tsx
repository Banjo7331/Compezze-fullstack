import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, 
    Stack, Chip, CircularProgress, Pagination, Button 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

import { contestService } from '../api/contestService';
import type { UpcomingContestDto } from '../model/types';

interface Props {
    open: boolean;
    onClose: () => void;
}

export const MyEnteredContestsDialog: React.FC<Props> = ({ open, onClose }) => {
    const navigate = useNavigate();
    
    const [contests, setContests] = useState<UpcomingContestDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (open) {
            const fetch = async () => {
                setIsLoading(true);
                try {
                    const data = await contestService.getMyParticipatedContests({ page, size: 5, sort: 'startDate,asc' });
                    setContests(data.content);
                    setTotalPages(data.totalPages);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetch();
        }
    }, [open, page]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f3e5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon color="secondary" />
                    <Typography variant="h6" fontWeight="bold">Moje Wydarzenia</Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : contests.length === 0 ? (
                    <Typography align="center" sx={{ p: 4, color: 'text.secondary' }}>
                        Brak nadchodzących wydarzeń.
                    </Typography>
                ) : (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {contests.map((contest) => (
                            <Box 
                                key={contest.id} 
                                sx={{ 
                                    p: 2, 
                                    border: '1px solid #eee', 
                                    borderRadius: 2,
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    '&:hover': { bgcolor: '#fafafa' }
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {contest.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                        {contest.isOrganizer && <Chip label="Host" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarTodayIcon fontSize="inherit" />
                                            {new Date(contest.startDate).toLocaleDateString()}
                                        </Typography>
                                        <Chip label={contest.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    </Stack>
                                </Box>
                                
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="secondary"
                                    endIcon={<PlayArrowIcon />}
                                    onClick={() => {
                                        navigate(`/contest/${contest.id}`);
                                        onClose();
                                    }}
                                >
                                    Przejdź
                                </Button>
                            </Box>
                        ))}
                    </Stack>
                )}
                
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} color="secondary" size="small" />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};