import { useState, useEffect, useCallback, useRef } from 'react';
import { quizSocket } from '../api/quizSocket';
import { quizService } from '../api/quizService';
import { 
    type QuizSocketMessage, 
    type QuizUserJoinedMessage,
    type QuizNewQuestionMessage,
    type QuizQuestionFinishedMessage,
    type QuizLeaderboardMessage,
    type QuizRoomClosedMessage,
    type FinalRoomResultDto,
    type LeaderboardEntryDto
} from '../model/socket.types';
import { QuizRoomStatus, type WSMessage } from '../model/types';

export interface SocketOptionDto {
    id: number;
    text: string;
}

interface QuizRoomState {
    status: QuizRoomStatus;
    currentQuestion: {
        questionId: number;
        index: number;
        title: string;
        options: SocketOptionDto[];
        timeLimit: number;
        endTime: number;
    } | null;
    correctOptionId: number | null;
    leaderboard: LeaderboardEntryDto[];
    finalResults: FinalRoomResultDto | null;
    
    participantsCount: number;
    error: string | null;
    isLoading: boolean;
}

export const useQuizRoomSocket = (roomId: string) => {
    const [state, setState] = useState<QuizRoomState>({
        status: QuizRoomStatus.LOBBY,
        currentQuestion: null,
        correctOptionId: null,
        leaderboard: [],
        finalResults: null,
        participantsCount: 0,
        error: null,
        isLoading: true,
    });

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        if (!roomId) return;

        const fetchState = async () => {
            try {
                const details = await quizService.getRoomDetails(roomId);
                
                if (isMounted.current) {
                    
                    const mappedLeaderboard = details.currentResults?.leaderboard?.map((entry: any) => ({
                        userId: entry.userId,
                        nickname: entry.username || entry.nickname || "Unknown",
                        score: entry.score,
                        rank: entry.rank
                    })) || [];

                    let initialQuestion = null;
                    if (details.currentQuestion) {
                         const q = details.currentQuestion;
                         const endTime = new Date(q.startTime).getTime() + (q.timeLimitSeconds * 1000);
                         
                         initialQuestion = {
                            questionId: q.questionId,
                             index: q.questionIndex,
                             title: q.title,
                             options: q.options as unknown as SocketOptionDto[],
                             timeLimit: q.timeLimitSeconds,
                             endTime: endTime
                         };
                    }

                    setState(prev => ({
                        ...prev,
                        status: details.status,
                        participantsCount: details.currentParticipants,
                        leaderboard: mappedLeaderboard, 
                        finalResults: details.currentResults, 
                        currentQuestion: initialQuestion, 
                        isLoading: false 
                    }));
                }
            } catch (e) {
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: "Błąd pobierania pokoju", isLoading: false }));
                }
            }
        };
        fetchState();
        
        return () => { isMounted.current = false; };
    }, [roomId]);


    const handleMessage = useCallback((message: WSMessage) => {
        const payload = message as QuizSocketMessage;
        console.log("🎮 Quiz Event:", payload.event, payload);

        switch (payload.event) {
            case 'USER_JOINED':
                setState(prev => {
                    const pMsg = payload as QuizUserJoinedMessage;
                    const exists = prev.leaderboard.some(u => u.userId === pMsg.userId);
                    
                    if (exists) {
                        return { ...prev, participantsCount: pMsg.newParticipantCount };
                    }

                    return {
                        ...prev,
                        participantsCount: pMsg.newParticipantCount,
                        leaderboard: [
                            ...prev.leaderboard, 
                            { 
                                userId: pMsg.userId, 
                                nickname: pMsg.username, 
                                score: 0, 
                                rank: 0 
                            }
                        ]
                    };
                });
                break;

            case 'QUIZ_STARTED':
                setState(prev => ({ ...prev, status: QuizRoomStatus.QUESTION_ACTIVE }));
                break;

            case 'NEW_QUESTION':
                const qMsg = payload as QuizNewQuestionMessage;
                const startTime = new Date(qMsg.startTime).getTime();
                const endTime = startTime + (qMsg.timeLimitSeconds * 1000);

                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.QUESTION_ACTIVE,
                    correctOptionId: null,
                    currentQuestion: {
                        questionId: qMsg.questionId,
                        index: qMsg.questionIndex,
                        title: qMsg.title,
                        options: qMsg.options as unknown as SocketOptionDto[], 
                        timeLimit: qMsg.timeLimitSeconds,
                        endTime: endTime
                    }
                }));
                break;

            case 'QUESTION_FINISHED':
                const fMsg = payload as QuizQuestionFinishedMessage;
                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.QUESTION_FINISHED,
                    correctOptionId: fMsg.correctOptionId
                }));
                break;

            case 'LEADERBOARD_UPDATE':
                const lMsg = payload as QuizLeaderboardMessage;
                setState(prev => ({
                    ...prev,
                    leaderboard: lMsg.topPlayers
                }));
                break;

            case 'ROOM_CLOSED':
                const cMsg = payload as QuizRoomClosedMessage;
                setState(prev => ({
                    ...prev,
                    status: QuizRoomStatus.FINISHED,
                    finalResults: cMsg.finalResults
                }));
                break;
        }
    }, []);

    useEffect(() => {
        if (!roomId) return;

        let subscriptionId: string | null = null;
        let timeoutId: any;

        const connectLoop = () => {
            if (!isMounted.current) return;

            if (quizSocket.isConnected()) {
                subscriptionId = quizSocket.subscribeToRoomUpdates(roomId, handleMessage);
            } else {
                timeoutId = setTimeout(connectLoop, 500);
            }
        };
        
        connectLoop();

        return () => {
            clearTimeout(timeoutId);
            if (subscriptionId) {
                quizSocket.unsubscribe(subscriptionId);
            }
        };
    }, [roomId, handleMessage]);

    return state;
};