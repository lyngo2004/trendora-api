// auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        const emailNormalized = email.toLowerCase().trim();

        const existing = await this.prisma.user.findUnique({
            where: { email: emailNormalized },
        });

        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const SALT_ROUNDS = 10;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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
}