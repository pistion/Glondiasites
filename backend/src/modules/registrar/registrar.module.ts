import { Module } from '@nestjs/common';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { DomainsRepository } from '../domains/domains.repository';
import { AuthModule } from '../auth/auth.module';
import { RegistrarController } from './registrar.controller';
import { RegistrarService } from './registrar.service';
import { SpaceshipService } from './spaceship/spaceship.service';

@Module({
  imports: [AuthModule],
  controllers: [RegistrarController],
  providers: [RegistrarService, SpaceshipService, DomainsRepository, RbacGuard],
  exports: [RegistrarService, SpaceshipService],
})
export class RegistrarModule {}
