import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveSmsDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({ example: 'Incoming message text' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  receivedAt?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  simSlot?: number;
}
