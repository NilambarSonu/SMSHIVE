import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AnalyticsService } from './analytics.service.js';

@ApiTags('Analytics')
@Controller('v1/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiQuery({ name: 'from', required: false, type: Date })
  @ApiQuery({ name: 'to', required: false, type: Date })
  async getSummary(
    @CurrentUser('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getSummary(
      userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('chart-data')
  @ApiOperation({ summary: 'Get data for charts' })
  @ApiQuery({ name: 'from', required: false, type: Date })
  @ApiQuery({ name: 'to', required: false, type: Date })
  async getChartData(
    @CurrentUser('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getChartData(
      userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }
}
