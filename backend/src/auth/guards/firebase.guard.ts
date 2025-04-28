import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class FirebaseGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Authorization header not found');
    }

    return this.validateToken(token, request);
  }

  async validateToken(token: string, request: any): Promise<boolean> {
    try {
      const decodedToken = await this.authService.verifyToken(token);
      // Attach the decoded token or user info to the request object
      // This makes user information available in your controllers
      request.user = decodedToken;
      return true;
    } catch (error) {
      // If verifyToken throws an UnauthorizedException, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For other errors, wrap them in a generic UnauthorizedException
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
