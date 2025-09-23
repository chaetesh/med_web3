import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import { IPFSService } from './ipfs.service';
import { IPFSController } from './ipfs.controller';
import { EnsService } from './ens.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [IPFSController],
  providers: [EncryptionService, IPFSService, EnsService],
  exports: [EncryptionService, IPFSService, EnsService],
})
export class CommonModule {}
