import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<UserDocument> {
    try {
      const user = new this.userModel(data);
      return await user.save();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as Record<string, unknown>).code === 11000
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ clerkId }).exec();
  }

  async findOrCreateByClerk(clerkId: string, email: string, name: string): Promise<UserDocument> {
    let user = await this.findByClerkId(clerkId);
    if (user) return user;

    let finalEmail = email;
    let finalName = name;

    // If email is missing (e.g. from default Clerk JWT), fetch from Clerk API
    if (!finalEmail) {
      try {
        const { createClerkClient } = await import('@clerk/backend');
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        finalEmail = clerkUser.emailAddresses[0]?.emailAddress;
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        finalName = `${firstName} ${lastName}`.trim();
      } catch (error) {
        // Fallback if Clerk API call fails
      }
    }

    finalEmail = finalEmail || `${clerkId}@placeholder.local`;
    finalName = finalName || finalEmail.split('@')[0];

    // Check if a user with this email already exists (legacy user)
    user = await this.userModel.findOne({ email: finalEmail.toLowerCase() }).exec();
    if (user) {
      // Link the existing user to Clerk
      user.clerkId = clerkId;
      return user.save();
    }

    // Create new user
    const newUser = new this.userModel({
      email: finalEmail.toLowerCase(),
      name: finalName,
      clerkId,
      passwordHash: 'clerk-managed', // placeholder, not used
    });
    return newUser.save();
  }
}
