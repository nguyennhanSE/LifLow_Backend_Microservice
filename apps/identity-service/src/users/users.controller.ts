import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IdentityRequestPayload } from '../common';
import {
  AssignRolesToUserPayload,
  CreateUserDto,
  FindPasswordDto,
  FindUserIdDto,
  GetAdminListQueryDto,
  GetUsersByRolePayload,
  GetUsersQueryDto,
  RemoveRoleFromUserPayload,
  UpdateMyAvatarPayload,
  UpdateMyPasswordPayload,
  UpdateMyProfilePayload,
  UpdateUserPayload,
  UpdateUserPermissionsPayload,
  UserAccountPayload,
  UserAccountsPayload,
  UserEmailPayload,
  UserEmailsPayload,
  UserIdPayload,
  UserIdsPayload,
  UserParamPayload,
} from './dtos/user.dto';
import { IDENTITY_USER_PATTERNS } from './patterns/user.pattern';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(IDENTITY_USER_PATTERNS.createUser)
  createUser(@Payload() payload: IdentityRequestPayload<CreateUserDto>) {
    return this.usersService.create(payload.data);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.listUsers)
  listUsers(@Payload() payload: IdentityRequestPayload<GetUsersQueryDto>) {
    return this.usersService.listUsers(payload.data);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getAdminList)
  getAdminList(
    @Payload() payload: IdentityRequestPayload<GetAdminListQueryDto>,
  ) {
    return this.usersService.getAdminList(payload.data);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getNewSignupToday)
  getNewSignupToday() {
    return this.usersService.countNewSignupsToday();
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserById)
  getUserById(@Payload() payload: IdentityRequestPayload<UserParamPayload>) {
    return this.usersService.findOne(payload.data.id);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserByEmail)
  getUserByEmail(@Payload() payload: IdentityRequestPayload<UserEmailPayload>) {
    return this.usersService.getUserByEmail(payload.data.email);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserByAccount)
  getUserByAccount(
    @Payload() payload: IdentityRequestPayload<UserAccountPayload>,
  ) {
    return this.usersService.getUserByAccount(payload.data.account);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserByIds)
  getUserByIds(@Payload() payload: IdentityRequestPayload<UserIdsPayload>) {
    return this.usersService.getUsersByIds(payload.data.ids);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUsersByEmails)
  getUsersByEmails(
    @Payload() payload: IdentityRequestPayload<UserEmailsPayload>,
  ) {
    return this.usersService.getUsersByEmails(payload.data.emails);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUsersByAccounts)
  getUsersByAccounts(
    @Payload() payload: IdentityRequestPayload<UserAccountsPayload>,
  ) {
    return this.usersService.getUsersByAccounts(payload.data.accounts);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.updateUser)
  updateUser(@Payload() payload: IdentityRequestPayload<UpdateUserPayload>) {
    return this.usersService.update(
      payload.data.id,
      payload.data.updateUserDto,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.deleteUser)
  deleteUser(@Payload() payload: IdentityRequestPayload<UserParamPayload>) {
    return this.usersService.remove(payload.data.id);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.updateMyAvatar)
  updateMyAvatar(
    @Payload() payload: IdentityRequestPayload<UpdateMyAvatarPayload>,
  ) {
    return this.usersService.updateAvatarUrl(
      payload.data.userId,
      payload.data.avatarUrl,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.updateMyProfile)
  updateMyProfile(
    @Payload() payload: IdentityRequestPayload<UpdateMyProfilePayload>,
  ) {
    return this.usersService.updateUserProfile(
      payload.data.userId,
      payload.data.updateProfileDto,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getMyPoints)
  getMyPoints(@Payload() payload: IdentityRequestPayload<UserIdPayload>) {
    return this.usersService.getUserPoints(payload.data.userId);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getMyInfo)
  getMyInfo(@Payload() payload: IdentityRequestPayload<UserIdPayload>) {
    return this.usersService.findUserInfo(payload.data.userId);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.updateMyPassword)
  updateMyPassword(
    @Payload() payload: IdentityRequestPayload<UpdateMyPasswordPayload>,
  ) {
    return this.usersService.updatePasswordWithOldPassword(
      payload.data.userId,
      payload.data.updatePasswordDto,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserPermissions)
  getUserPermissions(
    @Payload() payload: IdentityRequestPayload<UserIdPayload>,
  ) {
    return this.usersService.getUserPermissions(payload.data.userId);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.updateUserPermissions)
  updateUserPermissions(
    @Payload() payload: IdentityRequestPayload<UpdateUserPermissionsPayload>,
  ) {
    return this.usersService.updateUserPermissions(
      payload.data.userId,
      payload.data.permissions,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUserRoles)
  getUserRoles(@Payload() payload: IdentityRequestPayload<UserIdPayload>) {
    return this.usersService.getUserRoles(payload.data.userId);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.assignRolesToUser)
  assignRolesToUser(
    @Payload() payload: IdentityRequestPayload<AssignRolesToUserPayload>,
  ) {
    return this.usersService.assignRolesToUser(
      payload.data.userId,
      payload.data.roleIds,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.removeRoleFromUser)
  removeRoleFromUser(
    @Payload() payload: IdentityRequestPayload<RemoveRoleFromUserPayload>,
  ) {
    return this.usersService.removeRoleFromUser(
      payload.data.userId,
      payload.data.roleId,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.getUsersByRole)
  getUsersByRole(
    @Payload() payload: IdentityRequestPayload<GetUsersByRolePayload>,
  ) {
    return this.usersService.getUsersByRole(
      payload.data.roleId,
      payload.data.page,
      payload.data.limit,
      payload.data.search,
    );
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.checkUserId)
  checkUserId(@Payload() payload: IdentityRequestPayload<UserParamPayload>) {
    return this.usersService.checkUserId(payload.data.id);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.findUserId)
  findUserId(@Payload() payload: IdentityRequestPayload<FindUserIdDto>) {
    return this.usersService.findUserId(payload.data);
  }

  @MessagePattern(IDENTITY_USER_PATTERNS.findPassword)
  findPassword(@Payload() payload: IdentityRequestPayload<FindPasswordDto>) {
    return this.usersService.resetPassword(payload.data);
  }
}
