import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalRagDto } from './dto/rag.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { PayloadStruct } from '@/interfaces/model_types';

@Injectable()
export class RagService {
  constructor(private prisma: PrismaService) {}

  async findOneByCustomerId(customerId: number) {
    const rag = await this.prisma.approvalRAG
      .findFirst({ 
        where: { customerId: customerId  },
        select: {
          id: true,
          customer: {
            select: {
              folderId: true
            }
          },
          llmModel: true,
          embeddingModel: true
        }
      })

    if (!rag) {
      return {}
    }

    return {
      id: rag.id,
      folderId: rag.customer.folderId,
      llmModel: rag.llmModel,
      embeddingModel: rag.embeddingModel
    }; 
  }

  async getRagApprovals(companyID: number) {
    const rags = await this.prisma.approvalRAG.findMany({
      where: {
        companyId: companyID
      }
    })

    return rags
  }

  async approveRAGForClient(customerId: number, user: PayloadStruct, dto: ApprovalRagDto) {    
    await this.prisma.customer
      .findFirstOrThrow({ where: { id: customerId } })
      .catch(() => { throw new NotFoundException(`Cliente com id = ${customerId} não encontrado`) })

    await this.prisma.approvalRAG.create({
      data: {
        approverId: user.userID,
        remarks: dto.remarks,
        llmModel: dto.llmModel,
        embeddingModel: dto.embeddingModel,
        customerId: customerId,
        companyId: user.companyID,
      }
    })
  } 
}
