import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDetailsDto } from './dto/login-details.dto';
import { SendVerifyMailDto } from './dto/send-verify-mail.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyMailDto } from './dto/verify-mail.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private async checkUserExists(userDetails: { email: string }): Promise<void> {
    const userExists = await this.userRepo.findOne({ where: userDetails });
    if (userExists?.id) {
      throw new BadRequestException('User with this email already exists');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    await this.checkUserExists({ email: createUserDto.email });
    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    await this.sendVerificationMail({ email: user.email });
    return user;
  }

  async sendVerificationMail(
    sendVerifyMailData: SendVerifyMailDto,
  ): Promise<MessageResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: sendVerifyMailData.email },
    });

    if (user?.isEmailVerified) {
      throw new BadRequestException(
        'Email is already verified!!. You can now login successfully',
      );
    }

    if (user) {
      const uniqueId = uuidv4();
      const token = await this.jwtService.signAsync({
        uniqueId,
        email: user.email,
      });

      const emailSubject = 'Verify email';
      const emailBody = `Please verify your mail using below details.\nToken: ${token}\nUnique Id: ${uniqueId}`;
      await this.emailService.sendMail(user.email, emailSubject, emailBody);
    }
    return { message: 'Sent verification mail' };
  }

  async verifyMail(
    verifyEmailData: VerifyMailDto,
  ): Promise<MessageResponseDto> {
    const jwtPayload = this.jwtService.decode(verifyEmailData.token) as Record<
      string,
      unknown
    >;
    if (jwtPayload?.uniqueId !== verifyEmailData.uniqueId) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userRepo.findOne({
      where: { email: jwtPayload.email as string },
    });

    if (!user) {
      return { message: 'Invalid verify details' };
    }

    await this.jwtService.verifyAsync(verifyEmailData.token).catch(() => {
      throw new BadRequestException('Invalid token');
    });

    user.isEmailVerified = true;
    await this.userRepo.save(user);
    return { message: 'Successfully verified email' };
  }

  async login(loginDetails: LoginDetailsDto): Promise<MessageResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: loginDetails.email },
    });
    if (!user) {
      return { message: 'Sent mail with login link' };
    }

    if (!user?.isEmailVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    const token = await this.jwtService.signAsync({
      user: { id: user.id, email: user.email },
    });
    const emailSubject = 'Login';
    const emailBody = `Please login using below details.\nToken: ${token}`;
    await this.emailService.sendMail(user.email, emailSubject, emailBody);

    return { message: 'Sent mail with login link' };
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
