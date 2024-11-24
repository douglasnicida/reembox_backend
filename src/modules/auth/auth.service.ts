import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth, Roles } from '@prisma/client';
import { PrismaService } from 'prisma/service/prisma.service';
import { LoginDTO } from './dto/LoginDTO';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private readonly jwtService: JwtService) {}

  async generateToken(
    id: number, email: string, companyID: number, 
    userID: number, name: string, company: string,
    rag: object
  ) {
    const payload = { sub: id, username: email, companyID: companyID, userID: userID, name: name, company: company, rag: rag}
    return this.jwtService.signAsync(payload);
  }

  removeHeaderFromToken(token: string) {
    return token.replace("Bearer ", "")
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(this.removeHeaderFromToken(token));
    } catch(err) {
      return false;
    }
  }

  async findOneByEmail(email: string) : Promise<Auth> {
    return await this.prisma.auth.findFirstOrThrow({where: {email: email}});
  }

  async validateUser(loginDTO: LoginDTO): Promise<any> {
    const authUser = await this.findOneByEmail(loginDTO.email);
    if (authUser) {
      const isPasswordValid = await bcrypt.compare(loginDTO.password, authUser.password)

      if(!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas')
      }

      const { password, ...result } = authUser;

      return result;
    }

    throw new NotFoundException('Credenciais inválidas');

  }

  async hashPassword(password: string) : Promise<string> {
    const hashedPassword = await bcrypt.hash(password, roundsOfHashing);

    return hashedPassword;
  }

  async create(createUserDto: CreateUserDto, companyID: number) {
    await this.prisma.company.findFirstOrThrow(
      { 
        where: { id: companyID },
      }
    );

    const user = await this.prisma.user.findUnique({
      where: { cpf: createUserDto.cpf },
    })

    if(user) {
      throw new ConflictException('Usuário já existe');
    }

    const newUser = await this.prisma.user.create({
      data: {
        cpf:  createUserDto.cpf,
        name: createUserDto.name,
        phone: createUserDto.phone,
        active: true,
        company: {connect: {id: companyID}},
      }
    });


    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newAuthData = {
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
      userId: newUser.id
    }

    let newAuth = await this.prisma.auth.create({
      data: newAuthData
    })

    return {newUser, newAuth}
  }

  async changeRole(newRole: Roles, userID: number) {
    const userAuth = await this.prisma.auth.findUniqueOrThrow({where: {userId: userID}});

    return await this.prisma.auth.update({
      where: {
        id: userAuth.id
      },
      data:{
        ...userAuth,
        role: newRole
      }
    })
  }

}
