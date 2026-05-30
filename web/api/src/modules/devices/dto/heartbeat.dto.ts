import {
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SimInfoDto {
  @IsNumber()
  slot: number;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  active: boolean;
}

export class HeartbeatDto {
  @ApiProperty({ example: 85, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  batteryLevel?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isCharging?: boolean;

  @ApiProperty({ example: 'wifi', required: false })
  @IsString()
  @IsOptional()
  networkType?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SimInfoDto)
  activeSims?: SimInfoDto[];

  @ApiProperty({ example: '2.1.0', required: false })
  @IsString()
  @IsOptional()
  appVersion?: string;
}
