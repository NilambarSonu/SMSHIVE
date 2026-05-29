import {
  IsString,
  IsOptional,
  IsArray,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: ['customer', 'vip'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
