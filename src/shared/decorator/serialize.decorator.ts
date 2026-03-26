import { UseInterceptors } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { SerializeInterceptor, SerializeListInterceptor } from "../interceptor/serialize.interceptor";

export function SerializeList<T>(cls: ClassConstructor<T>) {
    return UseInterceptors(new SerializeListInterceptor(cls));
}

export function Serialize<T>(cls: ClassConstructor<T>) {
    return UseInterceptors(new SerializeInterceptor(cls));
}