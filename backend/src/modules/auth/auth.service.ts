import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VendorRegisterDto } from './dto/vendor-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user and profile
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        profile: {
          create: {
            fullName: dto.fullName,
          },
        },
      },
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_here_change_in_production',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    // Save session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async registerVendor(userId: string, dto: VendorRegisterDto) {
    // Check if user is already a vendor
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { vendor: true } });
    if (user.vendor) {
      throw new BadRequestException('User is already a vendor');
    }

    // Create vendor and update role
    const vendor = await this.prisma.vendor.create({
      data: {
        userId,
        name: dto.name,
        city: dto.city,
        phone: user.phone,
        status: 'PENDING',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'VENDOR' },
    });

    return vendor;
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }
}
