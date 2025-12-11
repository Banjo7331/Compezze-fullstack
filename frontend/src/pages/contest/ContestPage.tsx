import React from 'react';
import { Typography, Container, Box, Paper, Grid } from '@mui/material';
import type { ButtonProps } from '@mui/material'; 
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Button } from '@/shared/ui/Button'; 
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom'; 

import { UpcomingContestWidget } from '@/features/contest/components/UpcomingContestWidget';
import { ContestPublicList } from '@/features/contest/components/ContestPublicList';

const ContestPage: React.FC = () => {
    const LinkButton = Button as React.ComponentType<ButtonProps & Pick<LinkProps, 'to'>>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <UpcomingContestWidget />
                
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="secondary">
                        <EmojiEventsIcon sx={{ fontSize: 50, verticalAlign: 'middle', mr: 2 }} />
                        Centrum Konkursów
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Dołącz do rywalizacji i wygrywaj!
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper 
                            elevation={6} 
                            sx={{ 
                                p: 4, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: '#f3e5f5',
                                borderRadius: 3,
                                minHeight: 200 
                            }}
                        >
                            <AddIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                            <Typography variant="h5" align="center" gutterBottom>
                                Organizator
                            </Typography>
                            <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                                Stwórz własny konkurs wieloetapowy.
                            </Typography>
                            <LinkButton 
                                variant="outlined"
                                color="secondary"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/contest/create"
                            >
                                UTWÓRZ NOWY
                            </LinkButton>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
                                🌍 Otwarte Zapisy
                            </Typography>
                            
                            <ContestPublicList />
                            
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Container>
    );
};

export default ContestPage;