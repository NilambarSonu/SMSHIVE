import {
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SimInfoDto {
  @IsNumber()
  slot: number;

  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  carrier?: string;

  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  active: boolean;
}

export class HeartbeatDto {
  @ApiProperty({ example: 85, required: false })
  @ValidateIf((object, value) => value !== null)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  batteryLevel?: number;

  @ApiProperty({ example: true, required: false })
  @ValidateIf((object, value) => value !== null)
  @IsBoolean()
  @IsOptional()
  isCharging?: boolean;

  @ApiProperty({ example: 'wifi', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  networkType?: string;

  @ApiProperty({ required: false })
  @ValidateIf((object, value) => value !== null)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SimInfoDto)
  activeSims?: SimInfoDto[];

  @ApiProperty({ example: '2.1.0', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  appVersion?: string;
}
