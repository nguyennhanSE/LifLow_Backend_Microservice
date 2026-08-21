import { Injectable } from '@nestjs/common';
import {
  CreateShippingAddressDto,
  CreateUserDto,
  FindPasswordDto,
  FindUserIdDto,
  GetAdminListQueryDto,
  GetUserInfoDto,
  GetUsersQueryDto,
  UpdatePasswordWithOldDto,
  UpdateShippingAddressDto,
  UpdateUserDto,
  UpdateUserProfileDto,
} from '../../routes/users/dtos/user.dto';
import { IdentityRequestMetadata } from '../../metadata/client.metadata';
import { IDENTITY_USER_PATTERNS } from './identity.pattern';
import { IdentityClientService } from './identity.client.service';

interface UserIdPayload {
  userId: string;
}

interface UserParamPayload {
  id: string;
}

interface UserEmailPayload {
  email: string;
}

interface UserAccountPayload {
  account: string;
}

interface UserIdsPayload {
  ids: string[];
}

interface UserEmailsPayload {
  emails: string[];
}

interface UserAccountsPayload {
  accounts: string[];
}

interface UpdateUserPayload {
  id: string;
  updateUserDto: UpdateUserDto;
}

interface UpdateMyAvatarPayload {
  userId: string;
  avatarUrl: string;
}

interface UpdateMyProfilePayload {
  userId: string;
  updateProfileDto: UpdateUserProfileDto;
}

interface GetMyInfoPayload {
  userId: string;
  query: GetUserInfoDto;
}

interface GetMyOrdersPayload {
  userId: string;
  offset?: number;
  limit?: number;
}

interface MyShippingAddressPayload {
  userId: string;
  addressId: string;
}

interface CreateMyShippingAddressPayload {
  userId: string;
  createAddressDto: CreateShippingAddressDto;
}

interface UpdateMyShippingAddressPayload {
  userId: string;
  addressId: string;
  updateAddressDto: UpdateShippingAddressDto;
}

interface UpdateMyPasswordPayload {
  userId: string;
  updatePasswordDto: UpdatePasswordWithOldDto;
}

interface UpdateUserPermissionsPayload {
  userId: string;
  permissions: string[];
}

interface AssignRolesToUserPayload {
  userId: string;
  roleIds: string[];
}

interface RemoveRoleFromUserPayload {
  userId: string;
  roleId: string;
}

interface GetUsersByRolePayload {
  roleId: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface GetUserMembershipsPayload {
  userId: string;
  query?: Record<string, unknown>;
}

type EmptyPayload = Record<string, never>;

@Injectable()
export class IdentityUserClient {
  constructor(private readonly identityClientService: IdentityClientService) {}

  createUser(createUserDto: CreateUserDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<CreateUserDto>(
      IDENTITY_USER_PATTERNS.createUser,
      { data: createUserDto, metadata },
    );
  }

  listUsers(query: GetUsersQueryDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<GetUsersQueryDto>(
      IDENTITY_USER_PATTERNS.listUsers,
      { data: query, metadata },
    );
  }

  getAdminList(
    query: GetAdminListQueryDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetAdminListQueryDto>(
      IDENTITY_USER_PATTERNS.getAdminList,
      { data: query, metadata },
    );
  }

  getNewSignupToday(metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<EmptyPayload>(
      IDENTITY_USER_PATTERNS.getNewSignupToday,
      { data: {}, metadata },
    );
  }

  getUserById(id: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserParamPayload>(
      IDENTITY_USER_PATTERNS.getUserById,
      { data: { id }, metadata },
    );
  }

  getUserByEmail(email: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserEmailPayload>(
      IDENTITY_USER_PATTERNS.getUserByEmail,
      { data: { email }, metadata },
    );
  }

  getUserByAccount(account: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserAccountPayload>(
      IDENTITY_USER_PATTERNS.getUserByAccount,
      { data: { account }, metadata },
    );
  }

  getUserByIds(ids: string[], metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdsPayload>(
      IDENTITY_USER_PATTERNS.getUserByIds,
      { data: { ids }, metadata },
    );
  }

  getUsersByEmails(emails: string[], metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserEmailsPayload>(
      IDENTITY_USER_PATTERNS.getUsersByEmails,
      { data: { emails }, metadata },
    );
  }

  getUsersByAccounts(accounts: string[], metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserAccountsPayload>(
      IDENTITY_USER_PATTERNS.getUsersByAccounts,
      { data: { accounts }, metadata },
    );
  }

  updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateUserPayload>(
      IDENTITY_USER_PATTERNS.updateUser,
      { data: { id, updateUserDto }, metadata },
    );
  }

