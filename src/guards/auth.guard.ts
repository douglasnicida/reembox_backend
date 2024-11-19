import { IS_PUBLIC_KEY } from '@/decorators/public.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifique se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;  // Permitir acesso a rotas públicas
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Verifique se o cabeçalho de autorização está presente
    if (!authHeader) {
      console.log('Authorization header not found');
    }

    // Remova o prefixo 'Bearer' do token
    const token = this.authService.removeHeaderFromToken(authHeader);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // Verifique e valide o token JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });

      // Anexe o payload do token ao objeto de requisição
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Sessão inválida');
    }

    // Se tudo for válido, o acesso é permitido
    return true;
  }
}
