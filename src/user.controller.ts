import { UserService } from './user.service';
import { validateUserData } from './common/utils/validation.util';
import { errorHandler } from './common/middlewares/error-handler.middleware';

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = errorHandler(async (createUserDto: { name: string; email: string }) => {
    validateUserData(createUserDto);
    return this.userService.create(createUserDto);
  });

  findAll = errorHandler(async () => {
    return this.userService.findAll();
  });

  delete = errorHandler(async (id: number): Promise<boolean> => {
    return this.userService.delete(id);
  });

  update = errorHandler(async (id: number, updateUserDto: { name: string; email: string }) => {
    validateUserData(updateUserDto);
    return this.userService.update(id, updateUserDto);
  });
}