  deleteUser(id: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserParamPayload>(
      IDENTITY_USER_PATTERNS.deleteUser,
      { data: { id }, metadata },
    );
  }

  updateMyAvatar(
    userId: string,
    avatarUrl: string,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateMyAvatarPayload>(
      IDENTITY_USER_PATTERNS.updateMyAvatar,
      { data: { userId, avatarUrl }, metadata },
    );
  }

  updateMyProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateMyProfilePayload>(
      IDENTITY_USER_PATTERNS.updateMyProfile,
      { data: { userId, updateProfileDto }, metadata },
    );
  }

  getMyPoints(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getMyPoints,
      { data: { userId }, metadata },
    );
  }

  getMyInfo(
    userId: string,
    query: GetUserInfoDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetMyInfoPayload>(
      IDENTITY_USER_PATTERNS.getMyInfo,
      { data: { userId, query }, metadata },
    );
  }

  getMyOrders(
    userId: string,
    query: Omit<GetMyOrdersPayload, 'userId'> = {},
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetMyOrdersPayload>(
      IDENTITY_USER_PATTERNS.getMyOrders,
      { data: { userId, ...query }, metadata },
    );
  }

  getMyCoupons(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getMyCoupons,
      { data: { userId }, metadata },
    );
  }

  getMyShippingAddresses(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getMyShippingAddresses,
      { data: { userId }, metadata },
    );
  }

  createMyShippingAddress(
    userId: string,
    createAddressDto: CreateShippingAddressDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<CreateMyShippingAddressPayload>(
      IDENTITY_USER_PATTERNS.createMyShippingAddress,
      { data: { userId, createAddressDto }, metadata },
    );
  }

  updateMyShippingAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateShippingAddressDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateMyShippingAddressPayload>(
      IDENTITY_USER_PATTERNS.updateMyShippingAddress,
      { data: { userId, addressId, updateAddressDto }, metadata },
    );
  }

  deleteMyShippingAddress(
    userId: string,
    addressId: string,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<MyShippingAddressPayload>(
      IDENTITY_USER_PATTERNS.deleteMyShippingAddress,
      { data: { userId, addressId }, metadata },
    );
  }

  updateMyPassword(
    userId: string,
    updatePasswordDto: UpdatePasswordWithOldDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateMyPasswordPayload>(
      IDENTITY_USER_PATTERNS.updateMyPassword,
      { data: { userId, updatePasswordDto }, metadata },
    );
  }

  cancelMyMembership(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.cancelMyMembership,
      { data: { userId }, metadata },
    );
  }

  getUserPermissions(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getUserPermissions,
      { data: { userId }, metadata },
    );
  }

  updateUserPermissions(
    userId: string,
    permissions: string[],
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateUserPermissionsPayload>(
      IDENTITY_USER_PATTERNS.updateUserPermissions,
      { data: { userId, permissions }, metadata },
    );
  }

  getUserRoles(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getUserRoles,
      { data: { userId }, metadata },
    );
  }

  assignRolesToUser(
    userId: string,
    roleIds: string[],
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<AssignRolesToUserPayload>(
      IDENTITY_USER_PATTERNS.assignRolesToUser,
      { data: { userId, roleIds }, metadata },
    );
  }

  removeRoleFromUser(
    userId: string,
    roleId: string,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<RemoveRoleFromUserPayload>(
      IDENTITY_USER_PATTERNS.removeRoleFromUser,
      { data: { userId, roleId }, metadata },
    );
  }

  getUsersByRole(
    roleId: string,
    query: Omit<GetUsersByRolePayload, 'roleId'> = {},
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetUsersByRolePayload>(
      IDENTITY_USER_PATTERNS.getUsersByRole,
      { data: { roleId, ...query }, metadata },
    );
  }

  getUserMemberships(
    userId: string,
    query?: Record<string, unknown>,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetUserMembershipsPayload>(
      IDENTITY_USER_PATTERNS.getUserMemberships,
      { data: { userId, query }, metadata },
    );
  }

  getUserActiveMembership(userId: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserIdPayload>(
      IDENTITY_USER_PATTERNS.getUserActiveMembership,
      { data: { userId }, metadata },
    );
  }

  checkUserId(id: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<UserParamPayload>(
      IDENTITY_USER_PATTERNS.checkUserId,
      { data: { id }, metadata },
    );
  }

  findUserId(findUserIdDto: FindUserIdDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<FindUserIdDto>(
      IDENTITY_USER_PATTERNS.findUserId,
      { data: findUserIdDto, metadata },
    );
  }

  findPassword(
    findPasswordDto: FindPasswordDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<FindPasswordDto>(
      IDENTITY_USER_PATTERNS.findPassword,
      { data: findPasswordDto, metadata },
    );
  }
}
