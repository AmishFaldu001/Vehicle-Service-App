import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PublicRoute } from '../common/decorators/public.decorator';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDetailsDto } from './dto/login-details.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @PublicRoute()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @PublicRoute()
  @Post('login')
  login(@Body() login: LoginDetailsDto): Promise<LoginResponseDto> {
    return this.userService.login(login);
  }

  @Get()
  findOne(
    @Req() request: Request & { user?: { id?: string } },
  ): Promise<UserEntity> {
    const userId = request?.user?.id;
    return this.userService.findOne(userId);
  }

  @Patch()
  update(
    @Req() request: Request & { user?: { id?: string } },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const userId = request?.user?.id;
    return this.userService.update(userId, updateUserDto);
  }

  @Delete()
  remove(
    @Req() request: Request & { user?: { id?: string } },
  ): Promise<MessageResponseDto> {
    const userId = request?.user?.id;
    return this.userService.remove(userId);
  }
}
