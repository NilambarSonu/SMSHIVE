import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';
import mongoose from 'mongoose';
import { UserSchema } from '../../modules/users/schemas/user.schema.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      let userId = payload.sub; // Fallback to Clerk ID
      
      try {
        const activeConn = mongoose.connections.find(c => c.readyState === 1) || mongoose.connection;
        const UserModel = (activeConn.models.User || activeConn.model('User', UserSchema)) as any;
        
        let user = await UserModel.findOne({ clerkId: payload.sub }).exec();
        if (!user) {
          // Sync user dynamically
          let email = (payload as any).email || '';
          if (!email && (payload as any).email_address) {
            email = (payload as any).email_address;
          }
          if (!email && (payload as any).emails && (payload as any).emails[0]) {
            email = (payload as any).emails[0];
          }
          const finalEmail = email || `${payload.sub}@placeholder.local`;
          const finalName = finalEmail.split('@')[0];
          
          user = await UserModel.findOne({ email: finalEmail.toLowerCase() }).exec();
          if (user) {
            user.clerkId = payload.sub;
            await user.save();
          } else {
            user = new UserModel({
              email: finalEmail.toLowerCase(),
              name: finalName,
              clerkId: payload.sub,
              passwordHash: 'clerk-managed',
            });
            await user.save();
          }
        }
        
        if (user) {
          userId = user._id.toString();
        }
      } catch (dbErr) {
        this.logger.error(`Failed to map Clerk ID to MongoDB user: ${dbErr instanceof Error ? dbErr.message : dbErr}`);
      }

      // Attach user info to request for @CurrentUser decorator
      (request as any).user = {
        userId,
        email: (payload as any).email || '',
        clerkId: payload.sub,
      };

      return true;
    } catch (error) {
      this.logger.warn(`Clerk token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
