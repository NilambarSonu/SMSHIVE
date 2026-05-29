import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user (syncs from Clerk)' })
  async me(
    @CurrentUser('userId') clerkId: string,
    @CurrentUser('email') email: string,
  ) {
    // Auto-sync user from Clerk to local DB on each /me call
    const user = await this.authService.syncUser(clerkId, email, '');
    return user;
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Explicitly sync Clerk user to local database' })
  async syncUser(
    @CurrentUser('userId') clerkId: string,
    @CurrentUser('email') email: string,
    @Body() body: { name?: string },
  ) {
    const user = await this.authService.syncUser(clerkId, email, body.name || '');
    return user;
  }
}
