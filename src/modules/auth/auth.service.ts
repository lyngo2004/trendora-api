// auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        const emailNormalized = email.toLowerCase().trim();

        const existing = await this.prisma.user.findUnique({
            where: { email: emailNormalized },
        });

        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, this.configService.get('BCRYPT_ROUNDS')!);

        const user = await this.prisma.user.create({
            data: {
                email: emailNormalized,
                password: hashedPassword,
                name,
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // generate tokens
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: this.configService.get('JWT_ACCESS_SECRET')!,
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES')!,
            },
        );

        // refresh token (raw)
        const refreshToken = randomBytes(64).toString('hex');

        // hash refresh token
        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES')!;
        const expiresAt = new Date(Date.now() + ms(expiresIn));

        // save to DB
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshDto: RefreshDto) {
        const { refreshToken: oldRefreshToken } = refreshDto;
        // hash token
        const tokenHash = createHash('sha256')
            .update(oldRefreshToken)
            .digest('hex');

        const existing = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });

        if (!existing) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        //detect reuse attack
        if (existing.isRevoked) {
            await this.prisma.refreshToken.updateMany({
                where: { userId: existing.userId },
                data: {
                    isRevoked: true,
                    revokedAt: new Date(),
                },
            });

            throw new UnauthorizedException('Token reuse detected');
        }

        // hết hạn
        if (existing.expiresAt < new Date()) {
            throw new UnauthorizedException('Token expired');
        }

        // revoke token cũ
        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
            },
        });

        // tạo token mới
        const newRefreshToken = randomBytes(64).toString('hex');

        const newHash = createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');

        const refreshExpires = this.configService.get('JWT_REFRESH_EXPIRES')!;
        const duration = ms(refreshExpires);

        if (!duration) {
            throw new Error('Invalid JWT_REFRESH_EXPIRES');
        }

        const newToken = await this.prisma.refreshToken.create({
            data: {
                userId: existing.userId,
                tokenHash: newHash,
                expiresAt: new Date(Date.now() + duration),
            },
        });

        // link rotation chain
        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: {
                replacedByTokenId: newToken.id,
            },
        });

        // lấy user
        const user = await this.prisma.user.findUnique({
            where: { id: existing.userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // access token mới
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: this.configService.get('JWT_ACCESS_SECRET')!,
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES')!,
            },
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(refreshDto: RefreshDto) {
        const { refreshToken } = refreshDto;

        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const existing = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
            },
        });

        if (!existing) {
            return { message: 'Logged out' };
        }

        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: {
                revokedAt: new Date(),
            },
        });

        return { message: 'Logged out' };
    }
}