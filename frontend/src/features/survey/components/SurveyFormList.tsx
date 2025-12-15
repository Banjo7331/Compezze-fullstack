import React, { useState, useEffect } from 'react'; 
import { 
    Box, Typography, CircularProgress, Alert, Pagination, Paper, Stack, 
    TextField, InputAdornment 
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button'; 

import { surveyService } from '../api/surveyService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { SurveyFormResponse, CreateRoomRequest } from '../model/types'; 

interface SurveyItemProps {
    survey: SurveyFormResponse;
    onStartClick: (id: number) => void;
}

const SurveyItem: React.FC<SurveyItemProps> = ({ survey, onStartClick }) => {
    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: `5px solid ${survey.isPrivate ? 'gray' : '#1976d2'}`,
            }}
        >
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{survey.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {survey.isPrivate ? 'Prywatna' : 'Publiczna'}
                </Typography>
            </Box>
            <Button 
                size="small" variant="contained" color="primary"
                onClick={() => onStartClick(survey.surveyFormId)}
            >
                Launch Room
            </Button>
        </Paper>
    );
};

export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); 
    const { showSuccess, showError } = useSnackbar();
    
    // Stany Modala
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    // Stany Danych
    const [data, setData] = useState<SurveyFormResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ✅ Wyszukiwarka
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    
    // Pobieranie danych
    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const response = await surveyService.getAllForms({ 
                    page, 
                    size: 5, // Mniejszy size bo to mała lista w oknie
                    sort: 'title,asc',
                    search: debouncedSearch 
                });
                setData(response.content);
                setTotalPages(response.totalPages);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Błąd pobierania ankiet");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [page, debouncedSearch]);

    // Reset strony
    useEffect(() => { setPage(0); }, [debouncedSearch]);

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

    return (
        <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
            
            {/* ✅ PASEK SZUKANIA */}
            <Box mb={2} position="sticky" top={0} zIndex={10} bgcolor="white" pt={1}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Szukaj ankiety..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                    }}
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : !data || data.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <ListAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                        {search ? "Nie znaleziono." : "Nie utworzyłeś jeszcze żadnych ankiet."}
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1}>
                    {data.map((survey) => (
                        <SurveyItem 
                            key={survey.surveyFormId} 
                            survey={survey} 
                            onStartClick={handleOpenStartDialog}
                        />
                    ))}
                </Stack>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
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