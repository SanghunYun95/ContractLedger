export class UserService {
  private users: { id: number; name: string; email: string }[] = [];

  async create(createUserDto: { name: string; email: string }): Promise<{ id: number; name: string; email: string }> {
    const newUser = { id: this.users.length + 1, ...createUserDto };
    this.users.push(newUser);
    return newUser;
  }

  async findAll(): Promise<{ id: number; name: string; email: string }[]> {
    return this.users;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async update(id: number, updateUserDto: { name: string; email: string }): Promise<{ id: number; name: string; email: string } | null> {
    const user = this.users.find(user => user.id === id);
    if (!user) return null;
    Object.assign(user, updateUserDto);
    return user;
  }

  async filterByDomain(domain: string): Promise<{ id: number; name: string; email: string }[]> {
    return this.users.filter(user => user.email.endsWith(`@${domain}`));
  }
}