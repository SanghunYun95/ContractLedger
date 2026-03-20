export class UserService {
  private users: { id: number; name: string; email: string }[] = [];

  async create(createUserDto: { name: string; email: string }) {
    const newUser = { id: this.users.length + 1, ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  async findAll(): Promise<{ id: number; name: string; email: string }[]> {
    return this.users;
  }
}