// features/quiz/components/AllQuizTemplatesList.tsx

import React, { useEffect, useState } from 'react';
import { 
    Box, List, ListItem, ListItemText, ListItemButton, 
    CircularProgress, Alert, Pagination, TextField, InputAdornment, Typography 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';

import { quizService } from '../api/quizService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { GetQuizFormSummaryResponse } from '../model/types';
import { useNavigate } from 'react-router-dom';

export const AllQuizTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<GetQuizFormSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ✅ Wyszukiwarka
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await quizService.getAllForms({ 
                    page, 
                    size: 10, 
                    sort: 'title,asc',
                    search: debouncedSearch // ✅
                });
                setForms(data.content);
                setTotalPages(data.totalPages);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [page, debouncedSearch]);

    useEffect(() => { setPage(0); }, [debouncedSearch]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            {/* ✅ Pasek szukania wewnątrz modala */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Wpisz nazwę quizu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {forms.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Nie znaleziono quizów.</Typography>
                </Box>
            ) : (
                <List sx={{ p: 0 }}>
                    {forms.map((form) => (
                        <ListItem key={form.id} disablePadding divider>
                            <ListItemButton onClick={() => navigate(`/quiz/create/${form.id}`)}>
                                <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                                <ListItemText 
                                    primary={form.title} 
                                    secondary={form.isPrivate ? "Prywatny" : "Publiczny"} 
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} />
                </Box>
            )}
        </Box>
    );
};