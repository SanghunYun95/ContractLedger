import { UserService } from '../src/user.service';

describe('UserService - Filter Users', () => {
  let userService: UserService;

  beforeEach(async () => {
    userService = new UserService();
    await userService.create({ name: 'Eddie', email: 'eddie@gmail.com' });
    await userService.create({ name: 'Alice', email: 'alice@yahoo.com' });
    await userService.create({ name: 'Bob', email: 'bob@gmail.com' });
  });

  it('should filter users by email domain', async () => {
    const gmailUsers = await userService.filterByDomain('gmail.com');
    expect(gmailUsers).toHaveLength(2);
    expect(gmailUsers).toEqual([
      { id: 1, name: 'Eddie', email: 'eddie@gmail.com' },
      { id: 3, name: 'Bob', email: 'bob@gmail.com' },
    ]);

    const yahooUsers = await userService.filterByDomain('yahoo.com');
    expect(yahooUsers).toHaveLength(1);
    expect(yahooUsers).toEqual([
      { id: 2, name: 'Alice', email: 'alice@yahoo.com' },
    ]);
  });

  it('should return an empty array if no users match the domain', async () => {
    const users = await userService.filterByDomain('hotmail.com');
    expect(users).toHaveLength(0);
  });
});