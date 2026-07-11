import { Controller, Get, Param } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(':slug')
  getStatus(@Param('slug') slug: string) {
    return this.statusService.getStatus(slug);
  }
}
