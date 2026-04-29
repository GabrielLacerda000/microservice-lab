import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  readonly userId: string;

  @IsUUID()
  readonly planId: string;
}
