import { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(createUserDto: { name: string; email: string }) {
    return this.userService.create(createUserDto);
  }

  async findAll() {
    return this.userService.findAll();
  }
}