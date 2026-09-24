import { Controller, Post, Patch, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VendorRegisterDto } from './dto/vendor-register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * تجديد الـ Access Token — إندبوينت عام (لا يحتاج Access Token صالحاً)
   * يستدعيه interceptor الـ axios في الواجهة تلقائياً عند أي 401.
   */
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  /** الملف الشخصي للمستخدم الحالي */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  /** تحديث الملف الشخصي (الاسم/الصورة) — يتطلب توثيقاً */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() data: { fullName?: string; avatar?: string },
  ) {
    return this.authService.updateProfile(user.id, data);
  }

  /** تسجيل الخروج — يُبطل جلسة هذا الجهاز فقط */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: { id: string }, @Body('refreshToken') refreshToken?: string) {
    return this.authService.logout(user.id, refreshToken);
  }

  /** تغيير كلمة المرور */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentUser() user: { id: string },
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(user.id, currentPassword, newPassword);
  }

  /** الجلسات النشطة (يُرسَل refresh token الحالي لتمييز جلسة هذا الجهاز) */
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  getSessions(@CurrentUser() user: { id: string }, @Body('refreshToken') refreshToken?: string) {
    return this.authService.getSessions(user.id, refreshToken);
  }

  /** إنهاء جلسة محددة */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.authService.revokeSession(user.id, id);
  }

  /** إنهاء جميع الجلسات الأخرى مع إبقاء الجلسة الحالية */
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  revokeAllOtherSessions(
    @CurrentUser() user: { id: string },
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.revokeAllOtherSessions(user.id, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('vendor-register')
  registerVendor(@CurrentUser() user: { id: string }, @Body() dto: VendorRegisterDto) {
    return this.authService.registerVendor(user.id, dto);
  }
}
