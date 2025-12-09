import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    CircularProgress, 
    Alert,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService';
import { useNavigate } from 'react-router-dom';
import { useSurveyRoomSocket } from '../hooks/useSurveyRoomSocket';

interface RoomControlPanelProps {
    roomId: string;
    onCloseSuccess: () => void; 
}

export const RoomControlPanel: React.FC<RoomControlPanelProps> = ({ roomId, onCloseSuccess }) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    
    const { isRoomOpen, liveResults } = useSurveyRoomSocket(roomId); 

    const handleCloseRoom = async () => {
        if (!window.confirm("Are you sure you want to close this room? No more submissions will be accepted.")) {
            return;
        }

        setIsClosing(true);
        try {
            await surveyService.closeRoom(roomId);
            
            onCloseSuccess(); 
            
        } catch (error) {
            console.error("Error closing room:", error);
            alert("Failed to close the room. Check if you are the host.");
        } finally {
            setIsClosing(false);
        }
    };

    
    return (
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedUserIcon color="action" sx={{ mr: 1 }} /> Room Controls
            </Typography>
            <Box sx={{ my: 2 }}>
                 <Alert severity={isRoomOpen ? "success" : "warning"}>
                    Current Status: 
                    {isRoomOpen ? (
                        <Typography component="span" fontWeight="bold"> OPEN</Typography>
                    ) : (
                        <Typography component="span" fontWeight="bold"> CLOSED</Typography>
                    )}
                </Alert>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={isClosing ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                    onClick={handleCloseRoom}
                    disabled={!isRoomOpen || isClosing}
                    sx={{ flex: 1 }}
                >
                    {isClosing ? 'Closing...' : 'Close Room'}
                </Button>
                
                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/survey')}
                    disabled={isClosing}
                    sx={{ flex: 1 }}
                >
                    Back to Forms
                </Button>
            </Stack>
            
            {!isRoomOpen && (
                 <Alert severity="info" sx={{ mt: 2 }}>
                    Room is closed. Final results are displayed below.
                 </Alert>
            )}
        </Paper>
    );
};