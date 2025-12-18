import React, { useState, useMemo, useEffect } from 'react'
import { 
    Typography, TextField, Box, Stack, Card, CardContent, 
    IconButton, MenuItem, Select, FormControl, InputLabel, 
    Grid, Paper, CircularProgress, Divider, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PollIcon from '@mui/icons-material/Poll';
import GavelIcon from '@mui/icons-material/Gavel';
import PublicIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';
import { debounce } from '@mui/material/utils';

import { Button } from '@/shared/ui/Button';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { contestService } from '../api/contestService';
import { 
    ContestCategory, SubmissionMediaPolicy, StageType, JuryRevealMode,
    type CreateContestRequest, type StageRequest 
} from '../model/types';

import { quizService } from '@/features/quiz/api/quizService';
import { surveyService } from '@/features/survey/api/surveyService';

interface StageDraft {
    tempId: number;
    name: string;
    type: StageType;
    durationMinutes: number;
    
    referenceId?: number;
    weight?: number;
    maxScore?: number;
    maxParticipants?: number;
    timePerQuestion?: number;
    showJudgeNames?: boolean;
    juryRevealMode?: JuryRevealMode;
}

interface ContestCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export const ContestCreateForm: React.FC<ContestCreateFormProps> = ({ onCancel, onSuccess }) => {
    const { showSuccess, showError } = useSnackbar();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<ContestCategory>('Other');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [participantLimit, setParticipantLimit] = useState<string>('100');
    const [isPrivate, setIsPrivate] = useState(false);
    const [mediaPolicy, setMediaPolicy] = useState<SubmissionMediaPolicy>('BOTH');
    
    const [resourceOptions, setResourceOptions] = useState<{id: number, title: string}[]>([]);
    const [isSearchingResource, setIsSearchingResource] = useState(false)

    const [selectedResource, setSelectedResource] = useState<{id: number, title: string} | null>(null);

    const [stages, setStages] = useState<StageDraft[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [newStage, setNewStage] = useState<StageDraft>({
        tempId: 0, name: '', type: 'QUIZ', durationMinutes: 30, 
        weight: 1.0, maxParticipants: 100, maxScore: 10, timePerQuestion: 30,
        juryRevealMode: 'IMMEDIATE', showJudgeNames: true, referenceId: 0
    });

    const moveStage = (index: number, direction: -1 | 1) => {
        const newStages = [...stages];
        const temp = newStages[index];
        newStages[index] = newStages[index + direction];
        newStages[index + direction] = temp;
        setStages(newStages);
    };

    const removeStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    const fetchResources = useMemo(
        () =>
            debounce(async (input: string, type: string, callback: (results: any[]) => void) => {
                try {
                    let results: any[] = [];
                    if (type === 'QUIZ') {
                        results = await quizService.searchForms(input);
                    } else if (type === 'SURVEY') {
                        results = await surveyService.searchForms(input);
                    }
                    callback(results);
                } catch (e) {
                    callback([]);
                }
            }, 400),
        [],
    );

    const handleOpenAddStage = () => {
        setNewStage({
            tempId: Date.now(),
            name: '',
            type: 'QUIZ',
            durationMinutes: 30,
            weight: 1.0,
            maxParticipants: 100,
            maxScore: 10,
            timePerQuestion: 30,
            juryRevealMode: 'IMMEDIATE',
            showJudgeNames: true,
            referenceId: 0
        });
        setSelectedResource(null);
        setResourceOptions([]);
        setIsStageDialogOpen(true);
    };

    const handleResourceSearch = (event: any, newInputValue: string) => {
        if (newInputValue === '') {
            setResourceOptions([]);
            return;
        }
        setIsSearchingResource(true);
        
        fetchResources(newInputValue, newStage.type, (results) => {
            const options = results.map(r => ({
                id: r.id || r.surveyFormId,
                title: r.title
            }));
            setResourceOptions(options);
            setIsSearchingResource(false);
        });
    };

    const handleTypeChange = (e: any) => {
        const type = e.target.value as any;
        setNewStage({ ...newStage, type: type, referenceId: 0 });
        setSelectedResource(null);
        setResourceOptions([]);
    };

    const handleAddStageConfirm = () => {
        if (!newStage.name) { showError("Nazwa etapu wymagana"); return; }
        if (!newStage.durationMinutes || newStage.durationMinutes < 1) { showError("Czas trwania musi być > 0"); return; }
        
        if (newStage.type === 'QUIZ' && !newStage.referenceId) { showError("Podaj ID Szablonu Quizu"); return; }
        if (newStage.type === 'SURVEY' && !newStage.referenceId) { showError("Podaj ID Szablonu Ankiety"); return; }

        setStages([...stages, { ...newStage, tempId: Date.now() }]);
        setIsStageDialogOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (stages.length === 0) { showError("Dodaj przynajmniej jeden etap."); return; }
        if (!name || !startDate || !endDate) { showError("Uzupełnij wymagane pola."); return; }
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            showError("Data zakończenia musi być późniejsza niż data rozpoczęcia.");
            return;
        }

        setIsSubmitting(true);

        const mappedStages: StageRequest[] = stages.map((s) => {
            const base = { name: s.name, durationMinutes: s.durationMinutes };
            
            switch (s.type) {
                case 'QUIZ': 
                    return { 
                        ...base, type: 'QUIZ', 
                        quizFormId: Number(s.referenceId), 
                        weight: Number(s.weight), 
                        maxParticipants: Number(s.maxParticipants), 
                        timePerQuestion: Number(s.timePerQuestion) 
                    };
                case 'SURVEY': 
                    return { 
                        ...base, type: 'SURVEY', 
                        surveyFormId: Number(s.referenceId), 
                        maxParticipants: Number(s.maxParticipants) 
                    };
                case 'JURY_VOTE': 
                    return { 
                        ...base, type: 'JURY_VOTE', 
                        weight: Number(s.weight), 
                        maxScore: Number(s.maxScore), 
                        juryRevealMode: s.juryRevealMode!, 
                        showJudgeNames: !!s.showJudgeNames 
                    };
                case 'PUBLIC_VOTE': 
                    return { 
                        ...base, type: 'PUBLIC_VOTE', 
                        weight: Number(s.weight), 
                        maxScore: Number(s.maxScore) 
                    };
                default: 
                    return { ...base, type: 'GENERIC' };
            }
        });

        const payload: CreateContestRequest = {
            name, 
            description, 
            location,
            contestCategory: category,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            participantLimit: participantLimit ? Number(participantLimit) : undefined,
            isPrivate,
            hasPreliminaryStage: false,
            submissionMediaPolicy: mediaPolicy,
            templateId: "default-template",
            stages: mappedStages
        };

        try {
            await contestService.createContest(payload);
            showSuccess("Konkurs utworzony pomyślnie!");
            onSuccess();
        } catch (e) {
            showError("Błąd tworzenia konkursu. Sprawdź dane.");
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStageIcon = (type: string) => {
        switch (type) {
            case 'QUIZ': return <SportsEsportsIcon color="warning" />;
            case 'SURVEY': return <PollIcon color="info" />;
            case 'JURY_VOTE': return <GavelIcon color="error" />;
            case 'PUBLIC_VOTE': return <PublicIcon color="success" />;
            default: return <CategoryIcon color="disabled" />;
        }
    };

    return (
        <Card component={Paper} elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mt: 4 }}>
            <CardContent>
                <Typography variant="h4" gutterBottom fontWeight="bold">Kreator Konkursu</Typography>
                
                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Informacje Podstawowe</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <TextField label="Nazwa Konkursu" fullWidth required value={name} onChange={e => setName(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Kategoria</InputLabel>
                                        <Select value={category} label="Kategoria" onChange={e => setCategory(e.target.value as any)}>
                                            {Object.keys(ContestCategory).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField label="Opis" multiline rows={3} fullWidth required value={description} onChange={e => setDescription(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Start Data" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Koniec Data" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField label="Limit uczestników" type="number" fullWidth value={participantLimit} onChange={e => setParticipantLimit(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Dozwolone Media</InputLabel>
                                        <Select 
                                            value={mediaPolicy} 
                                            label="Dozwolone Media" 
                                            onChange={e => setMediaPolicy(e.target.value as any)}
                                        >
                                            <MenuItem value="BOTH">Zdjęcia i Wideo</MenuItem>
                                            <MenuItem value="IMAGES_ONLY">Tylko Zdjęcia</MenuItem>
                                            <MenuItem value="VIDEOS_ONLY">Tylko Wideo</MenuItem>
                                            <MenuItem value="NONE">Brak</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControlLabel control={<Switch checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />} label="Konkurs Prywatny" />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Etapy ({stages.length})</Typography>
                                <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddStage}>
                                    Dodaj Etap
                                </Button>
                            </Box>

                            <Stack spacing={2}>
                                {stages.map((stage, index) => (
                                    <Card key={stage.tempId} variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '25%' }}>
                                            <Chip label={`#${index + 1}`} color="primary" size="small" />
                                            {getStageIcon(stage.type)}
                                            <Typography fontWeight="bold">{stage.type}</Typography>
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1">{stage.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {stage.durationMinutes} min
                                                {stage.type === 'QUIZ' && ` • Quiz ID: ${stage.referenceId}`}
                                                {stage.type === 'SURVEY' && ` • Survey ID: ${stage.referenceId}`}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row">
                                            <IconButton size="small" onClick={() => moveStage(index, -1)} disabled={index === 0}><ArrowUpwardIcon /></IconButton>
                                            <IconButton size="small" onClick={() => moveStage(index, 1)} disabled={index === stages.length - 1}><ArrowDownwardIcon /></IconButton>
                                            <IconButton color="error" onClick={() => removeStage(index)}><DeleteIcon /></IconButton>
                                        </Stack>
                                    </Card>
                                ))}
                                {stages.length === 0 && <Typography align="center" color="text.secondary">Brak etapów.</Typography>}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={onCancel} color="inherit">Anuluj</Button>
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20}/> : <SaveIcon />}>
                                {isSubmitting ? 'Tworzenie...' : 'Utwórz Konkurs'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>

                <Dialog open={isStageDialogOpen} onClose={() => setIsStageDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Dodaj Nowy Etap</DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField label="Nazwa Etapu" fullWidth value={newStage.name} onChange={e => setNewStage({...newStage, name: e.target.value})} />
                            
                            <FormControl fullWidth>
                                <InputLabel>Typ Etapu</InputLabel>
                                <Select 
                                    value={newStage.type} 
                                    label="Typ Etapu"
                                    onChange={handleTypeChange}
                                >
                                    <MenuItem value="QUIZ">Quiz (Gra na żywo)</MenuItem>
                                    <MenuItem value="SURVEY">Ankieta (Opinie)</MenuItem>
                                    <MenuItem value="JURY_VOTE">Głosowanie Jury</MenuItem>
                                    <MenuItem value="PUBLIC_VOTE">Głosowanie Publiczne</MenuItem>
                                    <MenuItem value="GENERIC">Inne</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Czas trwania (min)" type="number" fullWidth value={newStage.durationMinutes} onChange={e => setNewStage({...newStage, durationMinutes: Number(e.target.value)})} />
                            
                            {(newStage.type === 'QUIZ' || newStage.type === 'SURVEY') && (
                                <Autocomplete
                                    options={resourceOptions}
                                    getOptionLabel={(option) => option.title}
                                    filterOptions={(x) => x}
                                    value={selectedResource}
                                    
                                    onChange={(event: any, newValue: any | null) => {
                                        setSelectedResource(newValue);
                                        setNewStage({ ...newStage, referenceId: newValue ? newValue.id : 0 });
                                    }}
                                    
                                    onInputChange={handleResourceSearch}
                                    
                                    loading={isSearchingResource}
                                    noOptionsText="Wpisz nazwę, aby wyszukać..."
                                    
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={newStage.type === 'QUIZ' ? "Wyszukaj Quiz" : "Wyszukaj Ankietę"}
                                            helperText="Wpisz nazwę szablonu, aby go znaleźć"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {isSearchingResource ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            )}
                            
                            {newStage.type === 'QUIZ' && (
                                <>
                                    <Stack direction="row" spacing={2}>
                                        <TextField label="Czas/Pytanie (s)" type="number" fullWidth value={newStage.timePerQuestion} onChange={e => setNewStage({...newStage, timePerQuestion: Number(e.target.value)})} />
                                        <TextField label="Limit graczy" type="number" fullWidth value={newStage.maxParticipants} onChange={e => setNewStage({...newStage, maxParticipants: Number(e.target.value)})} />
                                    </Stack>
                                    <TextField label="Waga punktów" type="number" fullWidth value={newStage.weight} onChange={e => setNewStage({...newStage, weight: Number(e.target.value)})} />
                                </>
                            )}

                            {newStage.type === 'SURVEY' && (
                                <TextField 
                                    label="Limit uczestników" type="number" fullWidth 
                                    value={newStage.maxParticipants} 
                                    onChange={e => setNewStage({...newStage, maxParticipants: Number(e.target.value)})} 
                                />
                            )}

                            {(newStage.type === 'JURY_VOTE' || newStage.type === 'PUBLIC_VOTE') && (
                                <Stack direction="row" spacing={2}>
                                    <TextField label="Max Ocena" type="number" fullWidth value={newStage.maxScore} onChange={e => setNewStage({...newStage, maxScore: Number(e.target.value)})} />
                                    <TextField label="Waga Etapu" type="number" fullWidth value={newStage.weight} onChange={e => setNewStage({...newStage, weight: Number(e.target.value)})} />
                                </Stack>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsStageDialogOpen(false)}>Anuluj</Button>
                        <Button variant="contained" onClick={handleAddStageConfirm}>Dodaj</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};