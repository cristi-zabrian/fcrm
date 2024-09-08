import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UserService } from './user.service';
import { User } from './user.entity';
import { SEQUELIZE_TOKEN } from '../core/constants';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

describe('UserService', () => {
  let service: UserService;
  let sequelizeMock: Sequelize;

  const findOneMock = jest.fn();
  const createMock = jest.fn();
  const findAllMock = jest.fn();

  beforeEach(async () => {
    sequelizeMock = {
      models: {
        User: {
          findOne: findOneMock,
          create: createMock,
          findAll: findAllMock,
        },
      },
    } as unknown as Sequelize;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: SEQUELIZE_TOKEN,
          useValue: sequelizeMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should throw ConflictException if user with email already exists', async () => {
      findOneMock.mockResolvedValueOnce({} as User);

      await expect(
        service.createUser('testuser', 'test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);

      expect(findOneMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should create a new user when email is not taken', async () => {
      const newUser = {
        id: 'mocked-uuid',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      } as User;

      findOneMock.mockResolvedValueOnce(null);
      createMock.mockResolvedValueOnce(newUser);

      const result = await service.createUser(
        'testuser',
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(newUser);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(createMock).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('findOne', () => {
    it('should find a user based on the given condition', async () => {
      const user = { id: '1', username: 'testuser' } as User;
      findOneMock.mockResolvedValueOnce(user);

      const result = await service.findOne({ username: 'testuser' });

      expect(result).toEqual(user);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null if no user is found', async () => {
      findOneMock.mockResolvedValueOnce(null);

      const result = await service.findOne({ username: 'nonexistent' });

      expect(result).toBeNull();
      expect(findOneMock).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
    });
  });
});
