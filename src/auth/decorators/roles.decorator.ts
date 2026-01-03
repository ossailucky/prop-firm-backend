import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/user/entities/user.entity";

export const ROLES_KEY = "roles";
export const hasRoles = (...roles: UserRole[])=> SetMetadata(ROLES_KEY, roles);