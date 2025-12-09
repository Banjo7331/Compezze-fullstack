import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Grid, Card, CardContent, CardMedia, Typography, 
    Stack, TextField, Button, Box, CircularProgress, Alert,
    Dialog, DialogContent, IconButton, DialogTitle
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { contestService } from '@/features/contest/api/contestService';
import type { SubmissionDto } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

const ContestReviewPage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Record<string, string>>({});

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');

    const fetchSubmissions = async () => {
        try {
            const response: any = await contestService.getSubmissionsForReview(contestId!, 'PENDING');
            const list = Array.isArray(response) 
                ? response 
                : (response?.content || []);
            
            setSubmissions(list);
        } catch (e) {
            console.error(e);
            showError("Nie udało się pobrać zgłoszeń.");
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) fetchSubmissions();
    }, [contestId]);

    const handleReview = async (subId: string, action: 'APPROVED' | 'REJECTED') => {
        const comment = comments[subId] || "";
        if (action === 'REJECTED' && !comment.trim()) {
            showError("Przy odrzuceniu wymagany jest komentarz.");
            return;
        }
        try {
            await contestService.reviewSubmission(contestId!, subId, action, comment);
            showSuccess(`Zgłoszenie ${action === 'APPROVED' ? 'zatwierdzone' : 'odrzucone'}.`);
            setSubmissions(prev => prev.filter(s => s.id !== subId));
        } catch (e) {
            showError("Błąd wysyłania decyzji.");
        }
    };

    const handleOpenPreview = async (sub: SubmissionDto) => {
        try {
            const url = await contestService.getSubmissionMediaUrl(contestId!, sub.id);
            const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
            
            setPreviewUrl(url);
            setPreviewType(isVideo ? 'video' : 'image');
            setPreviewTitle(sub.participantName);
            setPreviewOpen(true);
        } catch (e) {
            showError("Nie udało się załadować pliku.");
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewUrl(null);
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Wróć do Konkursu
            </Button>
            
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Weryfikacja Zgłoszeń ({submissions.length})
            </Typography>

            {submissions.length === 0 ? (
                <Alert severity="success" sx={{ mt: 4, py: 3 }}>
                    <Typography variant="h6">Brak zgłoszeń oczekujących.</Typography>
                    Wszystkie prace zostały zweryfikowane lub nikt jeszcze nic nie wysłał.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {submissions.map((sub) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sub.id}>
                            <Card elevation={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                
                                <Box 
                                    sx={{ 
                                        height: 200, 
                                        bgcolor: '#eee', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', cursor: 'pointer',
                                        '&:hover .play-btn': { transform: 'scale(1.1)' }
                                    }}
                                    onClick={() => handleOpenPreview(sub)}
                                >
                                    <Box className="play-btn" sx={{ transition: '0.2s', textAlign: 'center' }}>
                                        <PlayCircleOutlinedIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8 }} />
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            KLIKNIJ ABY ZOBACZYĆ
                                        </Typography>
                                    </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>{sub.participantName}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Data: {new Date(sub.createdAt).toLocaleString()}
                                    </Typography>
                                    
                                    <TextField 
                                        label="Komentarz"
                                        fullWidth multiline rows={2} size="small" variant="outlined"
                                        sx={{ mt: 2, mb: 2 }}
                                        value={comments[sub.id] || ''}
                                        onChange={(e) => setComments({ ...comments, [sub.id]: e.target.value })}
                                    />

                                    <Stack direction="row" spacing={1} mt="auto">
                                        <Button fullWidth variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleReview(sub.id, 'APPROVED')}>
                                            Akceptuj
                                        </Button>
                                        <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleReview(sub.id, 'REJECTED')}>
                                            Odrzuć
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: 'black', color: 'white' } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                    <Typography variant="subtitle1">{previewTitle}</Typography>
                    <IconButton onClick={handleClosePreview} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', minHeight: 300 }}>
                    {previewUrl && (
                        previewType === 'video' ? (
                            <video src={previewUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                        ) : (
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                        )
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default ContestReviewPage;