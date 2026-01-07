import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizSocket } from '@/features/quiz/api/quizSocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

interface InviteMessage {
    roomId: string;
    title: string;
    invitationToken: string;
}

export const useQuizInviteListener = (config: { autoRedirect?: boolean } = {}) => {
    const { currentUserId } = useAuth();
    const { showSuccess } = useSnackbar();
    const { addNotification } = useNotificationCenter();
    const navigate = useNavigate();
    const { autoRedirect = false } = config;

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        if (!currentUserId) return;
        
        let subscriptionId: string | null = null;
        let retryTimeout: any;

        const tryToSubscribe = () => {
            if (!isMounted.current) return;

            if (quizSocket.isConnected()) {
                subscriptionId = quizSocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as InviteMessage;
                    
                    const joinUrl = `/quiz/join/${invite.roomId}?ticket=${invite.invitationToken}`;

                    console.log(`[Quiz] Received invitation to: ${invite.title}`);

                    addNotification({
                        type: 'QUIZ',
                        title: 'Quiz Invitation',
                        message: `You have been invited to join the game: "${invite.title}"`,
                        actionUrl: joinUrl
                    });

                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`New quiz invitation: "${invite.title}"`);
                    }
                });
            } else {
                retryTimeout = setTimeout(tryToSubscribe, 1000);
            }
        };

        tryToSubscribe();

        return () => {
            isMounted.current = false;
            clearTimeout(retryTimeout);
            
            if (subscriptionId) {
                quizSocket.unsubscribe(subscriptionId);
            }
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess, addNotification]);
};