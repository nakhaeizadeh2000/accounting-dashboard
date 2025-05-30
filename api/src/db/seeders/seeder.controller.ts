import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Seeder } from './seeder';
import { RequireAdmin } from 'src/role/decorators/roles.decorator';
import { IsAdminGuard } from 'src/role/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('seed')
@UseGuards(JwtAuthGuard, IsAdminGuard)
@Controller('seed')
export class SeederController {
  constructor(
    private readonly seeder: Seeder,
    private readonly logger: Logger,
  ) { }

  @Get('demo-data')
  @RequireAdmin(true)
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  async seed() {
    this.seeder
      .seed()
      .then(() => {
        this.logger.debug('Seeding complete!');
      })
      .catch((error) => {
        this.logger.error('Seeding failed!');
        throw error;
      })
      .finally(() => {
        this.logger.warn('Seeding proccess completed!');
      });
  }
}
