import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SurveyFormList } from './SurveyFormList'; 

interface AllTemplatesDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AllFormsDialog: React.FC<AllTemplatesDialogProps> = ({ open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    minHeight: '50vh'
                }
            }}
        >
            <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                    Wszystkie Szablony
                </Typography>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <SurveyFormList />
            </DialogContent>
        </Dialog>
    );
};