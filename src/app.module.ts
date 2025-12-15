import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { useMulterMemoryStorageModule } from './utils/utils';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..')
    }),
    useMulterMemoryStorageModule()
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
