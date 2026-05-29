import {
  IsString,
  IsArray,
  IsOptional,
  IsDateString,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduledDto {
  @ApiProperty({ example: ['+1234567890'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ example: 'Scheduled message content' })
  @IsString()
  message: string;

  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ enum: ['once', 'daily', 'weekly', 'monthly'], required: false })
  @IsEnum(['once', 'daily', 'weekly', 'monthly'])
  @IsOptional()
  recurrence?: string;

  @ApiProperty({ example: '0 9 * * 1', required: false })
  @IsString()
  @IsOptional()
  cronExpression?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deviceId?: string;
}
