import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/user/entities/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate{ 
    constructor( 
        private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler());

        if(!roles){
            return true;
        }
        const {user} = context.switchToHttp().getRequest();
        
        
        
        return roles.some((role)=> user.role?.includes(role));

    }
}