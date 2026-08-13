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
