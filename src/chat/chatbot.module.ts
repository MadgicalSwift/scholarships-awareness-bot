// chatbot.module.ts

import { Module } from '@nestjs/common';
import ChatbotService from './chatbot.service';
import { SwiftchatModule } from 'src/swiftchat/swiftchat.module'; // Correct the import path as necessary
import IntentClassifier from '../intent/intent.classifier';
import { UserService } from 'src/model/user.service'; // Ensure the path is correct
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { MessageService } from 'src/message/message.service';
import { UserModule } from 'src/model/user.module'; // Import UserModule
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { RedisService } from 'src/cache/cache.service';

@Module({
  imports: [
    SwiftchatModule, // Import SwiftchatModule
    UserModule, // Import UserModule to access UserService
  ],
  providers: [
    ChatbotService,
    IntentClassifier,
    UserService, // Add UserService here
    {
      provide: MessageService,
      useClass: SwiftchatMessageService,
    },
    MixpanelService,
    RedisService
  ],
  exports: [ChatbotService, IntentClassifier],
})
export class ChatbotModule {}