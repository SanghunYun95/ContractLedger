import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { Tenant } from '../domain/tenant.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string, tenantId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email, tenantId } });
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async register(email: string, pass: string, tenantId: string) {
    // Check if tenant exists, if not create it
    let tenant = await this.tenantRepository.findOne({ where: { name: tenantId } });
    if (!tenant) {
      tenant = this.tenantRepository.create({ name: tenantId });
      await this.tenantRepository.save(tenant);
    }

    // Check if user already exists in this tenant
    const existingUser = await this.userRepository.findOne({ where: { email, tenantId } });
    if (existingUser) {
      throw new BadRequestException('User already exists in this tenant');
    }

    const hashedPassword = await this.hashPassword(pass);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      tenantId,
    });

    await this.userRepository.save(user);

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      },
    };
  }

  async login(email: string, pass: string, tenantId: string) {
    const user = await this.validateUser(email, pass, tenantId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    
    // Generate Access & Refresh Tokens
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Store hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.refreshToken || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Token mismatch');
      }

      const newPayload = { sub: user.id, email: user.email, tenantId: user.tenantId };
      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Token validation failed');
    }
  }

  // For testing/seeding: Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
