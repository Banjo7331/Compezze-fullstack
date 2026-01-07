import React, { useState, useEffect, useRef } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageSeparator,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';

import { Box, Paper, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff'; 

import { useAuth } from '@/features/auth/AuthContext';
import { contestSocket } from '@/features/contest/api/contestSocket';
import type { ChatSocketMessage } from '@/features/contest/model/socket.types';

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingInfo, setTypingInfo] = useState(""); 
  
  const subscriptionRef = useRef<string | null>(null);
  const { currentUserId, currentUser } = useAuth(); 

  useEffect(() => {
    const handleSocketMessage = (payload: any) => {
        if (payload.event === 'CHAT_MESSAGE') {
            const serverMsg = payload as ChatSocketMessage;
            const isMe = currentUserId && serverMsg.userId === currentUserId;
            
            const msgId = serverMsg.id || (serverMsg.timestamp ? serverMsg.timestamp.toString() : `${Date.now()}-${Math.random()}`);

            setMessages((prev) => {
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
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'white', 
            overflow: 'hidden' 
        }}
    >
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">Chat</Typography>
            {!isConnectionReady && (
                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WifiOffIcon fontSize="small" /> Connecting...
                </Typography>
            )}
        </Box>

        <Box sx={{ 
            flexGrow: 1, 
            height: 0,
            overflow: 'hidden' 
        }}>
            <MainContainer responsive>
                <ChatContainer>
                    <MessageList 
                        typingIndicator={isTyping ? <TypingIndicator content={typingInfo || "Someone is typing..."} /> : null}
                    >
                        <MessageSeparator content="Welcome!" />
                        
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
                        placeholder={isConnectionReady ? "Type some message ..." : "Connecting..."}
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