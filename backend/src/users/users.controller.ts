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

  // GET /api/users - Admin only
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  // GET /api/users/doctors - Public
  @Public()
  @Get('doctors')
  async findAllDoctors(@Query() query: QueryUsersDto) {
    return this.usersService.findAllDoctors(query);
  }

  // GET /api/users/stats - Admin only
  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  // GET /api/users/doctors/:id - Public
  @Public()
  @Get('doctors/:id')
  async findDoctorProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findDoctorProfile(id);
  }

  // GET /api/users/:id
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.usersService.findOne(id, userId, userRole);
  }

  // PATCH /api/users/:id
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, userId, userRole, dto);
  }

  // PATCH /api/users/:id/admin - Admin only
  @Patch(':id/admin')
  @Roles(Role.ADMIN)
  async adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, dto);
  }

  // DELETE /api/users/:id
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.usersService.remove(id, userId, userRole);
  }

  // POST /api/users/:id/approve-doctor - Admin only
  @Post(':id/approve-doctor')
  @Roles(Role.ADMIN)
  async approveDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.approveDoctor(id);
  }

  // DELETE /api/users/:id/admin - Admin only
  @Delete(':id/admin')
  @Roles(Role.ADMIN)
  async adminDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.adminDeleteUser(id);
  }

  // GET /api/users/:id/document - Admin only
  @Get(':id/document')
  @Roles(Role.ADMIN)
  async getDoctorDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getDoctorDocument(id);
  }
}
