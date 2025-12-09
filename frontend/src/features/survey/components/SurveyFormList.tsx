import React, { useState } from 'react'; 
import { 
    Box, Typography, CircularProgress, Alert, Pagination, Paper, Stack
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button'; 
import { useUserSurveyForms } from '../hooks/useUserSurveyForms'; 
import type { SurveyFormResponse, CreateRoomRequest } from '../model/types'; 
import { surveyService } from '../api/surveyService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';

interface SurveyItemProps {
    survey: SurveyFormResponse;
    onStartClick: (id: number) => void;
}

const SurveyItem: React.FC<SurveyItemProps> = ({ survey, onStartClick }) => {
    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                mb: 1.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: `5px solid ${survey.isPrivate ? 'gray' : '#1976d2'}`,
            }}
        >
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {survey.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {survey.isPrivate ? 'Prywatna' : 'Publiczna'}
                </Typography>
            </Box>
            
            <Box>
                <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => onStartClick(survey.surveyFormId)}
                >
                    Launch Room
                </Button>
            </Box>
        </Paper>
    );
};

export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const { showSuccess, showError } = useSnackbar();
    
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const { data, isLoading, error, page, totalPages, setPage } = useUserSurveyForms({ refreshTrigger }); 
    
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
            showSuccess("Pokój utworzony!");
            navigate(`/survey/room/${result.roomId}`);
        } catch (e) {
            showError("Błąd podczas tworzenia pokoju.");
            setIsStarting(false);
        }
    };
    
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1); 
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading surveys: {error.message}.</Alert>;
    
    if (!data || data.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <ListAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">Nie utworzyłeś jeszcze żadnych ankiet.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
            <Stack spacing={1}>
                {data.map((survey) => (
                    <SurveyItem 
                        key={survey.surveyFormId} 
                        survey={survey} 
                        onStartClick={handleOpenStartDialog}
                    />
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}

            <StartSurveyRoomDialog 
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