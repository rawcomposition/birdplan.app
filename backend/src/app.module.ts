import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { HelpersModule } from './helpers/helpers.module';
import { MapboxModule } from './external/mapbox/mapbox.module';
import { StorageModule } from './external/storage/storage.module';
import { TargetsModule } from './targets/targets.module';
import { InvitesModule } from './invites/invites.module';
import { HotspotsModule } from './hotspots/hotspots.module';
import { MarkersModule } from './markers/markers.module';
import { AccountModule } from './account/account.module';
import { EbirdModule } from './external/ebird/ebird.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env', // Specify the .env file path
    }),
    DatabaseModule,
    AuthModule,
    HelpersModule,
    MapboxModule,
    StorageModule,
    TargetsModule,
    InvitesModule,
    TripsModule,
    HotspotsModule,
    MarkersModule,
    AccountModule,
    EbirdModule,
    SupportModule,
    // Other modules will be added here (Auth, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
