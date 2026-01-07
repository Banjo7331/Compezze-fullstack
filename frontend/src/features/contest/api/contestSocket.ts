import { BaseSocketClient } from '@/shared/api/BaseSocketClient';
import type { ContestSocketMessage } from '../model/socket.types';

const CONTEST_WS_URL = 'http://localhost:8000/contest/ws';

type ContestSocketPayload = ContestSocketMessage;

class ContestSocketClient extends BaseSocketClient<ContestSocketPayload> {
  constructor() {
    super(CONTEST_WS_URL, 'Contest');
  }

  public isActive(): boolean {
      return this.client && this.client.active; 
  }

  public connectAndSubscribe(onConnect?: () => void): void {
      this.client.onConnect = () => {
          console.log(`[${this.serviceName}] Connected!`);
          if (onConnect) onConnect();
      };
      this.activate();
  }

  public subscribeToContest(contestId: string, callback: (data: ContestSocketPayload) => void): string {
    return this.subscribeToTopic(`/topic/contest/${contestId}`, callback); 
  }

  public unsubscribe(subscriptionId: string): void {
      super.unsubscribe(subscriptionId);
  }

  public sendChatMessage(contestId: string, content: string, senderName: string): void {
      if (!this.isActive()) {
          console.warn('[Contest] Cannot send message: Socket disconnected');
          return;
      }

      this.client.publish({
          destination: `/app/chat/${contestId}/send`, 
          body: JSON.stringify({ 
              content, 
              senderName
          })
      });
  }
}

export const contestSocket = new ContestSocketClient();