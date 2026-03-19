import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ResponseMessage('Register success')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ResponseMessage('Login success')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ResponseMessage('Refresh success')
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @ResponseMessage('Logout success')
  logout(@Body() refreshDto: RefreshDto) {
    return this.authService.logout(refreshDto);
  }
}