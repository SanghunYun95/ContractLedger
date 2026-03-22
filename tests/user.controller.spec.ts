import { UserController } from '../src/user.controller';
import { UserService } from '../src/user.service';

describe('UserController - Additional Operations', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    userController = new UserController(userService);
  });

  it('should delete a user and return success', async () => {
    jest.spyOn(userService, 'delete').mockImplementation(() => Promise.resolve(true));

    const result = await userController.delete(1);
    expect(result).toBe(true);
  });

  it('should update a user and return updated data', async () => {
    const updateUserDto = { name: 'Updated Name', email: 'updated@example.com' };

    jest.spyOn(userService, 'update').mockImplementation(() => Promise.resolve({
      id: 1,
      ...updateUserDto,
    }));

    const result = await userController.update(1, updateUserDto);
    expect(result).toEqual({
      id: 1,
      name: 'Updated Name',
      email: 'updated@example.com',
    });
  });
});