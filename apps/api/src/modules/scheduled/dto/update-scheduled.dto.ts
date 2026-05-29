import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateScheduledDto } from './create-scheduled.dto.js';

export class UpdateScheduledDto extends PartialType(CreateScheduledDto) {
  @ApiProperty({
    enum: ['active', 'paused', 'completed', 'cancelled'],
    required: false,
  })
  @IsEnum(['active', 'paused', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;
}
