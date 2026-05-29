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
import { WebhooksService } from './webhooks.service.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';

@ApiTags('Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List all webhooks' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.webhooksService.findAllByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.webhooksService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhooksService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.webhooksService.remove(id, userId);
    return { message: 'Webhook deleted successfully' };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test a webhook' })
  async test(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.webhooksService.testWebhook(id, userId);
  }
}
