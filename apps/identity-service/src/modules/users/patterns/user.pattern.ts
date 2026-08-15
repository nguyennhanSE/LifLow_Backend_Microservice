export const IDENTITY_USER_PATTERNS = {
  createUser: 'user.create',
  listUsers: 'user.list',
  getAdminList: 'user.get-admin-list',
  getNewSignupToday: 'user.get-new-signup-today',

  getUserById: 'user.get-by-id',
  getUserByEmail: 'user.get-by-email',
  getUserByAccount: 'user.get-by-account',
  getUserByIds: 'user.get-by-ids',
  getUsersByEmails: 'user.get-by-emails',
  getUsersByAccounts: 'user.get-by-accounts',

  updateUser: 'user.update',
  deleteUser: 'user.delete',
  updateMyAvatar: 'user.me.update-avatar',
  updateMyProfile: 'user.me.update-profile',
  getMyPoints: 'user.me.get-points',
  getMyInfo: 'user.me.get-info',
  updateMyPassword: 'user.me.update-password',

  getUserPermissions: 'user.get-permissions',
  updateUserPermissions: 'user.update-permissions',
  getUserRoles: 'user.get-roles',
  assignRolesToUser: 'user.assign-roles',
  removeRoleFromUser: 'user.remove-role',
  getUsersByRole: 'user.get-by-role',

  checkUserId: 'user.check-id',
  findUserId: 'user.find-id',
  findPassword: 'user.find-password',

  membershipUpdated: 'membership.updated',
} as const;
