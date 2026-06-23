import { Global, Module } from '@nestjs/common';
import { MarzbanService } from './marzban.service';

@Global()
@Module({
  providers: [MarzbanService],
  exports: [MarzbanService],
})
export class MarzbanModule {}
