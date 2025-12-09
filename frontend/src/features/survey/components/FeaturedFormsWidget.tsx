import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Divider, Stack, CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GridViewIcon from '@mui/icons-material/GridView';
import { useNavigate } from 'react-router-dom';

import { useUserSurveyForms } from '../hooks/useUserSurveyForms';
import { surveyService } from '../api/surveyService';
import type { CreateRoomRequest } from '../model/types';
import { Button } from '@/shared/ui/Button';

import { AllFormsDialog } from './AllFormsDialog';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';

export const FeaturedTemplatesWidget: React.FC = () => {
    const navigate = useNavigate();
    
    const [isAllFormsDialogOpen, setIsAllFormsDialogOpen] = useState(false);
    
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    
    const { data, isLoading, error } = useUserSurveyForms({ 
        size: 3, 
        sort: 'id,desc' 
    });

    const handleOpenStartDialog = (id: number) => {
        setSelectedFormId(id);
        setStartDialogOpen(true);
    };

    const handleConfirmStart = async (config: { duration: number, maxParticipants: number }) => {
        if (!selectedFormId) return;

        setIsStarting(true);
        try {
            const request: CreateRoomRequest = {
                surveyFormId: selectedFormId,
                maxParticipants: config.maxParticipants,
                durationMinutes: config.duration
            };
            const result = await surveyService.createRoom(request);
            navigate(`/survey/room/${result.roomId}`);
        } catch (e) {
            alert("Failed to launch room");
            setIsStarting(false);
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 4, height: '100%', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ListAltIcon sx={{ mr: 1, fontSize: 30, color: 'text.primary' }} />
                    <Typography variant="h5" component="h2">
                        Szybki Start
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Twoje ostatnie szablony:
                </Typography>

                <Stack spacing={2}>
                    {isLoading && <CircularProgress size={20} sx={{alignSelf:'center'}} />}
                    {error && <Alert severity="error">Błąd ładowania</Alert>}
                    
                    {data?.map((survey) => (
                        <Paper 
                            key={survey.surveyFormId}
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderLeft: `5px solid ${survey.isPrivate ? 'gray' : '#1976d2'}` 
                            }}
                        >
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {survey.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {survey.isPrivate ? 'Prywatna' : 'Publiczna'}
                                </Typography>
                            </Box>
                            
                            <Button 
                                size="small" 
                                variant="contained"
                                color="success"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleOpenStartDialog(survey.surveyFormId!)}
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                Start
                            </Button>
                        </Paper>
                    ))}
                    
                    {data?.length === 0 && <Typography variant="caption" align="center">Brak szablonów.</Typography>}
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<GridViewIcon />}
                        onClick={() => setIsAllFormsDialogOpen(true)}
                    >
                        Wszystkie Szablony
                    </Button>
                </Box>
            </Paper>
            <AllFormsDialog 
                open={isAllFormsDialogOpen} 
                onClose={() => setIsAllFormsDialogOpen(false)} 
            />
            
            <StartSurveyRoomDialog 
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