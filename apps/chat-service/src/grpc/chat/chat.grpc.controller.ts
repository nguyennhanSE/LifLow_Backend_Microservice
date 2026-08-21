import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { MessagingService } from '../../modules/messaging/messaging.service';
import type {
  ChatRequestPayload,
  CreateMessageData,
  CreateRoomData,
  JoinRoomData,
  ListRoomMessagesData,
  ListUserRoomsData,
  MessageIdData,
  UpdateMessageData,
} from '../../modules/messaging/dtos/messaging.dto';

@Controller()
export class ChatGrpcController {
  constructor(private readonly messagingService: MessagingService) {}

  @GrpcMethod('ChatMessagingGrpcService', 'CreateRoom')
  createRoom(@Payload() payload: ChatRequestPayload<CreateRoomData>) {
    return this.messagingService.createRoom(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'JoinRoom')
  joinRoom(@Payload() payload: ChatRequestPayload<JoinRoomData>) {
    return this.messagingService.joinRoom(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'ListUserRooms')
  listUserRooms(@Payload() payload: ChatRequestPayload<ListUserRoomsData>) {
    return this.messagingService.listUserRooms(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'CreateMessage')
  createMessage(@Payload() payload: ChatRequestPayload<CreateMessageData>) {
    return this.messagingService.createMessage(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'ListRoomMessages')
  listRoomMessages(
    @Payload() payload: ChatRequestPayload<ListRoomMessagesData>,
  ) {
    return this.messagingService.listRoomMessages(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'GetMessageById')
  getMessageById(@Payload() payload: ChatRequestPayload<MessageIdData>) {
    return this.messagingService.getMessageById(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'UpdateMessage')
  updateMessage(@Payload() payload: ChatRequestPayload<UpdateMessageData>) {
    return this.messagingService.updateMessage(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'MarkMessageRead')
  markMessageRead(@Payload() payload: ChatRequestPayload<MessageIdData>) {
    return this.messagingService.markMessageRead(payload.data);
  }

  @GrpcMethod('ChatMessagingGrpcService', 'DeleteMessage')
  deleteMessage(@Payload() payload: ChatRequestPayload<MessageIdData>) {
    return this.messagingService.deleteMessage(payload.data);
  }
}
