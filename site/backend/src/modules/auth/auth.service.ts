import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        lang: dto.lang || 'ru',
      },
    });

    await this.sendVerificationEmail(user.id, user.email, user.lang);
    return { message: 'Registration successful. Check your email to verify your account.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException();

    await this.prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(user.id, user.email);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    return { message: 'Logged out' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailToken.findUnique({ where: { token } });
    if (!record || record.type !== 'verify_email' || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await this.prisma.emailToken.delete({ where: { token } });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email already verified');

    await this.sendVerificationEmail(user.id, user.email, user.lang);
    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If this email exists, a reset link was sent' };

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await this.prisma.emailToken.deleteMany({ where: { userId: user.id, type: 'reset_password' } });
    await this.prisma.emailToken.create({
      data: { token, userId: user.id, type: 'reset_password', expiresAt },
    });

    const resetUrl = `${this.config.get('APP_URL')}/reset-password?token=${token}`;
    await this.email.sendPasswordReset(user.email, resetUrl, user.lang);

    return { message: 'If this email exists, a reset link was sent' };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.emailToken.findUnique({ where: { token } });
    if (!record || record.type !== 'reset_password' || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await this.prisma.emailToken.delete({ where: { token } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } });

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '1h',
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private async sendVerificationEmail(userId: string, email: string, lang: string) {
    await this.prisma.emailToken.deleteMany({ where: { userId, type: 'verify_email' } });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.emailToken.create({
      data: { token, userId, type: 'verify_email', expiresAt },
    });

    const verifyUrl = `${this.config.get('APP_URL')}/verify-email?token=${token}`;
    await this.email.sendVerification(email, verifyUrl, lang);
  }
}
