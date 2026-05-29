import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { DevicesService } from './devices.service.js';
import { CreateDeviceDto } from './dto/create-device.dto.js';
import { UpdateDeviceDto } from './dto/update-device.dto.js';
import { HeartbeatDto } from './dto/heartbeat.dto.js';

import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('v1/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all devices for the current user' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.devicesService.findAllByUser(userId);
  }

  @Post('register')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Register a new device' })
  async register(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateDeviceDto,
  ) {
    return this.devicesService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a device' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a device' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.devicesService.remove(id, userId);
    return { message: 'Device deleted successfully' };
  }

  @Post(':id/heartbeat')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Process device heartbeat' })
  async heartbeat(
    @Param('id') id: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.devicesService.heartbeat(id, dto);
  }
}
