import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  throw new Error("Missing QStash token configuration");
}

export class QStashService {
  private client: Client;

  constructor() {
    this.client = new Client({
      token: process.env.QSTASH_TOKEN!,
    });
 }

  /**
   * Publish a message to a queue
   */
  async publish(queueName: string, body: any, options?: {
    delay?: number;
    notBefore?: number;
    deduplicationId?: string;
    contentType?: string;
  }) {
    try {
      const response = await this.client.publish({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/qstash/${queueName}`,
        body: JSON.stringify(body),
        delay: options?.delay,
        notBefore: options?.notBefore,
        id: options?.deduplicationId,
        contentType: options?.contentType || "application/json",
      });

      return {
        success: true,
        messageId: response.messageId,
        url: response.url,
      };
    } catch (error) {
      console.error("QStash publish error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish multiple messages to a queue
   */
  async publishBatch(queueName: string, messages: any[], options?: {
    delay?: number;
  }) {
    try {
      const promises = messages.map(message =>
        this.client.publish({
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/qstash/${queueName}`,
          body: JSON.stringify(message),
          delay: options?.delay,
          contentType: "application/json",
        })
      );

      const responses = await Promise.all(promises);

      return {
        success: true,
        messageIds: responses.map(r => r.messageId),
      };
    } catch (error) {
      console.error("QStash batch publish error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get message status
   */
 async getMessageStatus(messageId: string) {
    try {
      const response = await this.client.messages.get(messageId);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("QStash get message status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get message details
   */
 async getMessage(messageId: string) {
    try {
      const response = await this.client.messages.get(messageId);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("QStash get message error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
 }
}

// Create a singleton instance
export const qstashService = new QStashService();

// Export type definitions
export type QStashMessage = {
  messageId: string;
  url: string;
 method: string;
  headers: Record<string, string>;
  body: string;
  scheduleId?: string;
  createdAt: number;
  notBefore: number;
  status: "created" | "sent" | "failed" | "retried" | "dead";
  statusCode?: number;
  error?: string;
  failureCount: number;
  nextDelivery: number;
};