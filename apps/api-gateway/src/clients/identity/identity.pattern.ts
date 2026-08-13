export const IDENTITY_AUTH_PATTERNS = {
  login: 'auth.login',
  logout: 'auth.logout',
  refreshToken: 'auth.refresh-token',
  validateToken: 'auth.validate-token',
} as const;

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
  getMyOrders: 'user.me.get-orders',
  getMyCoupons: 'user.me.get-coupons',
  getMyShippingAddresses: 'user.me.get-shipping-addresses',
  createMyShippingAddress: 'user.me.create-shipping-address',
  updateMyShippingAddress: 'user.me.update-shipping-address',
  deleteMyShippingAddress: 'user.me.delete-shipping-address',
  updateMyPassword: 'user.me.update-password',
  cancelMyMembership: 'user.me.cancel-membership',

  getUserPermissions: 'user.get-permissions',
  updateUserPermissions: 'user.update-permissions',
  getUserRoles: 'user.get-roles',
  assignRolesToUser: 'user.assign-roles',
  removeRoleFromUser: 'user.remove-role',
  getUsersByRole: 'user.get-by-role',
  getUserMemberships: 'user.get-memberships',
  getUserActiveMembership: 'user.get-active-membership',

  checkUserId: 'user.check-id',
  findUserId: 'user.find-id',
  findPassword: 'user.find-password',
} as const;


export const IDENTITY_ROLE_PATTERNS = {
  createRole: 'role.create',
  listRoles: 'role.list',
  searchRoles: 'role.search',
  getRoleById: 'role.get-by-id',
  updateRole: 'role.update',
  deleteRole: 'role.delete',
  assignRoleToUsers: 'role.assign-to-users',
  revokeRoleFromUser: 'role.revoke-from-user',
  getUsersByRole: 'role.get-users',
} as const;
