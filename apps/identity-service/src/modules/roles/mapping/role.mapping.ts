import { Role } from "libs/prisma/generated/identity-service/client";
import { RoleEntity } from "../entities/role.entity";

export function toRoleEntity(role: Role): RoleEntity {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
    };
}