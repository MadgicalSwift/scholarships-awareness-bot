// swiftchat.module.ts

import { Module } from '@nestjs/common';
import { SwiftchatMessageService } from './swiftchat.service';
import { MessageModule } from 'src/message/message.module'; // Correct the import path as necessary
import { UserService } from 'src/model/user.service';

@Module({
  imports: [MessageModule], // Import MessageModule
  providers: [SwiftchatMessageService,UserService],
  exports: [SwiftchatMessageService],
})
export class SwiftchatModule {}
