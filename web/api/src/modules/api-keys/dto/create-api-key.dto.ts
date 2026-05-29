import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production API Key' })
  @IsString()
  name: string;

  @ApiProperty({ example: ['sms:send', 'sms:read', 'device:read'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];

  @ApiProperty({ example: ['192.168.1.0/24'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ipWhitelist?: string[];

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimit?: number;
}
