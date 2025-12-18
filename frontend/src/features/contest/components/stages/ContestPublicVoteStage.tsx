import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardActionArea, 
    Dialog, DialogContent, DialogActions, DialogTitle, Button, 
    IconButton, CircularProgress, Alert, Chip, CardMedia
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { SubmissionDto, StageSettingsResponse } from '@/features/contest/model/types';

interface Props {
    contestId: string;
    roomId: string;
    settings: StageSettingsResponse;
}

const shuffleArray = (array: SubmissionDto[]) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

export const ContestPublicVoteStage: React.FC<Props> = ({ contestId, roomId, settings }) => {
    const { showSuccess, showError } = useSnackbar();
    
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedSub, setSelectedSub] = useState<SubmissionDto | null>(null);
    
    const [votedSubId, setVotedSubId] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const list: any = await contestService.getSubmissionsForReview(contestId, 'APPROVED');
                const rawData = Array.isArray(list) ? list : list.content;
                setSubmissions(shuffleArray(rawData || []));
            } catch (e) {
                console.error("Błąd pobierania listy", e);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [contestId]);

    // --- ZMIANA: USUNIĘTY useEffect fetchSingleUrl ---

    const handleVote = async () => {
        if (!selectedSub) return;
        setIsVoting(true);
        try {
            await contestService.vote(contestId, roomId, settings.stageId, selectedSub.id, 1);
            showSuccess(`Twój głos na "${selectedSub.participantName}" został przyjęty!`);
            setVotedSubId(selectedSub.id);
            setSelectedSub(null);
        } catch (e: any) {
            if (e.response?.status === 409 || e.message?.includes("already")) {
                showError("Możesz oddać tylko jeden głos!");
            } else {
                showError("Wystąpił błąd podczas głosowania.");
            }
        } finally {
            setIsVoting(false);
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Box>
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Głosowanie Publiczności
                </Typography>
                <Typography color="text.secondary">
                    Kliknij w kartę, aby zobaczyć pracę i oddać głos.<br/>
                    Masz tylko <strong>JEDEN</strong> głos!
                </Typography>
                
                {votedSubId && (
                    <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mt: 2, display: 'inline-flex' }}>
                        Dziękujemy za oddanie głosu.
                    </Alert>
                )}
            </Box>

            <Grid container spacing={2}>
                {submissions.map((sub) => {
                    const isSelected = votedSubId === sub.id;
                    const isOther = votedSubId && !isSelected;
                    const isVideo = sub.mediaUrl?.includes('.mp4');

                    return (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={sub.id}>
                            <Card 
                                elevation={isSelected ? 8 : 2}
                                sx={{ 
                                    height: '100%', 
                                    opacity: isOther ? 0.5 : 1,
                                    border: isSelected ? '2px solid #4caf50' : 'none',
                                    transition: '0.3s',
                                    '&:hover': { transform: !votedSubId ? 'scale(1.03)' : 'none' }
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => !votedSubId && setSelectedSub(sub)}
                                    disabled={!!votedSubId}
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                                >
                                    <Box sx={{ 
                                        width: '100%', height: 140, 
                                        bgcolor: '#f5f5f5', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#bdbdbd',
                                        position: 'relative'
                                    }}>
                                        {/* Wyświetl miniaturkę jeśli to obrazek */}
                                        {!isVideo && sub.mediaUrl ? (
                                             <CardMedia 
                                                component="img" 
                                                image={sub.mediaUrl} 
                                                sx={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                                             />
                                        ) : (
                                            <ZoomInIcon fontSize="large" />
                                        )}
                                    </Box>
                                    
                                    <CardContent sx={{ width: '100%' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                            {sub.participantName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                            {sub.originalFilename || "Bez tytułu"}
                                        </Typography>
                                        
                                        {isSelected && (
                                            <Chip label="Twój Głos" color="success" size="small" sx={{ mt: 1 }} />
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog 
                open={!!selectedSub} 
                onClose={() => setSelectedSub(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedSub && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="bold">{selectedSub.participantName}</Typography>
                            <IconButton onClick={() => setSelectedSub(null)}><CloseIcon /></IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Box sx={{ 
                                width: '100%', minHeight: 300, bgcolor: 'black', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mb: 2, borderRadius: 1, overflow: 'hidden'
                            }}>
                                {/* --- ZMIANA: Używamy mediaUrl bezpośrednio --- */}
                                {selectedSub.mediaUrl ? (
                                    selectedSub.mediaUrl.includes('.mp4') ? (
                                        <video controls autoPlay style={{ maxHeight: '60vh', maxWidth: '100%' }} src={selectedSub.mediaUrl} />
                                    ) : (
                                        <img src={selectedSub.mediaUrl} alt="Praca" style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} />
                                    )
                                ) : (
                                    <Typography color="error">Brak pliku</Typography>
                                )}
                            </Box>
                            
                            <Typography variant="body1">
                                {selectedSub.comment || "Brak opisu pracy."}
                            </Typography>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                            <Button onClick={() => setSelectedSub(null)} color="inherit" sx={{ mr: 2 }}>
                                Wróć
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                startIcon={<HowToVoteIcon />}
                                onClick={handleVote}
                                disabled={isVoting}
                                sx={{ px: 4 }}
                            >
                                {isVoting ? "Zapisywanie..." : "ODDAJ GŁOS"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};