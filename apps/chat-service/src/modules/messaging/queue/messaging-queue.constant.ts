export const MESSAGING_QUEUE_NAME = 'chat-messaging-queue';

export const MESSAGE_CREATED_JOB = 'message-created-job';

export interface MessageCreatedJobPayload {
  messageId: string;
  roomId: string;
  senderId: string;
}
