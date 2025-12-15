import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Button, CircularProgress, Stack, Pagination, Chip, 
    TextField, InputAdornment, Alert 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SearchIcon from '@mui/icons-material/Search'; // ✅
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService'; // Bezpośrednie użycie serwisu
import { useDebounce } from '@/shared/hooks/useDebounce'; // ✅
import type { ActiveRoomResponse } from '../model/types';

export const ActiveRoomsList: React.FC = () => {
    const navigate = useNavigate();
    
    // Stan Danych
    const [rooms, setRooms] = useState<ActiveRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Stan Paginacji
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ✅ Stan Wyszukiwania
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const data = await surveyService.getActiveRooms({ 
                    page, 
                    size: 10, 
                    sort: 'createdAt,desc',
                    search: debouncedSearch // ✅ Przekazujemy parametr
                });
                setRooms(data.content);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać listy aktywnych ankiet.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [page, debouncedSearch]); // Odświeżamy przy zmianie searcha

    // Reset strony po wyszukaniu
    useEffect(() => { setPage(0); }, [debouncedSearch]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    return (
        <Box>
            {/* ✅ SEKCJA WYSZUKIWANIA */}
            <Box mb={3}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Szukaj ankiety po nazwie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : rooms.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <MeetingRoomIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                        {search ? "Nie znaleziono ankiet o tej nazwie." : "Brak aktywnych ankiet w tym momencie."}
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {rooms.map((room) => (
                        <Paper 
                            key={room.roomId} 
                            elevation={2} 
                            sx={{ 
                                p: 2, 
                                borderLeft: '6px solid #4caf50', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight="bold">{room.surveyTitle}</Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <Chip 
                                        icon={<PersonIcon />} 
                                        label={`${room.currentParticipants} / ${room.maxParticipants || '∞'}`} 
                                        size="small" 
                                        variant="outlined" 
                                    />
                                    {/* Opcjonalnie ID */}
                                </Stack>
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => navigate(`/survey/join/${room.roomId}`)}
                            >
                                Join
                            </Button>
                        </Paper>
                    ))}
                </Stack>
            )}

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
        </Box>
    );
};