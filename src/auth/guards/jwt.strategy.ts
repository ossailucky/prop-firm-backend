import { ExtractJwt,Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport/";
import { Injectable } from "@nestjs/common";
import { AuthDTO } from "../dto/create-auth.dto";
import { UserService } from "src/user/user.service";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "user"){
    constructor(private userService: UserService){
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
        // This will prevent the application from starting if the URI is missing
        throw new Error('JWT_SECRET environment variable is not set. Please check your .env file.');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret
        });
    }

    async validate(payload: AuthDTO){
        const user = await this.userService.findUser(payload);  
        return user;
    }
}