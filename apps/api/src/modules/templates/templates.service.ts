import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateDocument> {
    const template = new this.templateModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
    return template.save();
  }

  async findAllByUser(
    userId: string,
    query?: { category?: string },
  ): Promise<TemplateDocument[]> {
    const filter: FilterQuery<Template> = {
      userId: new Types.ObjectId(userId),
    };
    if (query?.category) {
      filter.category = query.category;
    }
    return this.templateModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, userId: string): Promise<TemplateDocument> {
    const template = await this.templateModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTemplateDto,
  ): Promise<TemplateDocument> {
    const template = await this.templateModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.templateModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Template not found');
    }
  }

  async incrementUsage(id: string): Promise<void> {
    await this.templateModel
      .updateOne({ _id: id }, { $inc: { usageCount: 1 } })
      .exec();
  }
}
