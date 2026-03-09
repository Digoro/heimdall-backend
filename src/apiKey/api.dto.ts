import { IsEnum, IsString } from "class-validator";
import { Dto } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { APIKey } from "./api.entity";

export enum APIKeyStauts {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    EXPIRED = "Expired"
}


export class CreateAPIKeyDto implements Dto<APIKey> {
    @IsString()
    label: string;

    toEntity(user: User, hashKey: string, maskKey: string): APIKey {
        const apiKey = new APIKey();
        apiKey.label = this.label;
        apiKey.hashKey = hashKey;
        apiKey.maskKey = maskKey;
        apiKey.user = user;
        return apiKey;
    }
}

export interface ResponseCreateAPIKey {
    key: string;
    maskKey: string;
}

export class UpdateAPIKeyDto {
    @IsEnum(APIKeyStauts)
    status: APIKeyStauts;
}