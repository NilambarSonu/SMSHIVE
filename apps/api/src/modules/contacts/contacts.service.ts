import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactDocument> {
    try {
      const contact = new this.contactModel({
        ...dto,
        userId: new Types.ObjectId(userId),
      });
      return await contact.save();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as Record<string, unknown>).code === 11000
      ) {
        throw new ConflictException(
          'A contact with this phone number already exists',
        );
      }
      throw error;
    }
  }

  async findAllByUser(
    userId: string,
    query?: { label?: string; search?: string },
  ): Promise<ContactDocument[]> {
    const filter: FilterQuery<Contact> = {
      userId: new Types.ObjectId(userId),
    };

    if (query?.label) {
      filter.labels = query.label;
    }

    if (query?.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    return this.contactModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string, userId: string): Promise<ContactDocument> {
    const contact = await this.contactModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateContactDto,
  ): Promise<ContactDocument> {
    const contact = await this.contactModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.contactModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Contact not found');
    }
  }

  async bulkCreate(
    userId: string,
    contacts: CreateContactDto[],
  ): Promise<{ inserted: number; errors: number }> {
    const docs = contacts.map((c) => ({
      ...c,
      userId: new Types.ObjectId(userId),
    }));

    try {
      const result = await this.contactModel.insertMany(docs, {
        ordered: false,
      });
      return { inserted: result.length, errors: 0 };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'insertedDocs' in error
      ) {
        const bulkError = error as { insertedDocs: unknown[]; writeErrors: unknown[] };
        const inserted = bulkError.insertedDocs?.length || 0;
        const errors = bulkError.writeErrors?.length || 0;
        this.logger.warn(
          `Bulk insert: ${inserted} inserted, ${errors} errors`,
        );
        return { inserted, errors };
      }
      throw error;
    }
  }
}
