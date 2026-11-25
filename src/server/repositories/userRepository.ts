import { prisma } from '../database/prisma.ts';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}

export const userRepository = new UserRepository();
