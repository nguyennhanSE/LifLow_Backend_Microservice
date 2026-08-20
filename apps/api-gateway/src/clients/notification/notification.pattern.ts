export const NOTIFICATION_PATTERNS = {
  createNotification: 'notification.create',
  listMyNotifications: 'notification.my.list',
  getMyUnreadCount: 'notification.my.unread-count',
  markNotificationRead: 'notification.my.mark-read',
  markAllNotificationsRead: 'notification.my.mark-all-read',
  deleteNotification: 'notification.my.delete',
} as const;

export const GENERAL_NOTIFICATION_CHANNELS = {
  userNotifications: 'notification.general',
} as const;


