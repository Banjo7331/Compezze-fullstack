import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestSocket } from '@/features/contest/api/contestSocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

interface ContestInviteMessage {
    contestId: string;
    name: string;
    invitationToken: string;
}

export const useContestInviteListener = (config: { autoRedirect?: boolean } = {}) => {
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

            if (contestSocket.isConnected()) {
                
                subscriptionId = contestSocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as ContestInviteMessage;
                    
                    const joinUrl = `/contest/${invite.contestId}/join?ticket=${invite.invitationToken}`;

                    console.log(`[Contest] Received invitation to: ${invite.name}`);

                    addNotification({
                        type: 'CONTEST',
                        title: 'Contest Invitation',
                        message: `You have been invited to join: "${invite.name}"`,
                        actionUrl: joinUrl
                    });

                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`New contest invitation: "${invite.name}"`);
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
                contestSocket.unsubscribe(subscriptionId);
            }
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess, addNotification]);
};