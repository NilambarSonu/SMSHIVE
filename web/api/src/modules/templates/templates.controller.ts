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
import { TemplatesService } from './templates.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all templates' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.findAllByUser(userId, { category });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.templatesService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.templatesService.remove(id, userId);
    return { message: 'Template deleted successfully' };
  }
}
