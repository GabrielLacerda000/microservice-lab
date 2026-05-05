import { Controller, Get, Param, Post } from '@nestjs/common';
import { DlqService } from './dlq.service';

@Controller('dlq')
export class DlqController {
  constructor(private readonly dlqService: DlqService) {}

  @Get(':queue')
  getQueueInfo(@Param('queue') queue: string) {
    return this.dlqService.getQueueInfo(queue);
  }

  @Post(':queue/reprocess')
  reprocessOne(@Param('queue') queue: string) {
    return this.dlqService.reprocessOne(queue);
  }
}
