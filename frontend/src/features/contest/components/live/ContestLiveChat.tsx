import React, { useState, useEffect, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageSeparator,
  TypingIndicator // <--- 1. Importujemy wskaźnik pisania
} from '@chatscope/chat-ui-kit-react';

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
  const [isTyping, setIsTyping] = useState(false); // <--- 2. Stan dla "Ktoś pisze"
  const [typingInfo, setTypingInfo] = useState(""); 
  
  const subscriptionRef = useRef<string | null>(null);
  const { currentUserId, currentUser } = useAuth(); 

  useEffect(() => {
    // Funkcja obsługująca przychodzące zdarzenia z socketu
    const handleSocketMessage = (payload: any) => {
        // --- OBSŁUGA WIADOMOŚCI ---
        if (payload.event === 'CHAT_MESSAGE') {
            const serverMsg = payload as ChatSocketMessage;
            const isMe = currentUserId && serverMsg.userId === currentUserId;
            
            // Zabezpieczenie ID: używamy ID z serwera LUB timestamp + losowa liczba, żeby uniknąć duplikatów
            const msgId = serverMsg.id || (serverMsg.timestamp ? serverMsg.timestamp.toString() : `${Date.now()}-${Math.random()}`);

            setMessages((prev) => {
                // FIX: Sprawdzamy, czy wiadomość o tym ID już istnieje, żeby nie dodawać jej 2 razy
                if (prev.some(m => m.id === msgId)) {
                    return prev;
                }
                
                return [...prev, {
                    id: msgId,
                    message: serverMsg.content,
                    sender: serverMsg.userDisplayName || "Anonim",
                    direction: isMe ? "outgoing" : "incoming",
                    senderName: serverMsg.userDisplayName
                }];
            });
        }
        
        // --- OBSŁUGA "KTOŚ PISZE" (Przykład) ---
        // Jeśli Twój backend wysyła event np. 'USER_TYPING', obsłuż go tutaj:
        /*
        if (payload.event === 'USER_TYPING' && payload.userId !== currentUserId) {
             setTypingInfo(`${payload.userDisplayName} pisze...`);
             setIsTyping(true);
             // Wyłącz po 3 sekundach braku aktywności
             setTimeout(() => setIsTyping(false), 3000);
        }
        */
    };

    let checkInterval: any;

    const checkAndSubscribe = () => {
         if (contestSocket.isActive()) {
             setIsConnectionReady(true);
             // Subskrybujemy tylko jeśli jeszcze nie mamy subskrypcji
             if (!subscriptionRef.current) {
                 subscriptionRef.current = contestSocket.subscribeToContest(contestId, handleSocketMessage);
             }
         } else {
             setIsConnectionReady(false);
         }
    };
    
    // Sprawdzamy połączenie co 1s (polling)
    checkInterval = setInterval(checkAndSubscribe, 1000);
    checkAndSubscribe(); // Wywołanie natychmiastowe

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

      // Wysyłamy do serwera
      contestSocket.sendChatMessage(contestId, text, myDisplayName);
      
      // OPCJONALNIE: Możesz dodać wiadomość do listy od razu ("Optimistic UI"),
      // ale jeśli serwer odsyła ją z powrotem, lepiej poczekać na event z socketu,
      // żeby nie mieć duplikatów (chyba że masz dobre ID).
      // Obecna implementacja czeka na odpowiedź serwera (handleSocketMessage).
  };

  return (
    <Paper 
        elevation={3} 
        sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'white', 
            overflow: 'hidden' 
        }}
    >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">Czat na żywo</Typography>
            {!isConnectionReady && (
                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WifiOffIcon fontSize="small" /> Łączenie...
                </Typography>
            )}
        </Box>

        {/* Body */}
        <Box sx={{ 
            flexGrow: 1, 
            height: 0, // Hack Flexboxa
            overflow: 'hidden' 
        }}>
            <MainContainer responsive>
                <ChatContainer>
                    <MessageList 
                        // 3. Dodajemy typingIndicator do MessageList
                        typingIndicator={isTyping ? <TypingIndicator content={typingInfo || "Ktoś pisze..."} /> : null}
                    >
                        <MessageSeparator content="Witamy!" />
                        
                        {messages.map((msg) => (
                            <Message key={msg.id} model={{
                                message: msg.message,
                                sentTime: "now",
                                sender: msg.sender,
                                direction: msg.direction,
                                position: "normal"
                            }}>
                                {msg.direction === 'incoming' && (
                                    <Message.Header>
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