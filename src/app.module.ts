import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobTitleModule } from './modules/job-title/job-title.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './modules/auth/auth.service';
import { PrismaModule } from 'prisma/service/prisma.module';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { CostCenterModule } from './modules/cost-center/cost-center.module';
import { ExpenseCategoryModule } from './modules/expense-category/expense-category.module';
import { CompanyModule } from './modules/company/company.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProjectModule } from './modules/project/project.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ReportModule } from './modules/report/report.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    CompanyModule,
    CustomerModule,
    ProjectModule,
    UserModule,
    AuthModule,
    JobTitleModule,
    CostCenterModule,
    ExpenseCategoryModule,
    ConfigModule.forRoot(),
    ReportModule,
    ExpenseModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // }
  ]
})
export class AppModule {}
