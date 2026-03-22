import { AuthController } from '../src/auth/auth.controller';
import { AuthModule } from '../src/auth/auth.module';
import { JWTService } from '../src/auth/jwt.service';

describe('AuthController - Register/Login', () => {
  let authController: AuthController;

  beforeEach(() => {
    const jwtService = new JWTService();
    const authModule = new AuthModule(jwtService);
    authController = new AuthController(authModule);
  });

  it('should register a new user and return a token', async () => {
    const result = await authController.register({ username: 'newUser', password: 'password123' });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should not allow duplicate user registration', async () => {
    await authController.register({ username: 'duplicateUser', password: 'password123' });
    await expect(
      authController.register({ username: 'duplicateUser', password: 'password123' })
    ).rejects.toThrow('User already exists');
  });

  it('should log in an existing user and return a token', async () => {
    await authController.register({ username: 'loginUser', password: 'password123' });
    const result = await authController.login({ username: 'loginUser', password: 'password123' });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should not log in with invalid credentials', async () => {
    await expect(
      authController.login({ username: 'invalidUser', password: 'wrongPassword' })
    ).rejects.toThrow('Invalid credentials');
  });
});