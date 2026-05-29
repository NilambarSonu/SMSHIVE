import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Welcome Message' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hello {{name}}, welcome to our service!' })
  @IsString()
  body: string;

  @ApiProperty({ example: 'marketing', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: ['name', 'company'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}
