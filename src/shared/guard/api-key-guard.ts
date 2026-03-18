import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { APIService } from "src/apiKey/api.service";

@Injectable()
export class APIKeyGuard implements CanActivate {
    constructor(
        private apiService: APIService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKeyStr = request.headers['api-key'];

        if (!apiKeyStr) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const apiKey = await this.apiService.findByKey(apiKeyStr);
        if (!apiKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        return true;
    }
}