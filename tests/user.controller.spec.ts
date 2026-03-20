import { UserController } from '../src/user.controller';
import { UserService } from '../src/user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    userController = new UserController(userService);
  });

  it('should create a user and return the created user data', async () => {
    const createUserDto = { name: 'Eddie', email: 'eddie@example.com' };

    jest.spyOn(userService, 'create').mockImplementation(() => Promise.resolve({
        id: 1,
        ...createUserDto,
    }));

    const result = await userController.create(createUserDto);
    expect(result).toEqual({
      id: 1,
      name: 'Eddie',
      email: 'eddie@example.com',
    });
  });

  it('should get all users', async () => {
    jest.spyOn(userService, 'findAll').mockImplementation(() => Promise.resolve([
      { id: 1, name: 'Eddie', email: 'eddie@example.com' },
    ]));

    const result = await userController.findAll();
    expect(result).toEqual([
      { id: 1, name: 'Eddie', email: 'eddie@example.com' },
    ]);
  });
});