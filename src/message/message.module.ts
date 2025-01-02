// message.module.ts
import { Module } from '@nestjs/common';
import { MessageService } from './message.service'; // Update the path to message.service
import { CustomException } from 'src/common/exception/custom.exception';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { UserService } from 'src/model/user.service';

@Module({
  providers: [
    {
      provide: MessageService,
      useClass: SwiftchatMessageService, // Provide the WhatsAppMessageService implementation
    },
    CustomException,
    UserService
  ],
  exports: [MessageService, CustomException],
})
export class MessageModule {}
