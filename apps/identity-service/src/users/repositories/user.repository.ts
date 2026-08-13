import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByAccount(account: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: account }, { email: account }, { phoneNumber: account }],
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }
}
