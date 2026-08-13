import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  getUserByAccount(account: string) {
    return this.userRepository.findByAccount(account);
  }

  getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
