import React, { useState } from 'react';
import { 
    Box, Fab, Badge, Popover, Typography, List, ListItem, 
    ListItemText, IconButton, Tabs, Tab, Divider, Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import PollIcon from '@mui/icons-material/Poll';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';

import { 
    useNotificationCenter, 
    type NotificationType,
    type AppNotification
} from '@/app/providers/NotificationProvider';

export const NotificationCenter: React.FC = () => {
    const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotificationCenter();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [tabValue, setTabValue] = useState<string>('ALL');
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const filteredNotifications = notifications.filter((n) => {
        if (tabValue === 'ALL') return true;
        return n.type === tabValue;
    });

    const handleAction = (notif: AppNotification) => {
        markAsRead(notif.id);
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
            handleClose();
        }
    };

    const getIcon = (type: NotificationType) => {
        switch(type) {
            case 'SURVEY': return <PollIcon color="primary"/>;
            case 'CONTEST': return <EmojiEventsIcon color="warning"/>;
            case 'QUIZ': return <QuizIcon color="secondary"/>;
            default: return <NotificationsIcon />;
        }
    };

    return (
        <>
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
                <Badge badgeContent={unreadCount} color="error">
                    <Fab color="primary" aria-label="notifications" onClick={handleClick}>
                        <NotificationsIcon />
                    </Fab>
                </Badge>
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                PaperProps={{ sx: { width: 360, maxHeight: 500, display: 'flex', flexDirection: 'column' } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Powiadomienia</Typography>
                    {notifications.length > 0 && (
                        <Button size="small" onClick={clearAll} color="inherit">Wyczyść</Button>
                    )}
                </Box>
                <Divider />

                <Tabs 
                    value={tabValue} 
                    onChange={(_, v) => setTabValue(v)} 
                    variant="fullWidth" 
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ minHeight: 40 }}
                >
                    <Tab label="All" value="ALL" />
                    <Tab icon={<EmojiEventsIcon fontSize="small"/>} value="CONTEST" />
                    <Tab icon={<PollIcon fontSize="small"/>} value="SURVEY" />
                    <Tab icon={<QuizIcon fontSize="small"/>} value="QUIZ" />
                </Tabs>

                <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                    {filteredNotifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            Brak powiadomień w tej sekcji.
                        </Box>
                    ) : (
                        filteredNotifications.map((notif) => (
                            <React.Fragment key={notif.id}>
                                <ListItem 
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => removeNotification(notif.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    }
                                    sx={{ 
                                        bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                                        cursor: notif.actionUrl ? 'pointer' : 'default'
                                    }}
                                >
                                    <Box sx={{ mt: 1, mr: 2 }}>{getIcon(notif.type)}</Box>
                                    
                                    <ListItemText
                                        primary={
                                            <Box onClick={() => handleAction(notif)}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {notif.title}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box component="span">
                                                <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                                                    {notif.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                                </Typography>
                                                {notif.actionUrl && (
                                                     <Button 
                                                        size="small" 
                                                        variant="outlined" 
                                                        sx={{ mt: 1, display: 'block' }}
                                                        onClick={() => handleAction(notif)}
                                                     >
                                                         Dołącz
                                                     </Button>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Popover>
        </>
    );
};