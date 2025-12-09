import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, IconButton, Stack, Pagination, 
    CircularProgress, Alert, Chip, Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { Button } from '@/shared/ui/Button';
import type { MySurveyFormDto, CreateRoomRequest } from '../model/types';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';

export const MyTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [forms, setForms] = useState<MySurveyFormDto[]>([]);
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
                const data = await surveyService.getMyForms({ page, size: 5, sort: 'createdAt,desc' });
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

    const openStartDialog = (formId: number) => {
        setSelectedFormId(formId);
        setStartDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten szablon? Nie będziesz mógł tworzyć z niego nowych sesji.")) return;

        try {
            await surveyService.deleteForm(id);
            showSuccess("Szablon został usunięty.");
            setRefreshTrigger(prev => prev + 1);
        } catch (e: any) {
            showError("Nie udało się usunąć. Sprawdź czy nie ma aktywnych sesji powiązanych z tym szablonem.");
        }
    };

    const handleQuickLaunch = async (config: { duration: number, maxParticipants: number }) => {
        if (!selectedFormId) return;

        setIsStarting(true);
        try {
            const request: CreateRoomRequest = {
                surveyFormId: selectedFormId,
                maxParticipants: config.maxParticipants,
                durationMinutes: config.duration
            };
            
            const result = await surveyService.createRoom(request);
            showSuccess("Pokój utworzony pomyślnie!");
            navigate(`/survey/room/${result.roomId}`);
            
        } catch (e) {
            showError("Błąd podczas tworzenia pokoju.");
            setIsStarting(false);
        }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;

    if (forms.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>Nie masz jeszcze żadnych szablonów.</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/survey/create')}>
                    Utwórz pierwszy
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={2}>
                {forms.map((form) => (
                    <Paper key={form.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{form.title}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                                <Chip 
                                    label={form.isPrivate ? "Prywatna" : "Publiczna"} 
                                    size="small" 
                                    color={form.isPrivate ? "default" : "primary"} 
                                    variant="outlined" 
                                />
                                <Typography variant="caption" color="text.secondary">
                                    • {form.questionsCount} pytań • {new Date(form.createdAt).toLocaleDateString()}
                                </Typography>
                            </Stack>
                        </Box>
                        
                        <Box>
                            <Tooltip title="Uruchom nową sesję">
                                <IconButton color="success" onClick={() => openStartDialog(form.id)}>
                                    <PlayArrowIcon />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Usuń szablon">
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

            <StartSurveyRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleQuickLaunch}
            />
        </Box>
    );
};