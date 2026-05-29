import {
  IsString,
  IsArray,
  IsOptional,
  IsUrl,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://example.com/webhook' })
  @IsUrl()
  url: string;

  @ApiProperty({ example: ['sms.sent', 'sms.received', 'device.status'] })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiProperty({ enum: ['POST', 'PUT'], required: false })
  @IsEnum(['POST', 'PUT'])
  @IsOptional()
  method?: string;

  @ApiProperty({ example: { 'Content-Type': 'application/json' }, required: false })
  @IsOptional()
  headers?: Record<string, string>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
