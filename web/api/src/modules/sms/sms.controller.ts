import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { SmsService } from './sms.service.js';

@ApiTags('SMS History')
@Controller('v1/sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get()
  @ApiOperation({ summary: 'Get SMS logs history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'deviceId', required: false, type: String })
  async getSmsHistory(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return this.smsService.findByUser(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      type,
      deviceId,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get SMS stats summary' })
  async getSmsStats(@CurrentUser('userId') userId: string) {
    const stats = await this.smsService.getStats(userId);
    return stats;
  }
}
