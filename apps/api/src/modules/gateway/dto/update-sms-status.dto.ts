import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSmsStatusDto {
  @ApiProperty({
    enum: ['queued', 'sent', 'delivered', 'failed'],
    example: 'sent',
  })
  @IsString()
  @IsIn(['queued', 'sent', 'delivered', 'failed'])
  status: string;

  @ApiPropertyOptional({ example: 'Network unreachable' })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}
