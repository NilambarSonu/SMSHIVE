import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiProperty({ example: ['+1234567890', '+0987654321'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ example: 'Hello from SMSHIVE!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  simSlot?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
