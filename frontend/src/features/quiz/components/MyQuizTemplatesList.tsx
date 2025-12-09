import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, IconButton, Stack, Pagination, 
    CircularProgress, Alert, Chip, Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { Button } from '@/shared/ui/Button';
import type { MyQuizFormDto, CreateQuizRoomRequest } from '../model/types';

import { StartQuizRoomDialog } from './StartQuizRoomDialog';

export const MyQuizTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [forms, setForms] = useState<MyQuizFormDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getMyForms({ page, size: 5, sort: 'createdAt,desc' });
                setForms(data.content);
                setTotalPages(data.totalPages);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [page, refreshTrigger]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Czy na pewno usunąć ten Quiz?")) return;
        try {
            await quizService.deleteForm(id);
            showSuccess("Quiz usunięty.");
            setRefreshTrigger(p => p + 1);
        } catch (e: any) {
            showError("Nie udało się usunąć (może są aktywne gry?).");
        }
    };

    const handleOpenStartDialog = (id: number) => {
        setSelectedFormId(id);
        setStartDialogOpen(true);
    };

    const handleConfirmStart = async (config: { maxParticipants: number }) => {
        if (!selectedFormId) return;
        setIsStarting(true);
        try {
            const request: CreateQuizRoomRequest = { 
                quizFormId: selectedFormId, 
                maxParticipants: config.maxParticipants, 
                isPrivate: false 
            };
            const result = await quizService.createRoom(request);
            showSuccess("Lobby utworzone!");
            navigate(`/quiz/room/${result.roomId}`);
        } catch (e) {
            showError("Błąd startu.");
            setIsStarting(false);
        }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;

    if (forms.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>Brak quizów.</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/quiz/create')}>
                    Stwórz pierwszy
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
            <Stack spacing={2}>
                {forms.map((form) => (
                    <Paper key={form.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '5px solid #ed6c02' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{form.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {form.questionsCount} pytań • {form.isPrivate ? "Prywatny" : "Publiczny"} • {new Date(form.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Box>
                            <Tooltip title="Graj">
                                <IconButton color="warning" onClick={() => handleOpenStartDialog(form.id)}>
                                    <PlayArrowIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Usuń">
                                <IconButton color="error" onClick={() => handleDelete(form.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} color="primary" />
                </Box>
            )}

            <StartQuizRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleConfirmStart}
            />
        </Box>
    );
};