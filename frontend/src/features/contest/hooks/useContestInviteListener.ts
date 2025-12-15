import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestSocket } from '@/features/contest/api/contestSocket';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useNotificationCenter } from '@/app/providers/NotificationProvider';

// Definicja wiadomości zaproszenia (dostosuj pola do tego co wysyła backend)
interface ContestInviteMessage {
    contestId: string;
    title: string;
    inviterName?: string; // Opcjonalnie, jeśli backend to wysyła
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

            // Sprawdzamy czy socket contestu jest połączony (metoda z BaseSocketClient)
            if (contestSocket.isConnected()) {
                
                // Subskrybujemy kolejkę użytkownika (to samo endpoint co w Quiz, ale na innym sockecie)
                subscriptionId = contestSocket.subscribeToTopic('/user/queue/invitations', (msg: any) => {
                    const invite = msg as ContestInviteMessage;
                    
                    // Budujemy URL do konkursu
                    const joinUrl = `/contest/${invite.contestId}`;

                    console.log(`[Contest] Otrzymano zaproszenie do: ${invite.title}`);

                    // 1. Dodajemy do Centrum Powiadomień (dzwoneczek)
                    addNotification({
                        type: 'CONTEST', // Upewnij się, że masz ten typ w NotificationProvider
                        title: 'Zaproszenie do Konkursu',
                        message: `Zostałeś zaproszony do konkursu: "${invite.title}"`,
                        actionUrl: joinUrl
                    });

                    // 2. Obsługa akcji (przekierowanie lub toast)
                    if (autoRedirect) {
                        navigate(joinUrl);
                    } else {
                        showSuccess(`Nowe zaproszenie do konkursu: "${invite.title}"`);
                    }
                });
            } else {
                // Jeśli socket nie gotowy, próbujemy za sekundę
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