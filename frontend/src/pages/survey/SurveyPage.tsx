import React from 'react';
import { 
    Typography, 
    Container, 
    Box, 
    Paper, 
    Grid, 
} from '@mui/material';
import type { ButtonProps } from '@mui/material'; 
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@/shared/ui/Button'; 
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom'; 

import { ActiveRoomsList } from '@/features/survey/components/ActiveRoomList';
import { FeaturedTemplatesWidget } from '@/features/survey/components/FeaturedFormsWidget';

const SurveyPage: React.FC = () => {
    const LinkButton = Button as React.ComponentType<ButtonProps & Pick<LinkProps, 'to'>>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 5 }}>
                    Centrum Ankiet
                </Typography>

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
                                backgroundColor: '#e3f2fd',
                                borderRadius: 2,
                                minHeight: 300
                            }}
                        >
                            <AddIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" component="h2" align="center" sx={{ mb: 1 }}>
                                Nowa Ankieta
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                                Zaprojektuj nowy formularz od zera.
                            </Typography>
                            <LinkButton 
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                component={Link}
                                to="/survey/create"
                            >
                                START KREATORA
                            </LinkButton>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                        <FeaturedTemplatesWidget />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h4" gutterBottom sx={{ borderBottom: '1px solid #ddd', pb: 1, mb: 3 }}>
                                🟢 Dostępne Pokoje (Active Rooms)
                            </Typography>
                            
                            <ActiveRoomsList />
                            
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Container>
    );
};

export default SurveyPage;