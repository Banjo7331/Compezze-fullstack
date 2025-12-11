import { BaseSocketClient } from '@/shared/api/BaseSocketClient';
import type { WSMessage } from '../model/types'; 

const SURVEY_WS_URL = 'ws://localhost:8000/survey/ws'; 

type SurveySocketPayload = WSMessage; 

class SurveySocketClient extends BaseSocketClient<SurveySocketPayload> {
  constructor() {
    super(SURVEY_WS_URL, 'Survey'); 
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
  public subscribeToRoomUpdates(roomId: string, callback: (data: SurveySocketPayload) => void): string {
    return this.subscribeToTopic(`/topic/survey/${roomId}`, callback); 
  }
  public unsubscribe(subscriptionId: string): void {
      super.unsubscribe(subscriptionId);
  }
}

export const surveySocket = new SurveySocketClient();