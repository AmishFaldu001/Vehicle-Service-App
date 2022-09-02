import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDetailsDto } from './dto/login-details.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  private async checkUserExists(userDetails: { email: string }): Promise<void> {
    const userExists = await this.userRepo.findOne({ where: userDetails });
    if (userExists?.id) {
      throw new BadRequestException('User with this email already exists');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    await this.checkUserExists({ email: createUserDto.email });

    createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    return user;
  }

  async login(loginDetails: LoginDetailsDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: loginDetails.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid login details');
    }

    const doesPasswordMatch = await bcrypt.compare(
      loginDetails.password,
      user.password,
    );
    if (!doesPasswordMatch) {
      throw new BadRequestException('Invalid login details');
    }

    return { token: user.password };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Invalid user details');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    if (updateUserDto?.email) {
      await this.checkUserExists({ email: updateUserDto.email });
    }

    let user = await this.userRepo.findOne({ where: { id } });
    user = { ...user, ...updateUserDto };
    await this.userRepo.save(user);

    return user;
  }

  async remove(id: string): Promise<MessageResponseDto> {
    const result = await this.userRepo.delete({ id });
    if (result.affected <= 0) {
      throw new BadRequestException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
