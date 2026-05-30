import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SimInfoDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  slot: number;

  @ApiProperty({ example: 'AT&T', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}

export class CreateDeviceDto {
  @ApiProperty({ example: 'My Android Phone' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'dev_12345678', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({ example: 'Samsung Galaxy S24', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: 'token_xyz123', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  qrToken?: string;

  @ApiProperty({ example: 'Samsung', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  deviceBrand?: string;

  @ApiProperty({ example: '14', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  androidVersion?: string;

  @ApiProperty({ example: '1.0.0', required: false })
  @ValidateIf((object, value) => value !== null)
  @IsString()
  @IsOptional()
  appVersion?: string;

  @ApiProperty({ type: [SimInfoDto], required: false })
  @ValidateIf((object, value) => value !== null)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SimInfoDto)
  activeSims?: SimInfoDto[];
}
