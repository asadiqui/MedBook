import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, AdminUpdateUserDto, QueryUsersDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Public()
  @Get('doctors')
  async findAllDoctors(@Query() query: QueryUsersDto) {
    return this.usersService.findAllDoctors(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  @Public()
  @Get('doctors/:id')
  async findDoctorProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findDoctorProfile(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.usersService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, userId, userRole, dto);
  }

  @Patch(':id/admin')
  @Roles(Role.ADMIN)
  async adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.usersService.remove(id, userId, userRole);
  }

  @Post(':id/approve-doctor')
  @Roles(Role.ADMIN)
  async approveDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.approveDoctor(id);
  }

  @Delete(':id/admin')
  @Roles(Role.ADMIN)
  async adminDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.adminDeleteUser(id);
  }

  @Get(':id/document')
  @Roles(Role.ADMIN)
  async getDoctorDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getDoctorDocument(id);
  }
}
