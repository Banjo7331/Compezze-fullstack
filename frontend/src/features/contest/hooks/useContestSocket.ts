import { useEffect, useCallback, useRef } from 'react';
import { contestSocket } from '../api/contestSocket';
import type { ContestSocketMessage } from '../model/socket.types'; 

interface UseContestSocketProps {
    contestId: string | undefined;
    onRefresh: () => void;
}

export const useContestSocket = ({ contestId, onRefresh }: UseContestSocketProps) => {
    const isMounted = useRef(false);

    const handleMessage = useCallback((message: ContestSocketMessage) => {
        console.log("🏆 Contest Socket Event:", message.event, message);

        switch (message.event) {
            case 'STAGE_CHANGED':
            case 'CONTEST_FINISHED':
                // Zmiana etapu -> Odświeżenie danych REST w Page
                onRefresh();
                break;

            case 'PARTICIPANT_JOINED':
                console.log(`User ${message.displayName} joined.`);
                break;

            case 'VOTE_RECORDED':
            case 'SUBMISSION_PRESENTED':
                // Tutaj miejsce na przyszłą logikę
                break;
        }
    }, [onRefresh]);

    useEffect(() => {
        isMounted.current = true;
        if (!contestId) return;

        let subscriptionId: string | null = null;
        let timeoutId: any;

        const connectLoop = () => {
            if (!isMounted.current) return;

            if (contestSocket.isConnected()) {
                console.log(`Subscribing to contest: ${contestId}`);
                subscriptionId = contestSocket.subscribeToContest(contestId, handleMessage);
            } else {
                contestSocket.connectAndSubscribe(); 
                timeoutId = setTimeout(connectLoop, 500);
            }
        };

        connectLoop();

        return () => {
            isMounted.current = false;
            clearTimeout(timeoutId);
            if (subscriptionId) {
                contestSocket.unsubscribe(subscriptionId);
            }
        };
    }, [contestId, handleMessage]);
};