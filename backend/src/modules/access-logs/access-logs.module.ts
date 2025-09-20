import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessLogsService } from './access-logs.service';
import {
  AccessLogsController,
  RecordAccessHistoryController,
} from './access-logs.controller';
import { AccessLog, AccessLogSchema } from './schemas/access-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessLog.name, schema: AccessLogSchema },
    ])
  ],
  providers: [AccessLogsService],
  controllers: [AccessLogsController, RecordAccessHistoryController],
  exports: [AccessLogsService],
})
export class AccessLogsModule {}
