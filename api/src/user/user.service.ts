import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
import { SEQUELIZE_TOKEN } from '../core/constants';

@Injectable()
export class UserService {
  constructor(@Inject(SEQUELIZE_TOKEN) private readonly sequelize: Sequelize) {}

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.sequelize.models.User.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return (await this.sequelize.models.User.create({
      id: uuidv4(),
      username,
      email,
      password,
    })) as User;
  }

  async findOne(condition: any): Promise<User | null> {
    return (await this.sequelize.models.User.findOne({
      where: condition,
    })) as User | null;
  }
}
