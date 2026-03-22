import { AdminController } from './admin/admin.controller';
import { UserController } from './user.controller';
import { RoleMiddleware } from './auth/roles.middleware';
import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService(); // Top-level import moved
const userController = new UserController(userService);

export const AppRoutes = [
  {
    path: '/admin',
    method: 'GET',
    handler: (req: Request, res: Response) => {
      const adminController = new AdminController();

      try {
        if (!req.user || !req.user.role) {
          throw new Error('Unauthenticated User');
        }

        RoleMiddleware(req.user.role, ['admin'], () => {
          if (!req.user) {
  throw new Error('Authentication Failed');
}
const data = adminController.getAdminData(req.user);
          res.status(200).json(data);
        });
      } catch (error) {
        if (error instanceof Error) {
          res.status(403).json({ message: error.message });
        }
      }
    },
  },
  {
    path: '/user',
    method: 'GET',
    handler: (req: Request, res: Response) => {
      try {
        const data = userController.findAll();
        res.status(200).json(data);
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }
    },
  },
];