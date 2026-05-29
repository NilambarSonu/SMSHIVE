import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto.js';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
