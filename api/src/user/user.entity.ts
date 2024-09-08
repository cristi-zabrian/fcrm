import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Default,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Column
  username: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;
}
