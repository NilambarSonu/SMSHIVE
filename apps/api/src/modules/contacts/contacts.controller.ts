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
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List contacts' })
  @ApiQuery({ name: 'label', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query('label') label?: string,
    @Query('search') search?: string,
  ) {
    return this.contactsService.findAllByUser(userId, { label, search });
  }

  @Post()
  @ApiOperation({ summary: 'Create a contact' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(userId, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create contacts' })
  async bulkCreate(
    @CurrentUser('userId') userId: string,
    @Body() body: { contacts: CreateContactDto[] },
  ) {
    return this.contactsService.bulkCreate(userId, body.contacts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.contactsService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contact' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.contactsService.remove(id, userId);
    return { message: 'Contact deleted successfully' };
  }
}
