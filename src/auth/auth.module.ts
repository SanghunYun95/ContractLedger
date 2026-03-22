import { JWTService } from './jwt.service';

export class AuthModule {
  private users: { username: string; password: string; role: string }[] = [];

  constructor(private readonly jwtService: JWTService) {}

  async register(credentials: { username: string; password: string }): Promise<string> {
    // Check if the user already exists
    const existingUser = this.users.find(user => user.username === credentials.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Register the new user
    const newUser = { username: credentials.username, password: credentials.password, role: 'user' };
    this.users.push(newUser);

    // Generate a JWT token for the new user
    const token = this.jwtService.generateToken({ username: newUser.username, role: newUser.role });
    return token;
  }

  async login(credentials: { username: string; password: string }): Promise<string> {
    // Validate the user's credentials
    const user = this.users.find(
      user => user.username === credentials.username && user.password === credentials.password
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Generate a JWT token
    const token = this.jwtService.generateToken({ username: user.username, role: user.role });
    return token;
  }
}