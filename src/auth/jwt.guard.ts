import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies['access_token'];

        if (!token) throw new UnauthorizedException();

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get("JWT_ACCESS_TOKEN_SECRET")
            });
            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException("Access token expired");
        }
    }
}