import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { GatewayService } from './gateway.service.js';
import { SendSmsDto } from './dto/send-sms.dto.js';
import { ReceiveSmsDto } from './dto/receive-sms.dto.js';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('v1/gateway/devices/:id/send-sms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send SMS via a specific device' })
  async sendSms(
    @Param('id') deviceId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: SendSmsDto,
  ) {
    return this.gatewayService.sendSms(userId, deviceId, dto);
  }

  @Post('v1/gateway/bulk-send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send SMS to multiple devices in bulk' })
  async bulkSend(
    @CurrentUser('userId') userId: string,
    @Body()
    body: {
      messages: { deviceId: string; recipients: string[]; message: string }[];
    },
  ) {
    return this.gatewayService.bulkSend(userId, body.messages);
  }

  @Get('v1/gateway/devices/:id/get-received-sms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get received SMS for a device' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReceivedSms(
    @Param('id') deviceId: string,
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gatewayService.getReceivedSms(
      userId,
      deviceId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('v1/gateway/devices/:id/receive-sms')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Report incoming SMS from a device (device API)' })
  async receiveSms(
    @Param('id') deviceId: string,
    @Body() dto: ReceiveSmsDto,
  ) {
    return this.gatewayService.receiveSms(deviceId, dto);
  }

  @Get('v1/gateway/devices/:id/pending-sms')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get pending SMS for a device to send (device API)' })
  async getPendingSms(@Param('id') deviceId: string) {
    return this.gatewayService.getPendingSms(deviceId);
  }

  @Put('v1/sms/:smsId/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update SMS delivery status (device API)' })
  async updateSmsStatus(
    @Param('smsId') smsId: string,
    @Body() body: { status: string; errorMessage?: string },
  ) {
    return this.gatewayService.updateSmsStatus(
      smsId,
      body.status,
      body.errorMessage,
    );
  }
}
