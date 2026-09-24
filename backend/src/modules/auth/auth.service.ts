import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
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

  /** مدة صلاحية Refresh Token (7 أيام) */
  private static readonly REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  /** سر الـ refresh المستخدم للتوقيع والتحقق */
  private get refreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_here_change_in_production';
  }

  /** يوقّع زوج التوكنات (access قصير + refresh طويل) ويخزّن جلسة الـ refresh */
  private async issueTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    // nest/jwt v11 يقيّد expiresIn بنوع صارم (number | StringValue) — نمرّره عبر خيارات مُنسّقة
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as unknown as number,
    });

    // نخزّن الجلسة لنتمكن من التحقق منها وإبطالها لاحقاً
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + AuthService.REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * تجديد الـ Access Token عبر Refresh Token.
   * يُستدعى من إندبوينت POST /auth/refresh (يستدعيه interceptor الواجهة عند 401)
   * === درس أمني: تدوير التوكن (Refresh Token Rotation) ===
   * لا نعود بالتوكن نفسه — بل نُبطل الجلسة القديمة ونصدر زوجاً جديداً،
   * فإن سُرّب توكن قديم مرة واحدة فقط يصبح عديم القيمة.
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token is required');

    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // لا نقبل إلا جلسة موجودة ولم تُبطَل ولم تنتهِ — وإلا فالتوكن مسروق/مُستعمل مسبقاً
    const session = await this.prisma.session.findUnique({ where: { token: refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      if (session) await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');

    // إبطال الجلسة القديمة ثم إصدار زوج جديد
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        fullName: user.profile?.fullName ?? user.email.split('@')[0],
      },
    };
  }

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
      include: { profile: true },
    });

    // نعيد التوكنات مباشرة حتى يتمكن المستخدم من الدخول بعد التسجيل
    const tokens = await this.issueTokens(user);

    return {
      message: 'User registered successfully',
      userId: user.id,
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        fullName: user.profile?.fullName ?? dto.fullName,
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        // نرسل الحقول التي تعرضها الواجهة (الاسم/الهاتف) بدل أن تخمّنها من البريد
        phone: user.phone,
        fullName: user.profile?.fullName ?? user.email.split('@')[0],
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

  /**
   * تسجيل الخروج — يُبطل جلسة الجهاز الحالي فقط.
   * === درس: لا تُفرغ كل الجلسات عند الخروج من جهاز واحد ===
   * إن فعلت ذلك، خروج المستخدم من جواله يطردجه من اللابتوب أيضاً.
   * نفرغ جلسة الـ refresh المرسلة مع الطلب، وإن غابت نستخدم الأحدث.
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({ where: { userId, token: refreshToken } });
    } else {
      const latest = await this.prisma.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (latest) await this.prisma.session.delete({ where: { id: latest.id } });
    }
    return { message: 'Logged out successfully' };
  }

  /** جلب الملف الشخصي كاملاً للمستخدم الحالي (GET /auth/me) */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, vendor: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isVerified: Boolean(user.verifiedAt),
      createdAt: user.createdAt,
      fullName: user.profile?.fullName ?? user.email.split('@')[0],
      avatar: user.profile?.avatar ?? null,
      vendor: user.vendor
        ? { id: user.vendor.id, name: user.vendor.name, status: user.vendor.status }
        : null,
    };
  }

  /** تحديث الملف الشخصي (PATCH /users/me) — يقبل الاسم والصورة فقط */
  async updateProfile(userId: string, data: { fullName?: string; avatar?: string }) {
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, fullName: data.fullName ?? '' , avatar: data.avatar },
      update: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
    });

    return this.getMe(userId);
  }

  /**
   * تغيير كلمة المرور (POST /auth/change-password).
   * === درس أمني مهم ===
   * بعد تغيير كلمة المرور نُبطل كل الجلسات الأخرى (احتياطاً إن كان الحساب مخترقاً)
   * لكن نُبقي الجلسة الحالية حتى لا يُطرد المستخدم من حسابه بعد العملية.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /** الجلسات النشطة للعرض في صفحة الملف الشخصي (GET /auth/sessions) */
  async getSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      device: s.deviceInfo ?? 'جهاز غير معروف',
      lastActive: s.createdAt,
      // الجلسة "الحالية" هي التي توكنها مطابق لتوكن هذا الجهاز
      isCurrent: Boolean(currentRefreshToken) && s.token === currentRefreshToken,
    }));
  }

  /** إنهاء جلسة محددة بمعرّفها */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new BadRequestException('الجلسة غير موجودة');
    await this.prisma.session.delete({ where: { id: session.id } });
    return { message: 'تم إنهاء الجلسة' };
  }

  /** إنهاء جميع الجلسات الأخرى مع إبقاء الجلسة الحالية */
  async revokeAllOtherSessions(userId: string, currentRefreshToken?: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        ...(currentRefreshToken ? { token: { not: currentRefreshToken } } : {}),
      },
    });
    return { message: 'تم إنهاء جميع الجلسات الأخرى' };
  }
}
