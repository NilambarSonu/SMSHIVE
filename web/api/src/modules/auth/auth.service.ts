import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
  ) {}

  /**
   * Sync a Clerk user with the local MongoDB database.
   * Creates a new user if one doesn't exist, or links an existing user.
   */
  async syncUser(clerkId: string, email: string, name: string) {
    const user = await this.usersService.findOrCreateByClerk(clerkId, email, name);
    this.logger.log(`User synced: ${user.email} (Clerk: ${clerkId})`);
    return user;
  }

  /**
   * Get the local MongoDB user for a Clerk user ID.
   */
  async getLocalUser(clerkId: string) {
    return this.usersService.findByClerkId(clerkId);
  }
}
