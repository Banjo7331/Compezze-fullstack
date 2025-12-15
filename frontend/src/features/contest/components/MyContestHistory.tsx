import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Accordion, AccordionSummary, AccordionDetails, 
    Chip, Stepper, Step, StepLabel, Table, TableBody, TableCell, TableHead, TableRow,
    CircularProgress, Alert, Paper, Stack, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import QuizIcon from '@mui/icons-material/Quiz';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import GavelIcon from '@mui/icons-material/Gavel';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestLeaderboardEntryDto } from '../model/types'; 

export const MyContestsHistory: React.FC = () => {
    const [contests, setContests] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const data = await contestService.getMyContests({ 
                    page: 0, 
                    size: 10, 
                    sort: 'startDate,desc' 
                }); 
                
                setContests(data.content || []);
                
            } catch (e) {
                console.error("Błąd pobierania konkursów", e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchContests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE': return 'success';
            case 'FINISHED': return 'default';
            case 'CREATED': return 'info';
            default: return 'default';
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    if (contests.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>Brak historii konkursów.</Alert>;
    }

    return (
        <Box>
            {contests.map((contest) => (
                <Accordion key={contest.id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 1 }}>
                    
                    {/* NAGŁÓWEK: Nazwa, Data, Status */}
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, pr: 2 }}>
                            <EventIcon color="action" />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{contest.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(contest.startDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Chip 
                                label={contest.status} 
                                color={getStatusColor(contest.status) as any} 
                                size="small" 
                                variant="outlined"
                            />
                        </Box>
                    </AccordionSummary>

                    {/* SZCZEGÓŁY: Tylko Oś Czasu i Wyniki */}
                    <AccordionDetails sx={{ bgcolor: '#fafafa', p: 3 }}>
                        <Stack spacing={4}>
                            
                            {/* 1. OŚ CZASU (Przebieg) */}
                            <Box>
                                <Typography variant="overline" color="text.secondary" gutterBottom display="block">
                                    PRZEBIEG ETAPÓW
                                </Typography>
                                <Stepper alternativeLabel activeStep={contest.status === 'FINISHED' ? 99 : -1}>
                                    {contest.stages?.map((stage: any) => (
                                        <Step key={stage.id} completed={contest.status === 'FINISHED'}>
                                            <StepLabel StepIconComponent={() => getStageIcon(stage.type)}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {translateStageType(stage.type)}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>

                            {/* 2. WYNIKI (Tylko jeśli są dostępne) */}
                            {contest.leaderboard && contest.leaderboard.length > 0 && (
                                <Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmojiEventsIcon color="warning" fontSize="small" />
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                            WYNIKI KOŃCOWE (TOP 5)
                                        </Typography>
                                    </Box>
                                    
                                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: '#eee' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold', width: 50 }}>#</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Uczestnik</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Punkty</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(contest.leaderboard as ContestLeaderboardEntryDto[]).slice(0, 5).map((entry, idx) => (
                                                    <TableRow key={entry.userId} hover>
                                                        <TableCell>
                                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                                                            {entry.displayName}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                            {entry.totalScore}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </Box>
                            )}

                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

// --- Helpery ---

const translateStageType = (type: string) => {
    switch(type) {
        case 'QUIZ': return 'Quiz';
        case 'PUBLIC_VOTE': return 'Głosowanie';
        case 'JURY_VOTE': return 'Jury';
        default: return type;
    }
};

const getStageIcon = (type: string) => {
    // Zwracamy komponenty ikon MUI w kółeczku, żeby pasowały do Steppera
    const iconStyle = { 
        width: 24, height: 24, borderRadius: '50%', bgcolor: '#e0e0e0', color: '#616161',
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5
    };
    
    let Icon = FlagIcon;
    if (type === 'QUIZ') Icon = QuizIcon;
    if (type === 'PUBLIC_VOTE') Icon = HowToVoteIcon;
    if (type === 'JURY_VOTE') Icon = GavelIcon;

    return (
        <Box sx={iconStyle}>
            <Icon sx={{ fontSize: 16 }} />
        </Box>
    );
};