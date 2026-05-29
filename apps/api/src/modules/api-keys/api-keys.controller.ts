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
import { ApiKeysService } from './api-keys.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { UpdateApiKeyDto } from './dto/update-api-key.dto.js';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.apiKeysService.findAllByUser(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Generate a new API key',
    description: 'The raw key is only returned once. Store it securely.',
  })
  async generate(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    const { apiKey, rawKey } = await this.apiKeysService.generateKey(
      userId,
      dto,
    );
    return {
      apiKey,
      rawKey,
      warning: 'Store this key securely. It cannot be retrieved again.',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.apiKeysService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API key settings' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateApiKeyDto,
  ) {
    return this.apiKeysService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an API key' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.apiKeysService.remove(id, userId);
    return { message: 'API key deleted successfully' };
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revoke(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.apiKeysService.revokeKey(id, userId);
  }
}
