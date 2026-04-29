import { Injectable } from '@nestjs/common';
import { db } from '../database/connection';
import { usersTable } from './database/schema';
import { EventBus } from '../infrastructure/messaging/event-bus';
import { UserCreatedEvent } from '../contracts/events/user-created.event';
import { CreateUserDto } from './dto/CreateUserDto';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly eventBus: EventBus) {}

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return user ?? null;
  }

  async create(data: CreateUserDto) {
    const user = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      createdAt: new Date(),
    };

    await db.insert(usersTable).values(user);

    const event: UserCreatedEvent = { ...user };
    await this.eventBus.publish('user.created', event);

    return user;
  }
}
