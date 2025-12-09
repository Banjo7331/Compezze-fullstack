import React from 'react';
import { Typography, Container, Box, Paper, Grid } from '@mui/material';
import type { ButtonProps } from '@mui/material'; 
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Button } from '@/shared/ui/Button'; 
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom'; 

import { UpcomingContestWidget } from '@/features/contest/components/UpcomingContestWidget';

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
                        Zarządzaj wieloetapowymi wydarzeniami.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper 
                            elevation={6} 
                            sx={{ 
                                p: 5, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: '#f3e5f5',
                                borderRadius: 3,
                                minHeight: 300 
                            }}
                        >
                            <AddIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
                            <Typography variant="h4" component="h2" align="center" sx={{ mb: 1 }}>
                                Nowy Konkurs
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
                                Zaplanuj quizy, ankiety i głosowania jury w jednym miejscu.
                            </Typography>
                            <LinkButton 
                                variant="contained"
                                color="secondary"
                                size="large"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/contest/create"
                                sx={{ px: 4, py: 1.5 }}
                            >
                                KREATOR KONKURSU
                            </LinkButton>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px dashed #ccc', pt: 4 }}>
                            <Typography variant="h5" color="text.disabled" gutterBottom>
                                🏆 Aktywne Wydarzenia
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                (Lista publicznych konkursów pojawi się tutaj wkrótce...)
                            </Typography>
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Container>
    );
};

export default ContestPage;