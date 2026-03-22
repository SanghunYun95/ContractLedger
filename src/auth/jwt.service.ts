import * as jwt from 'jsonwebtoken';

export class JWTService {
  private readonly secret = 'yourSecretKey'; // Replace with a secure, environment-stored secret

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' });
  }

  verifyToken(token: string): object | null {
    try {
      const payload = jwt.verify(token, this.secret);
return payload as object | null;
    } catch (error) {
      return null;
    }
  }
}