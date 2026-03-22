import { AuthModule } from './auth.module';

export class AuthController {
  constructor(private readonly authModule: AuthModule) {}

  async register(req: { username: string; password: string }) {
    return await this.authModule.register(req);
  }

  async login(req: { username: string; password: string }) {
    return await this.authModule.login(req);
  }
}