// swiftchat.module.ts

import { Module } from '@nestjs/common';
import { SwiftchatMessageService } from './swiftchat.service';
import { MessageModule } from 'src/message/message.module'; // Correct the import path as necessary
import { UserService } from 'src/model/user.service';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { RedisService } from 'src/cache/cache.service';

@Module({
  imports: [MessageModule], // Import MessageModule
  providers: [SwiftchatMessageService,UserService,MixpanelService,RedisService], //RedisService
  
  exports: [SwiftchatMessageService],
})
export class SwiftchatModule {}
