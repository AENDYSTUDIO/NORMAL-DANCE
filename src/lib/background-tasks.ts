import { qstashService } from "./qstash-service";

/**
 * Service for handling background tasks using QStash
 */
export class BackgroundTaskService {
  /**
   * Send notification asynchronously
   */
 async sendNotification(userId: string, title: string, message: string, type: string = 'general') {
    const taskData = {
      userId,
      title,
      message,
      type,
      timestamp: Date.now(),
    };

    return await qstashService.publish('notifications', taskData);
  }

  /**
   * Process email asynchronously
   */
  async sendEmail(to: string, subject: string, body: string, template?: string) {
    const taskData = {
      to,
      subject,
      body,
      template,
      timestamp: Date.now(),
    };

    return await qstashService.publish('emails', taskData);
  }

 /**
   * Track analytics event asynchronously
   */
  async trackEvent(userId: string, event: string, properties?: Record<string, any>) {
    const taskData = {
      userId,
      event,
      properties,
      timestamp: Date.now(),
    };

    return await qstashService.publish('analytics', taskData);
  }

 /**
   * Process file upload asynchronously
   */
  async processFileUpload(fileId: string, filePath: string, userId: string, metadata?: Record<string, any>) {
    const taskData = {
      fileId,
      filePath,
      userId,
      metadata,
      timestamp: Date.now(),
    };

    return await qstashService.publish('file-processing', taskData);
  }

  /**
   * Process audio transcoding asynchronously
   */
  async transcodeAudio(trackId: string, originalPath: string, targetFormats: string[]) {
    const taskData = {
      trackId,
      originalPath,
      targetFormats,
      timestamp: Date.now(),
    };

    return await qstashService.publish('audio-transcoding', taskData);
  }

  /**
   * Process payment asynchronously
   */
  async processPayment(paymentId: string, amount: number, userId: string, metadata?: Record<string, any>) {
    const taskData = {
      paymentId,
      amount,
      userId,
      metadata,
      timestamp: Date.now(),
    };

    return await qstashService.publish('payments', taskData);
  }

  /**
   * Process NFT minting asynchronously
   */
  async processNftMint(nftId: string, metadata: any, owner: string) {
    const taskData = {
      nftId,
      metadata,
      owner,
      timestamp: Date.now(),
    };

    return await qstashService.publish('nft-minting', taskData);
  }

  /**
   * Process bulk operations
   */
  async processBulkTasks(queueName: string, tasks: any[]) {
    return await qstashService.publishBatch(queueName, tasks);
  }
}

// Create singleton instance
export const backgroundTaskService = new BackgroundTaskService();