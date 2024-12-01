import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/LoginDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Roles } from '@prisma/client';
import { UserService } from '../user/user.service';
import { AuthenticatedUser } from 'src/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { Public } from '@/decorators/public.decorator';
import { RagService } from '../rag/rag.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly userService: UserService,
    private readonly ragService: RagService
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() loginDto: LoginDTO) {
    const auth = await this.authService.validateUser(loginDto);
    const user = await this.userService.findOneById(auth.userId);
    const rag = await this.ragService.findOneByCustomerId(user.allocations[0]?.project?.customerId)

    const { id, name, company } = user

    if(auth && user) {
      const token = await this.authService.generateToken(
        auth.id, 
        auth.email, 
        company.id, 
        id, 
        name, 
        company.name,
        rag
      )

      return { access_token: token }
    }

    throw new UnauthorizedException();
  }

  // perguntar se qualquer um pode se registrar ou apenas se alguém registrar por eles?
  @Post('/register')
  async register(@Body() registerInfo: CreateUserDto, @AuthenticatedUser() authUser: PayloadStruct) {
    return await this.authService.create(registerInfo, authUser.companyID);
  }

  @Post('/verify')
  async getUser(@Body('access_token') token: string) {
    const { username, name, company, rag } = await this.authService.verifyToken(token);

    if(!username) {
      throw new NotFoundException('Invalid token');
    }

    const tokenInfo = {
      username: username,
      name: name,
      company: company,
      rag: rag
    }
    
    return tokenInfo;
  }

  @Get('/getRole')
  async getUserRole(@AuthenticatedUser() user: any) {
    const { role } = await this.authService.findOneById(user.sub);

    return role;
  }

  @Patch('/role/:userID')
  async changeRole(@Param('userID') userID : string, @Body('role') role: string) {

    const rolesArrayString = Object.values(Roles).toString().split(',');
    const rolesArray = Object.values(Roles);

    if(!(rolesArrayString.includes(role))) {
      throw new NotFoundException('This ROLE does not exist.');
    }

    const roleIndex = rolesArrayString.indexOf(role)
    
    return await this.authService.changeRole(rolesArray[roleIndex], +userID);
  }
}

