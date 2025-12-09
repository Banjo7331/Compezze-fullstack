import React, { useState } from 'react';
import { 
    AppBar, Toolbar, Button, Box, Typography, 
    IconButton, Menu, MenuItem, Avatar, Tooltip,
    Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext'; 

const NavBar: React.FC = () => {
    const { isAuthenticated, logout, currentUser } = useAuth(); 
    const navigate = useNavigate();
    
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleProfileClick = () => {
        handleCloseUserMenu();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Contest', path: '/contest' },
        { label: 'Survey', path: '/survey' },
        { label: 'Quiz', path: '/quiz' },
    ];

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{ textDecoration: 'none', color: 'inherit', mr: 4, fontWeight: 'bold' }}
                >
                    Compezze Platform
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            component={Link}
                            to={item.path}
                            sx={{ 
                                color: '#fff', 
                                textTransform: 'uppercase',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                    {isAuthenticated ? (
                        <>
                            <Tooltip title="Otwórz ustawienia">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        <PersonIcon />
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem disabled>
                                    <Typography textAlign="center" variant="caption">
                                        Zalogowany jako: <strong>{currentUser?.username}</strong>
                                    </Typography>
                                </MenuItem>
                                
                                <Divider />
                                
                                <MenuItem onClick={handleProfileClick}>
                                    <Typography textAlign="center">Mój Profil</Typography>
                                </MenuItem>
                                
                                <MenuItem onClick={handleLogout}>
                                    <Typography textAlign="center" color="error">Wyloguj</Typography>
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" component={Link} to="/login">
                                Zaloguj
                            </Button>
                            <Button 
                                color="secondary" 
                                variant="contained" 
                                component={Link} 
                                to="/register"
                            >
                                Rejestracja
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;