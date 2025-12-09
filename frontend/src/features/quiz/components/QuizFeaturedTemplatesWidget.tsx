import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Divider, Stack, CircularProgress, Alert, Button
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GridViewIcon from '@mui/icons-material/GridView';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import type { MyQuizFormDto, CreateQuizRoomRequest } from '../model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { AllQuizFormsDialog } from './AllQuizFormsDialog';
import { StartQuizRoomDialog } from './StartQuizRoomDialog';
export const QuizFeaturedTemplatesWidget: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [forms, setForms] = useState<MyQuizFormDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isAllFormsDialogOpen, setIsAllFormsDialogOpen] = useState(false);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const data = await quizService.getMyForms({ page: 0, size: 3, sort: 'createdAt,desc' });
                setForms(data.content);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForms();
    }, []);

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
            showError("Nie udało się utworzyć gry.");
            setIsStarting(false);
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 4, height: '100%', backgroundColor: '#fff3e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ListAltIcon sx={{ mr: 1, fontSize: 30, color: 'warning.dark' }} />
                    <Typography variant="h5" component="h2" color="text.primary">
                        Szybka Gra
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Twoje ostatnie quizy:
                </Typography>

                <Stack spacing={2}>
                    {isLoading && <CircularProgress size={20} sx={{alignSelf:'center'}} />}
                    
                    {forms.map((quiz) => (
                        <Paper 
                            key={quiz.id}
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderLeft: `5px solid ${quiz.isPrivate ? 'gray' : '#ed6c02'}` 
                            }}
                        >
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {quiz.questionsCount} pytań • {quiz.isPrivate ? 'Prywatny' : 'Publiczny'}
                                </Typography>
                            </Box>
                            
                            <Button 
                                size="small" 
                                variant="contained"
                                color="warning"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleOpenStartDialog(quiz.id)}
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                GRAJ
                            </Button>
                        </Paper>
                    ))}
                    
                    {!isLoading && forms.length === 0 && (
                        <Typography variant="caption" align="center" display="block">
                            Brak quizów. Stwórz pierwszy!
                        </Typography>
                    )}
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                        variant="outlined" 
                        color="warning"
                        fullWidth 
                        startIcon={<GridViewIcon />}
                        onClick={() => setIsAllFormsDialogOpen(true)} 
                    >
                        Wszystkie Quizy
                    </Button>
                </Box>
            </Paper>

            <AllQuizFormsDialog 
                open={isAllFormsDialogOpen} 
                onClose={() => setIsAllFormsDialogOpen(false)} 
            />
            
            <StartQuizRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleConfirmStart}
            />
        </>
    );
};