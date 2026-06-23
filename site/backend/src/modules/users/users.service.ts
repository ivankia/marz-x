import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true, lang: true, createdAt: true },
    });
    return user;
  }

  async updateLang(userId: string, lang: 'ru' | 'en') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lang },
      select: { id: true, email: true, lang: true },
    });
  }
}
