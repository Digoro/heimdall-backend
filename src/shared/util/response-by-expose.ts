import { plainToInstance, ClassConstructor } from "class-transformer";
import { Pagination } from "nestjs-typeorm-paginate"

export function responseByExpose<T>(cls: ClassConstructor<T>, list: Pagination<T>): Pagination<T> {
    return {
        items: list.items.map(o => {
            return plainToInstance(cls, o, {
                excludeExtraneousValues: true
            })
        }),
        meta: list.meta
    };
}