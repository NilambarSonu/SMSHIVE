import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ScheduledService } from './scheduled.service.js';
import { CreateScheduledDto } from './dto/create-scheduled.dto.js';
import { UpdateScheduledDto } from './dto/update-scheduled.dto.js';

@ApiTags('Scheduled')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/scheduled')
export class ScheduledController {
  constructor(private readonly scheduledService: ScheduledService) {}

  @Get()
  @ApiOperation({ summary: 'List scheduled messages' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query('status') status?: string,
  ) {
    return this.scheduledService.findAllByUser(userId, { status });
  }

  @Post()
  @ApiOperation({ summary: 'Create a scheduled message' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateScheduledDto,
  ) {
    return this.scheduledService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scheduled message' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.scheduledService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a scheduled message' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateScheduledDto,
  ) {
    return this.scheduledService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scheduled message' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.scheduledService.remove(id, userId);
    return { message: 'Scheduled message deleted successfully' };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a scheduled message' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.scheduledService.cancel(id, userId);
  }
}
