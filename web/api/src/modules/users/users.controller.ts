import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body()
    updateData: {
      name?: string;
      avatar?: string;
      preferences?: {
        timezone?: string;
        defaultDeviceId?: string;
        smsDelay?: number;
        notifications?: { email?: boolean; push?: boolean; sms?: boolean };
        theme?: string;
      };
    },
  ) {
    // Only allow updating safe fields
    const allowedUpdates: Record<string, unknown> = {};

    if (updateData.name !== undefined) {
      allowedUpdates.name = updateData.name;
    }
    if (updateData.avatar !== undefined) {
      allowedUpdates.avatar = updateData.avatar;
    }
    if (updateData.preferences !== undefined) {
      allowedUpdates.preferences = updateData.preferences;
    }

    return this.usersService.update(userId, allowedUpdates);
  }
}
