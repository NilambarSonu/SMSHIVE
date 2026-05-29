// This strategy is no longer used. Authentication is handled by Clerk via JwtAuthGuard.
// Kept as a placeholder to avoid breaking imports during transition.
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy {}
