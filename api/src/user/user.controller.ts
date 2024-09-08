import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Param,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiResponse, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/response-user.dto';

@ApiTags('users')
@ApiExtraModels(CreateUserDto)
@Controller('api/v1')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('add-user')
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const { username, email, password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUser(
      username,
      email,
      hashedPassword,
    );

    delete user.password;

    return user;
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body;
    const user = await this.usersService.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'Logged in',
      id: user.id,
      token: jwt,
    };
  }

  @Get('get-user/:id')
  async getUser(@Param('id') id: string, @Req() request: Request) {
    const cookie = request.cookies['jwt'];

    if (!cookie) {
      throw new UnauthorizedException();
    }

    await this.jwtService.verifyAsync(cookie);

    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;

    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { message: 'Logged out' };
  }
}
