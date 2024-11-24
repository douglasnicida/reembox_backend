import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { MyResponse } from '@/interceptors/response.interceptor';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { PayloadStruct, Role } from '@/interfaces/model_types';
import { ApprovalRagDto } from './dto/rag.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('')
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Aprovações RAGs obtidas com sucesso")
  async getRagApprovals(@AuthenticatedUser() user: PayloadStruct) {
    return this.ragService.getRagApprovals(user.companyID)
  }

  @Post(':id')
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Aprovação feita com sucesso")
  async approveRAGForClient(
    @Param('id') customerId: string, 
    @Body() dto: ApprovalRagDto,
    @AuthenticatedUser() user: PayloadStruct,
  ) {
    await this.ragService.approveRAGForClient(+customerId, user, dto)
  }
}
