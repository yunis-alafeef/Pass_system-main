import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.vendorsService.findAll({ status, search });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req: any) {
    return this.vendorsService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getMyStats(@Request() req: any) {
    return this.vendorsService.getStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'ACTIVE' | 'SUSPENDED',
  ) {
    return this.vendorsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/commission')
  async updateCommission(
    @Param('id') id: string,
    @Body('commissionRate') commissionRate: number,
  ) {
    return this.vendorsService.updateCommission(id, commissionRate);
  }
}
