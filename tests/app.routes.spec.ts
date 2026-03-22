import { AppRoutes } from '../src/app.routes';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';

describe('AppRoutes - Role-Based API Tests', () => {
  it('should grant access to /admin for admin', () => {
    const req = {
      user: { role: 'admin' },
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response> as Response;

    const adminRoute = AppRoutes.find(route => route.path === '/admin');
    if (!adminRoute) throw new Error('Route not found');

    adminRoute.handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should deny access to /admin for non-admin', () => {
    const req = {
      user: { role: 'user' },
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response> as Response;

    const adminRoute = AppRoutes.find(route => route.path === '/admin');
    if (!adminRoute) throw new Error('Route not found');

    adminRoute.handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Permission Denied: Insufficient Role' });
  });

  it('should grant access to /user for any role', () => {
    const req = {
      user: { role: 'user' },
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
    } as Partial<Request> as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response> as Response;

    const userRoute = AppRoutes.find(route => route.path === '/user');
    if (!userRoute) throw new Error('Route not found');

    userRoute.handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});