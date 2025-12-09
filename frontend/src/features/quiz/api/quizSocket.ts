import { BaseSocketClient } from '@/shared/api/BaseSocketClient';
import type { WSMessage } from '../model/types'; 

const QUIZ_WS_URL = 'ws://localhost:8000/quiz/ws'; 

type QuizSocketPayload = WSMessage; 

class QuizSocketClient extends BaseSocketClient<QuizSocketPayload> {
  constructor() {
    super(QUIZ_WS_URL, 'Quiz'); 
  }
  public isActive(): boolean {
      return this.client.active; 
  }
  public connectAndSubscribe(onConnect?: () => void): void {
      this.client.onConnect = () => {
          console.log(`[${this.serviceName}] Connected!`);
          if (onConnect) onConnect();
      };
      this.activate();
  }
  public subscribeToRoomUpdates(roomId: string, callback: (data: QuizSocketPayload) => void): string {
    return this.subscribeToTopic(`/topic/quiz/${roomId}`, callback); 
  }
  public unsubscribe(subscriptionId: string): void {
      super.unsubscribe(subscriptionId);
  }
}

export const quizSocket = new QuizSocketClient();