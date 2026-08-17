export const IDENTITY_CLIENT = 'NUTRITION_IDENTITY_CLIENT';

export const IDENTITY_USER_PATTERNS = {
  userDeleted: 'user.deleted',
} as const;

export interface UserDeletedPayload {
  userId: string;
}
