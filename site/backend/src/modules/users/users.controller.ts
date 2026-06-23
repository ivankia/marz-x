import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { IsIn } from 'class-validator';

class UpdateLangDto { @IsIn(['ru', 'en']) lang: 'ru' | 'en'; }

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.users.getProfile(req.user.id);
  }

  @Put('me/lang')
  updateLang(@Req() req: any, @Body() dto: UpdateLangDto) {
    return this.users.updateLang(req.user.id, dto.lang);
  }
}
