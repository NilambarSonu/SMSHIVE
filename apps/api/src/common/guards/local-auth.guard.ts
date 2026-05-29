import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for the login endpoint that uses Passport's local strategy
 * (email + password validation).
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
