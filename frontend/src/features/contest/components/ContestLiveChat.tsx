import React, { useState, useEffect, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer, ChatContainer, MessageList, Message, MessageInput, MessageSeparator
} from '@chatscope/chat-ui-kit-react';

import { Avatar } from '@chatscope/chat-ui-kit-react';
import { Box, Paper, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff'; 

import { useAuth } from '@/features/auth/AuthContext';
import { contestSocket } from '../api/contestSocket';
import type { ChatSocketMessage } from '../model/socket.types';

interface ContestLiveChatProps {
  contestId: string;
}

interface UIMessage {
  id: string;
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
  senderName?: string;
}

export const ContestLiveChat: React.FC<ContestLiveChatProps> = ({ contestId }) => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isConnectionReady, setIsConnectionReady] = useState(false);
  
  const subscriptionRef = useRef<string | null>(null);
  const { currentUserId, currentUser } = useAuth(); 

  useEffect(() => {
    const handleSocketMessage = (payload: any) => {
        if (payload.event === 'CHAT_MESSAGE') {
            const serverMsg = payload as ChatSocketMessage;
            const isMe = currentUserId && serverMsg.userId === currentUserId;

            setMessages((prev) => [...prev, {
                id: serverMsg.timestamp || Date.now().toString(),
                message: serverMsg.content,
                sender: serverMsg.userDisplayName || "Anonim",
                direction: isMe ? "outgoing" : "incoming",
                senderName: serverMsg.userDisplayName
            }]);
        }
    };

    let checkInterval: any;

    const checkAndSubscribe = () => {
         if (contestSocket.isActive()) {
             setIsConnectionReady(true);
             if (!subscriptionRef.current) {
                subscriptionRef.current = contestSocket.subscribeToContest(contestId, handleSocketMessage);
             }
         } else {
             setIsConnectionReady(false);
         }
    };
    
    checkInterval = setInterval(checkAndSubscribe, 1000);
    checkAndSubscribe();

    return () => {
        clearInterval(checkInterval);
        if (subscriptionRef.current) {
            contestSocket.unsubscribe(subscriptionRef.current);
            subscriptionRef.current = null;
        }
    };
  }, [contestId, currentUserId]);

  const handleSend = (text: string) => {
      if(!text.trim() || !isConnectionReady) return;
      const myDisplayName = currentUser?.username || "Gość";

      contestSocket.sendChatMessage(contestId, text, myDisplayName);
  };

  return (
    <Paper 
        elevation={3} 
        sx={{ 
            height: '100%',     // Wypełnia wysokość rodzica (Grid item)
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'white', 
            overflow: 'hidden'  // ✅ KLUCZOWE: Zapobiega rozciąganiu Paper przez dzieci
        }}
    >
        {/* Header - sztywna wysokość */}
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">Czat na żywo</Typography>
            {!isConnectionReady && (
                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WifiOffIcon fontSize="small" /> Łączenie...
                </Typography>
            )}
        </Box>

        {/* Body - elastyczne */}
        <Box sx={{ 
            flexGrow: 1,        // Zajmuje resztę miejsca
            height: 0,          // ✅ KLUCZOWE: Hack Flexboxa. Wymusza na kontenerze, by nie rósł w nieskończoność
            overflow: 'hidden'  // Ukrywa nadmiar, zmuszając MessageList do scrollowania wewnątrz
        }}>
            <MainContainer responsive>
                <ChatContainer>
                    {/* MessageList w tej bibliotece sam obsługuje scroll, jeśli rodzic ma ograniczoną wysokość */}
                    <MessageList>
                        <MessageSeparator content="Witamy!" />
                       {messages.map((msg, i) => (
                            <Message key={i} model={{
                                message: msg.message,
                                sentTime: "now",
                                sender: msg.sender,
                                direction: msg.direction,
                                position: "normal"
                            }}>
                                {/* ✅ Wyświetlamy PEŁNĄ nazwę nad dymkiem dla wiadomości przychodzących */}
                                {msg.direction === 'incoming' && (
                                    <Message.Header>
                                        {/* Możesz tu dodać style, np. pogrubienie */}
                                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>
                                            {msg.senderName}
                                        </span>
                                    </Message.Header>
                                )}
                            </Message>
                        ))}
                    </MessageList>
                    <MessageInput 
                        placeholder={isConnectionReady ? "Napisz coś..." : "Łączenie..."}
                        onSend={handleSend} 
                        attachButton={false} 
                        disabled={!isConnectionReady} 
                    />
                </ChatContainer>
            </MainContainer>
        </Box>
    </Paper>
  );
};