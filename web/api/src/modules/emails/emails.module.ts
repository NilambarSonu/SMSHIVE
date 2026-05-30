import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service.js';

@Module({
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
