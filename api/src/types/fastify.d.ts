import {
  DefaultQuery,
  DefaultParams,
  DefaultHeaders,
  DefaultBody,
} from 'fastify';
import { ResponseUserDto } from 'src/modules/users/dto/response-user.dto';

declare module 'fastify' {
  interface FastifyRequest<
    RouteGeneric = DefaultRouteGeneric,
    RawServerDefault = RawServerDefault,
    ContextDefault = ContextDefault,
  > extends Request<RouteGeneric, RawServerDefault, ContextDefault> {
    user?: ResponseUserDto; // Replace 'any' with the appropriate type for your user object
  }
}
