import { Controller, Post, UseInterceptors, UploadedFile, HttpStatus } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDTO } from './dto/upload.dto';
import { MyResponse } from '@/interceptors/response.interceptor';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("/")
  @UseInterceptors(FileInterceptor('file'))
  @MyResponse("Arquivo criado com sucesso.", HttpStatus.CREATED)
  async uploadFile(@UploadedFile() file: UploadDTO){
    const result = await this.uploadService.upload(file)

    return result;
  }
}
