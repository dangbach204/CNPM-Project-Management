import { sendEmail } from "./sendEmail";

interface EmailJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastError?: string;
}

/**
 * Simple in-memory email queue with retry logic.
 * For production with high volume, consider Bull + Redis.
 */
class EmailQueue {
  private queue: EmailJob[] = [];
  private processing = false;
  private readonly maxAttempts = 3;
  private readonly retryDelayMs = 5000; // 5 seconds between retries

  /**
   * Add an email to the queue for async sending with retry
   */
  add(to: string, subject: string, html: string): string {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.queue.push({
      id,
      to,
      subject,
      html,
      attempts: 0,
      maxAttempts: this.maxAttempts,
      createdAt: new Date(),
    });

    // Start processing if not already running
    this.processQueue();

    return id;
  }

  /**
   * Process the queue (non-blocking)
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      try {
        job.attempts++;
        await sendEmail({
          to: job.to,
          subject: job.subject,
          html: job.html,
        });

        console.log(
          `[EmailQueue] Email sent successfully: ${job.id} to ${job.to}`,
        );
      } catch (error: any) {
        job.lastError = error.message;

        if (job.attempts < job.maxAttempts) {
          console.warn(
            `[EmailQueue] Email ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}), retrying...`,
          );

          // Re-add to queue for retry after delay
          setTimeout(() => {
            this.queue.push(job);
            this.processQueue();
          }, this.retryDelayMs * job.attempts); // Exponential backoff
        } else {
          console.error(
            `[EmailQueue] Email ${job.id} failed permanently after ${job.attempts} attempts: ${job.lastError}`,
          );
          // In production, you might want to:
          // - Store failed emails in database
          // - Send alert to admin
          // - Use a dead-letter queue
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get queue status for monitoring
   */
  getStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing,
    };
  }
}

// Singleton instance
export const emailQueue = new EmailQueue();

/**
 * Queue an email for async sending with automatic retry
 */
export const queueEmail = (
  to: string,
  subject: string,
  html: string,
): string => {
  return emailQueue.add(to, subject, html);
};
