import { applyDecorators, Type } from "@nestjs/common";
import { ApiCreatedResponse, ApiExtraModels, getSchemaPath } from "@nestjs/swagger";
import { PaginationMeta } from "./pagination.dto";

export const APIPaginationResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(model, PaginationMeta),
        ApiCreatedResponse({
            schema: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            $ref: getSchemaPath(model)
                        }
                    },
                    meta: {
                        $ref: getSchemaPath(PaginationMeta)
                    }
                }
            },
        })
    )
}