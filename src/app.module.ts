import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigType } from '@nestjs/config';
import serverConfig, { NodeEnv } from './config/types/server.config';
import { v4 as uuid } from 'uuid';
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(serverConfig)],
      useFactory: async (sConfig: ConfigType<typeof serverConfig>) => ({
        pinoHttp: {
          level: sConfig.nodeEnv != NodeEnv.PROD ? 'debug' : 'info',
          redact: ['req.headers.authorization', 'req.headers.Authorization'],
          formatters: {
            level: (label) => ({ level: label }),
          },
          genReqId: function (req, res) {
            const existingID = req.id ?? req.headers['x-request-id'];
            if (existingID) return existingID;
            const id = uuid();
            res.setHeader('X-Request-Id', id);
            return id;
          },
          serializers: {
            req(req) {
              req.body = req.raw.body;
              return req;
            },
          },
        },
        exclude: [{ method: RequestMethod.ALL, path: 'health' }],
      }),
      inject: [serverConfig.KEY],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
