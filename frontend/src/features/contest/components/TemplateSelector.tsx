// features/contest/components/TemplateSelector.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, CardActionArea } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { contestService } from '@/features/contest/api/contestService';
import type { TemplateDto } from '@/features/contest/model/types';

interface Props {
    selectedKey: string | null; // Zmieniono z selectedUrl
    onSelect: (key: string) => void;
}

export const TemplateSelector: React.FC<Props> = ({ selectedUrl, onSelect }) => {
    const [templates, setTemplates] = useState<TemplateDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await contestService.getTemplates();
                setTemplates(data);
                // Opcjonalnie: wybierz pierwszy domyślnie, jeśli nic nie wybrano
                // if (data.length > 0 && !selectedUrl) onSelect(data[0].url);
            } catch (e) {
                console.error("Failed to load templates", e);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    if (loading) return <CircularProgress size={24} sx={{ my: 2 }} />;

    return (
        <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Wybierz tło konkursu:
            </Typography>
            
            <Grid container spacing={2}>
                {templates.map((tpl) => {
                    const isSelected = selectedUrl === tpl.url;
                    return (
                        <Grid item xs={6} sm={4} md={3} key={tpl.url}>
                            <Paper
                                elevation={isSelected ? 8 : 1}
                                sx={{
                                    position: 'relative',
                                    height: 100,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: isSelected ? '3px solid #1976d2' : '2px solid transparent',
                                    transition: '0.2s',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => onSelect(tpl.key)}
                                    sx={{ height: '100%', width: '100%' }}
                                >
                                    <img 
                                        src={tpl.url} 
                                        alt={tpl.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    
                                    {isSelected && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            bgcolor: 'rgba(25, 118, 210, 0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
                                        </Box>
                                    )}
                                </CardActionArea>
                            </Paper>
                            <Typography variant="caption" display="block" align="center" noWrap sx={{ mt: 0.5 }}>
                                {tpl.name}
                            </Typography>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};