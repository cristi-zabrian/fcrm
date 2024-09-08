import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { User } from './user.entity';

jest.mock('bcrypt');

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let responseMock: jest.Mocked<Response>;
  let requestMock: jest.Mocked<Request>;

  beforeEach(async () => {
    userServiceMock = {
      createUser: jest.fn(),
      findOne: jest.fn(),
      findAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    responseMock = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    requestMock = {
      cookies: {},
    } as unknown as jest.Mocked<Request>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should create a new user and return it without the password', async () => {
      const body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedpassword';
      const createdUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
      } as User;

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userServiceMock.createUser.mockResolvedValue(createdUser);

      const result = await controller.create(body);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        hashedPassword,
      );
      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if credentials are invalid', async () => {
      const body = { email: 'test@example.com', password: 'password123' };

      userServiceMock.findOne.mockResolvedValue(null);

      await expect(controller.login(body, responseMock)).rejects.toThrow(
        BadRequestException,
      );
      expect(userServiceMock.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should log in the user and set a JWT cookie', async () => {
      const body = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
      } as User;
      const jwt = 'mocked-jwt';

      userServiceMock.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue(jwt);

      const result = await controller.login(body, responseMock);

      expect(responseMock.cookie).toHaveBeenCalledWith('jwt', jwt, {
        httpOnly: true,
      });
      expect(result).toEqual({ message: 'Logged in', id: '1', token: jwt });
    });
  });

  describe('getUser', () => {
    it('should throw UnauthorizedException if no JWT is provided', async () => {
      requestMock.cookies.jwt = undefined;

      await expect(controller.getUser('1', requestMock)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if the user is not found', async () => {
      requestMock.cookies.jwt = 'valid-jwt';
      jwtServiceMock.verifyAsync.mockResolvedValue({ id: '1' });
      userServiceMock.findOne.mockResolvedValue(null);

      await expect(controller.getUser('1', requestMock)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return the user without the password', async () => {
      requestMock.cookies.jwt = 'valid-jwt';
      jwtServiceMock.verifyAsync.mockResolvedValue({ id: '1' });
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      } as User;
      userServiceMock.findOne.mockResolvedValue(user);

      const result = await controller.getUser('1', requestMock);

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      });
    });
  });

  describe('logout', () => {
    it('should clear the JWT cookie', async () => {
      const result = await controller.logout(responseMock);

      expect(responseMock.clearCookie).toHaveBeenCalledWith('jwt');
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
