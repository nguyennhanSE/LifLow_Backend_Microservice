import type { Role, User } from 'libs/prisma/generated/identity-service/client';
import { MembershipInfo, RoleInfo, UserEntity } from '../entities/user.entity';

export function toUserEntity(
  user: User,
  roleInfo?: Role[] | null,
  membershipInfo?: MembershipInfo | null,
): UserEntity {
  const userEntity = new UserEntity();

  userEntity.id = user.id;
  userEntity.password = user.password;
  userEntity.name = user.name ?? '';
  userEntity.age = user.age;
  userEntity.membershipLevel = user.membershipLevel;
  userEntity.email = user.email ?? undefined;
  userEntity.phoneNumber = user.phoneNumber ?? undefined;
  userEntity.mobilePhoneNumber = user.mobilePhoneNumber ?? undefined;
  userEntity.totalPurchaseAmount = user.totalPurchaseAmount;
  userEntity.totalUsedPoints = user.totalUsedPoints ?? undefined;
  userEntity.availablePoints = user.availablePoints ?? undefined;
  userEntity.registrationDate = user.registrationDate ?? undefined;
  userEntity.dormancyStatus = user.dormancyStatus ?? 'active';
  userEntity.dormancyDate = user.dormancyDate;
  userEntity.withdrawalDate = user.withdrawalDate;
  userEntity.withdrawalType = user.withdrawalType;
  userEntity.reasonForWithdrawal = user.reasonForWithdrawal;
  userEntity.createdAt = user.createdAt;
  userEntity.updatedAt = user.updatedAt;
  userEntity.nickName = user.nickName;
  userEntity.statusMessage = user.statusMessage;
  userEntity.avatarURL = user.avatarURL;
  userEntity.roles = roleInfo?.map(toRoleInfo);
  userEntity.membership = membershipInfo ?? null;

  return userEntity;
}

function toRoleInfo(role: Role): RoleInfo {
  const roleInfo = new RoleInfo();

  roleInfo.id = role.id;
  roleInfo.name = role.name;
  roleInfo.description = role.description;

  return roleInfo;
}
