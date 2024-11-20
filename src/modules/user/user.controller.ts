import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Get()
  findAll(@PaginationParams() pagination: Pagination, @AuthenticatedUser() user: PayloadStruct) {
    return this.userService.findAll(pagination, user.companyID)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch('job-title/:id')
  async changeJobTitle(@Body() jobTitleID: number, @Param('id') userID: number) {
    return await this.userService.changeJobTitle(userID, jobTitleID);
  }

  @Get('/approvers/:companyID')
  async getApprovers(@Body('companyID') companyID: number) {
    return this.userService.getApprovers(companyID);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
