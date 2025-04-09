#  Scholarship Bot 🎓

Scholarship Bot is an intelligent assistant that helps students discover and apply for scholarships effortlessly. It provides personalized recommendations based on eligibility criteria, deadlines, and academic background.


# Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed
* Nest.js CLI installed (npm install -g @nestjs/cli)
* MySQL database accessible

## Getting Started
### Installation
* Fork the repository
Click the "Fork" button in the upper right corner of the repository page. This will create a copy of the repository under your GitHub account.


* Clone this repository:
```
https://github.com/MadgicalSwift/scholarships-awareness-bot.git
```
* Navigate to the Project Directory:
```
cd scholarships-awareness-bot
```
* Install Project Dependencies:
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add the following environment variables:

```bash
USERS_TABLE=
REGION=
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
API_URL=
BOT_ID=
API_KEY=
Sheet_API=
REDIS_TTL=
```
# API Endpoints
```
POST api/message: Endpoint for handling user requests. 
GET /api/status: Endpoint for checking the status of  api
```
# folder structure

```bash
src/
├── cache/
│   └── cache.service.ts
├── chat/
│   ├── chat.service.ts
│   └── chatbot.model.ts
├── common/
│   ├── exceptions/
│   │   ├── custom.exception.ts
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   ├── log.helper.ts
│   │   └── log.middleware.ts
│   └── utils/
│       └── date.service.ts
├── config/
│   └── database-config.service.ts
├── i18n/
│   ├── en/
│   │   └── localised-strings.ts
│   └── hi/
│       └── localised-strings.ts
├── intent/
│   └── intent.classifier.ts
├── localization/
│   ├── localization.service.ts
│   └── localization.module.ts
├── message/
│   ├── message.service.ts
│   └── message.service.ts
├── mixpanel/
│   ├── mixpanel.service.spec.ts
│   └── mixpanel.service.ts
└── model/
│   ├── user.entity.ts
│   ├──user.module.ts
│   └──user.service.ts
└── swiftchat/
│   ├── swiftchat.module.ts
│   └── swiftchat.service.ts
├── app.controller.ts
├── app.module.ts
├── lambda.ts
├── main.ts

```

# Link
* [Documentation](https://app.clickup.com/43312857/v/dc/199tpt-7824/199tpt-19527)

