import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Stack, Pagination, CircularProgress, Alert, Chip, Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { Button } from '@/shared/ui/Button';
import type { GetQuizFormSummaryResponse, CreateQuizRoomRequest } from '../model/types';

import { StartQuizRoomDialog } from './StartQuizRoomDialog'; 

interface QuizItemProps {
    form: GetQuizFormSummaryResponse;
    onStartClick: (id: number) => void;
}

const QuizItem: React.FC<QuizItemProps> = ({ form, onStartClick }) => {
    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: `5px solid ${form.isPrivate ? 'gray' : '#ed6c02'}`
            }}
        >
            <Box>
                <Typography variant="subtitle1" fontWeight="bold">{form.title}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                    {form.isPrivate ? 
                        <Chip icon={<LockIcon />} label="Prywatny" size="small" /> : 
                        <Chip icon={<PublicIcon />} label="Publiczny" size="small" color="warning" variant="outlined" />
                    }
                </Stack>
            </Box>
            
            <Box>
                <Button 
                    size="small" 
                    variant="contained" 
                    color="success" 
                    startIcon={<PlayArrowIcon />}
                    onClick={() => onStartClick(form.id)}
                >
                    Start
                </Button>
            </Box>
        </Paper>
    );
};

export const AllQuizTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [forms, setForms] = useState<GetQuizFormSummaryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getAllForms({ page, size: 10, sort: 'title,asc' });
                setForms(data.content);
                setTotalPages(data.totalPages);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [page]);

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
            showSuccess("Pokój utworzony!");
            navigate(`/quiz/room/${result.roomId}`);
        } catch (e) {
            showError("Błąd podczas tworzenia pokoju.");
            setIsStarting(false);
        }
    };

    const handlePageChange = (_: any, value: number) => setPage(value - 1);

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;

    if (forms.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Brak dostępnych quizów.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
            <Stack spacing={2}>
                {forms.map((form) => (
                    <QuizItem 
                        key={form.id} 
                        form={form} 
                        onStartClick={handleOpenStartDialog} 
                    />
                ))}
            </Stack>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1} 
                        onChange={handlePageChange} 
                        color="primary" 
                    />
                </Box>
            )}

            <StartQuizRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => setStartDialogOpen(false)}
                onConfirm={handleConfirmStart}
            />
        </Box>
    );
};