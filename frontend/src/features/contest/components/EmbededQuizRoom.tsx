import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, TextField, InputAdornment, IconButton, Chip, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useQuizRoomSocket } from '@/features/quiz/hooks/useQuizRoomSocket';
import { quizService } from '@/features/quiz/api/quizService';
import { QuizRoomStatus } from '@/features/quiz/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

// Widoki
import { QuizLobby } from '@/features/quiz/components/QuizLobby';
import { QuizGameView } from '@/features/quiz/components/QuizGameView';
import { QuizResultView } from '@/features/quiz/components/QuizResultView';

interface Props {
    roomId: string;
    ticket?: string | null;       // ✅ Bilet wstępu (JWT) przekazany z ContestLivePage
    isHost: boolean;
    currentUserNickname?: string; // Nazwa gracza
    onGameEnd?: () => void;
}

export const EmbeddedQuizRoom: React.FC<Props> = ({ 
    roomId, ticket, isHost, currentUserNickname, onGameEnd 
}) => {
    // 1. Hook Logiki Biznesowej (Socket + State)
    const { 
        status, 
        currentQuestion, 
        participantsCount, 
        leaderboard, 
        finalResults, 
        error 
    } = useQuizRoomSocket(roomId);
    
    const { showError, showSuccess } = useSnackbar();
    
    const [hasJoined, setHasJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(true);

    // 2. ✅ AUTOMATYCZNE DOŁĄCZENIE (Z użyciem Tokena)
    // To tutaj następuje "realizacja biletu".
    useEffect(() => {
        let mounted = true;

        const performJoin = async () => {
            // Jeśli już dołączyliśmy w tej sesji komponentu, nie rób tego ponownie
            if (hasJoined) {
                setIsJoining(false);
                return;
            }

            try {
                // Jeśli nie mamy nicku, użyjemy domyślnego
                // W konkursie user jest zalogowany, więc backend Quizu i tak weźmie ID z tokena Auth,
                // ale 'ticket' jest potrzebny, żeby przejść autoryzację wejścia do prywatnego pokoju.
                const nick = currentUserNickname || (isHost ? "HOST" : "Uczestnik");
                
                console.log(`[EmbeddedQuiz] Attempting join room ${roomId} with ticket: ${ticket ? 'PRESENT' : 'MISSING'}`);

                // 🔥 KLUCZOWY MOMENT: Wysyłamy token do API Quizu
                await quizService.joinRoom(roomId, nick, ticket || undefined);
                
                if (mounted) setHasJoined(true);
            } catch (e: any) {
                // Ignorujemy błąd, jeśli user już jest w pokoju (idempotentność backendu)
                if (e.response?.status === 409) { 
                   console.log("User already in room, connecting socket...");
                   if (mounted) setHasJoined(true);
                } else {
                   console.error("Join error:", e);
                   showError("Problem z dołączeniem do gry.");
                }
            } finally {
                if (mounted) setIsJoining(false);
            }
        };

        if (roomId) {
            performJoin();
        }
        
        return () => { mounted = false; };
    }, [roomId, ticket, isHost, currentUserNickname, hasJoined]);

    // --- HANDLERY GRY (Reszta bez zmian) ---

    const handleStartGame = async () => {
        if (!isHost) return;
        try {
            await quizService.startQuiz(roomId);
        } catch (e) {
            showError("Błąd startu quizu.");
        }
    };

    const handleSubmitAnswer = async (optionId: number) => {
        if (!currentQuestion) return;
        try {
            // @ts-ignore
            const qId = currentQuestion.questionId || currentQuestion.id;
            await quizService.submitAnswer(roomId, qId, optionId);
        } catch (e) {
            // Cicha porażka (np. po czasie)
        }
    };

    const handleNextQuestion = async () => {
        if (!isHost) return;
        await quizService.nextQuestion(roomId);
    };
    
    const handleFinishQuestion = async () => {
        if (!isHost) return;
        await quizService.finishQuestionManually(roomId);
    };

    const handleCloseRoom = async () => {
        if (!isHost) return;
        if(window.confirm("Zamknąć pokój quizu?")) {
            await quizService.closeRoom(roomId);
            if (onGameEnd) onGameEnd();
        }
    };

    // Link do udostępnienia (tylko dla hosta do wglądu)
    const joinUrl = `${window.location.origin}/quiz/join/${roomId}`;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(joinUrl);
        showSuccess("Link skopiowany!");
    };

    // --- RENDEROWANIE STANU ---

    if (error) {
        return (
            <Box p={4} textAlign="center">
                <Alert severity="error">Stan gry: {error}</Alert>
            </Box>
        );
    }

    if (isJoining && !status) {
        return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />;
    }

    return (
        <Box 
            sx={{ 
                width: '100%', 
                minHeight: 500, 
                bgcolor: 'background.default', 
                borderRadius: 3, 
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* 1. LOBBY */}
            {status === QuizRoomStatus.LOBBY && (
                <Box>
                    {/* Pasek z linkiem widoczny tylko dla Hosta w Lobby - opcjonalnie */}
                    {isHost && (
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography variant="caption" color="text.secondary">ID Sesji:</Typography>
                                <Chip label={roomId} size="small" />
                            </Stack>
                        </Box>
                    )}

                    <QuizLobby isHost={isHost} roomId={roomId} participants={leaderboard} onStart={handleStartGame} />
                </Box>
            )}

            {/* 2. GRA */}
            {status === QuizRoomStatus.QUESTION_ACTIVE && currentQuestion && (
                <QuizGameView 
                    question={currentQuestion as any} isHost={isHost}
                    onSubmitAnswer={handleSubmitAnswer} onFinishEarly={handleFinishQuestion}
                />
            )}

            {/* 3. WYNIKI POŚREDNIE */}
            {status === QuizRoomStatus.QUESTION_FINISHED && (
                <QuizResultView 
                    status={status} isHost={isHost} leaderboard={leaderboard}
                    onNext={handleNextQuestion} onClose={handleCloseRoom}
                />
            )}

            {/* 4. KONIEC */}
            {status === QuizRoomStatus.FINISHED && (
                <QuizResultView 
                    status={status} isHost={isHost} leaderboard={finalResults?.leaderboard || leaderboard}
                    onNext={() => {}} onClose={onGameEnd || (() => {})} 
                />
            )}
        </Box>
    );
};