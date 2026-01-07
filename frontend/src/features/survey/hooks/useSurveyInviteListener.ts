import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveySocket } from '@/features/survey/api/surveySocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

interface InviteMessage {
    roomId: string;
    surveyTitle: string;
    invitationToken: string;
}

export const useSurveyInviteListener = (config: { autoRedirect?: boolean } = {}) => {
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
        let retryTimeout: ReturnType<typeof setTimeout>;

        const tryToSubscribe = () => {
            if (!isMounted.current) return;

            if (surveySocket.isConnected()) {
                subscriptionId = surveySocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as InviteMessage;
                    const joinUrl = `/survey/join/${invite.roomId}?ticket=${invite.invitationToken}`;

                    console.log(`[Survey] Received invitation to: ${invite.surveyTitle}`);

                    addNotification({
                        type: 'SURVEY',
                        title: 'Survey Invitation',
                        message: `You have been invited to participate in: "${invite.surveyTitle}"`,
                        actionUrl: joinUrl
                    });

                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`New survey invitation: "${invite.surveyTitle}"`);
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
                surveySocket.unsubscribe(subscriptionId);
            }
        };
    }, [currentUserId, autoRedirect, navigate, showSuccess, addNotification]);
};