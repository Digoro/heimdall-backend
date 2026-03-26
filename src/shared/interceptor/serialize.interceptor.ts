import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { plainToInstance, type ClassConstructor } from "class-transformer";
import { map } from "rxjs";

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
    constructor(
        private readonly cls: ClassConstructor<T>) { }

    intercept(context: ExecutionContext, next: CallHandler<any>) {
        return next.handle().pipe(
            map(data => {
                return plainToInstance(this.cls, data, {
                    excludeExtraneousValues: true
                })
            })
        );
    }
}

@Injectable()
export class SerializeListInterceptor<T> implements NestInterceptor {
    constructor(
        private readonly cls: ClassConstructor<T>) { }

    intercept(context: ExecutionContext, next: CallHandler<any>) {
        return next.handle().pipe(
            map(data => {
                return {
                    items: data.items.map(o => {
                        return plainToInstance(this.cls, o, {
                            excludeExtraneousValues: true
                        })
                    }),
                    meta: data.meta
                };
            })
        );
    }
}