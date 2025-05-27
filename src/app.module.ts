import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Debug logging
        console.log('DB_HOST:', configService.get('DB_HOST'));
        console.log('DB_PORT:', configService.get('DB_PORT'));
        console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
        console.log(
          'DB_PASSWORD:',
          configService.get('DB_PASSWORD') ? '******' : 'undefined',
        );
        console.log('DB_DATABASE:', configService.get('DB_DATABASE'));
        console.log('DB_SYNCHRONIZE:', configService.get('DB_SYNCHRONIZE'));

        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') ?? '5432', 10),
          username: 'postgres', // Explicitly set username
          password: 'postgres', // Explicitly set password
          database: configService.get('DB_DATABASE') || 'my_local_market_db',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        };
      },
    }),
    ProductsModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
