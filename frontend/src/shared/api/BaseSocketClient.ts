import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

export class BaseSocketClient<T> { 
  protected client: Client;
  protected serviceName: string;

  constructor(brokerUrl: string, serviceName: string) {
    this.serviceName = serviceName;
    
    this.client = new Client({
      brokerURL: brokerUrl,
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      beforeConnect: () => {
          const token = localStorage.getItem('accessToken');
          
          if (token) {
              this.client.connectHeaders = {
                  Authorization: `Bearer ${token}`,
              };
              console.log(`[${this.serviceName}] Attaching fresh Bearer Token...`);
          } else {
              console.warn(`[${this.serviceName}] No token found in localStorage. Connecting as guest/cookie...`);
          }
      },

      debug: (str) => {
      },
    });

    this.client.onConnect = (frame) => {
      console.log(`[${this.serviceName}] Connected!`);
    };

    this.client.onStompError = (frame) => {
      console.error(`[${this.serviceName}] Broker error: ${frame.headers['message']}`);
      console.error(`Details: ${frame.body}`);
    };

    this.client.onWebSocketClose = () => {
        console.log(`[${this.serviceName}] Connection Closed`);
    }
  }

  public activate() {
    if (this.client.active) {
        return; 
    }

    console.log(`[${this.serviceName}] Activating client...`);
    this.client.activate();
  }

  public deactivate() {
    console.log(`[${this.serviceName}] Deactivating...`);
    this.client.deactivate();
  }

  public isActive(): boolean {
    return this.client.active;
  }
  
  public isConnected(): boolean {
      return this.client.connected;
  }
  
  public subscribeToTopic(topic: string, callback: (payload: T) => void): string {
    const trySubscribe = () => {
        if (this.client.connected) {
            console.log(`[${this.serviceName}] Subscribing to: ${topic}`);
            
            const subscription: StompSubscription = this.client.subscribe(topic, (message: IMessage) => {
                if (message.body) {
                    try {
                        callback(JSON.parse(message.body) as T); 
                    } catch (e) {
                        console.error(`[${this.serviceName}] JSON Parse Error`, e);
                    }
                }
            });
            return subscription.id; 

        } else {
            setTimeout(trySubscribe, 500);
            return ''; 
        }
    }
    
    return trySubscribe() || '';
  }
  
  public unsubscribe(subscriptionId: string): void {
      if (this.client && subscriptionId) {
          try {
              if (this.client.connected) {
                 this.client.unsubscribe(subscriptionId);
                 console.log(`[${this.serviceName}] Unsubscribed: ${subscriptionId}`);
              }
          } catch (e) {
              console.warn(`[${this.serviceName}] Failed to unsubscribe safely:`, e);
          }
      }
  }
}