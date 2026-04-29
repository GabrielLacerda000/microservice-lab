import { Controller, Post, Body } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreatePlanDto } from './dto/CreatePlanDto';
import { CreateSubscriptionDto } from './dto/CreateSubscriptionDto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('plans')
  createPlan(@Body() body: CreatePlanDto) {
    return this.billingService.createPlan(body);
  }

  @Post('subscriptions')
  createSubscription(@Body() body: CreateSubscriptionDto) {
    return this.billingService.createSubscription(body);
  }
}
