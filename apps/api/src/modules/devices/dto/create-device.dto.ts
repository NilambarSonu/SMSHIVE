import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SimInfoDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  slot: number;

  @ApiProperty({ example: 'AT&T' })
  @IsString()
  carrier: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}

export class CreateDeviceDto {
  @ApiProperty({ example: 'My Android Phone' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Samsung Galaxy S24', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ type: [SimInfoDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SimInfoDto)
  activeSims?: SimInfoDto[];
}
