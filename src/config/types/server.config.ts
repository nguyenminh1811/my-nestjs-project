import { Expose } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';
import { registerAsWithValidation } from '../help.config';
import * as dotenv from 'dotenv';

dotenv.config();

export enum NodeEnv {
  DEV = 'development',
  SIT = 'integration',
  PROD = 'production',
  TEST = 'test',
  LOCAL = 'local',
}

export class ServerConfig {
  nodeEnv: NodeEnv;
  port: number;
}

class EnvConfig {
  @Expose()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @Expose()
  @IsNumber()
  PORT: number;
}

export default registerAsWithValidation(
  'server',
  EnvConfig,
  process.env,
  (config): ServerConfig => ({
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
  }),
);
