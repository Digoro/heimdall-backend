import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { from, map, mergeMap, Observable } from "rxjs";
import { APIService } from "src/apiKey/api.service";

@Injectable()
export class APIUsageInterceptor implements NestInterceptor {
    constructor(
        private apiService: APIService
    ) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const apiKeyStr = request.headers['api-key'];

        return next.handle().pipe(
            mergeMap((controllerResult) => {
                return from(this.apiService.findByKey(apiKeyStr)).pipe(
                    mergeMap((apiKey) => {
                        return from(this.apiService.useKey(request, apiKey!)).pipe(
                            map(() => controllerResult)
                        )
                    })
                )
            })
        )
    }
}