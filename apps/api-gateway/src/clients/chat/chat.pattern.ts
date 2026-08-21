export const CHAT_ROOM_PATTERNS = {
  createRoom: 'room.create',
  listUserRooms: 'room.list-user',
} as const;

export const CHAT_MESSAGE_PATTERNS = {
  createMessage: 'message.create',
  listRoomMessages: 'message.list-room',
  getMessageById: 'message.get-by-id',
  updateMessage: 'message.update',
  markMessageRead: 'message.mark-read',
  deleteMessage: 'message.delete',
} as const;
