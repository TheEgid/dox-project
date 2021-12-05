import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export default class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    {
      return next.handle().pipe(
        tap((data) => {
          if (data === undefined) {
            throw new HttpException(
              {
                statusCode: HttpStatus.NOT_FOUND,
                message: "NOT_FOUND Error",
                error: "NOT_FOUND",
              },
              HttpStatus.NOT_FOUND
            );
          }
        })
      );
    }
  }
}
