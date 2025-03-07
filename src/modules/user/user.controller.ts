import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@PaginationParams() pagination: Pagination, @AuthenticatedUser() user: PayloadStruct) {
    return this.userService.findAll(pagination, user.companyID);
  }

  @Get('/approvers')
  async getApprovers(@AuthenticatedUser() user: PayloadStruct) {
    return this.userService.getApprovers(user.companyID);
  }

  @Get('/rag')
  async findActualUserAllocation(@AuthenticatedUser() user: PayloadStruct) {
    return this.userService.findActualUserAllocation(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Patch('job-title/:id')
  async changeJobTitle(@Body() jobTitleID: number, @Param('id') userID: number) {
    return await this.userService.changeJobTitle(userID, jobTitleID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

