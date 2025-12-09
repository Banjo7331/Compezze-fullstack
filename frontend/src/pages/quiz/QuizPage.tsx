import React from 'react';
import { 
    Typography, Container, Box, Paper, Grid 
} from '@mui/material';
import type { ButtonProps } from '@mui/material'; 
import AddIcon from '@mui/icons-material/Add';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Button } from '@/shared/ui/Button'; 
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom'; 

import { QuizActiveRoomsList } from '@/features/quiz/components/QuizActiveRoomList';
import { QuizFeaturedTemplatesWidget } from '@/features/quiz/components/QuizFeaturedTemplatesWidget';

const QuizPage: React.FC = () => {
    const LinkButton = Button as React.ComponentType<ButtonProps & Pick<LinkProps, 'to'>>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                        <SportsEsportsIcon sx={{ fontSize: 50, verticalAlign: 'middle', mr: 2 }} />
                        Centrum Quizów
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Rywalizuj na żywo, zdobywaj punkty i wygrywaj!
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper 
                            elevation={6} 
                            sx={{ 
                                p: 4, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: '#fff3e0', 
                                borderRadius: 3,
                                minHeight: 300 
                            }}
                        >
                            <AddIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                            <Typography variant="h4" component="h2" align="center" sx={{ mb: 1 }}>
                                Nowy Quiz
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                                Stwórz grę z pytaniami na czas i punktami.
                            </Typography>
                            <LinkButton 
                                variant="contained"
                                color="warning"
                                size="large"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/quiz/create"
                            >
                                KREATOR QUIZU
                            </LinkButton>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                        <QuizFeaturedTemplatesWidget />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h4" gutterBottom sx={{ borderBottom: '1px solid #ddd', pb: 1, mb: 3, display: 'flex', alignItems: 'center' }}>
                                🎮 Dostępne Gry (Active Lobbies)
                            </Typography>
                            
                            <QuizActiveRoomsList />
                            
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Container>
    );
};

export default QuizPage;