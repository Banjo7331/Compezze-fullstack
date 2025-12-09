import { BaseSocketClient } from '@/shared/api/BaseSocketClient';
// Importujemy typy, które stworzyliśmy wcześniej (odpowiednik WSMessage / QuizSocketPayload)
import type { ContestSocketMessage } from '../model/socket.types';

const CONTEST_WS_URL = 'http://localhost:8000/api/v1/contest/ws';

// To jest nasz "Payload", dokładnie jak w Quizie
type ContestSocketPayload = ContestSocketMessage;

class ContestSocketClient extends BaseSocketClient<ContestSocketPayload> {
  constructor() {
    super(CONTEST_WS_URL, 'Contest');
  }

  public isActive(): boolean {
      // Zakładam, że BaseSocketClient zapewnia istnienie this.client
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
}

export const contestSocket = new ContestSocketClient();