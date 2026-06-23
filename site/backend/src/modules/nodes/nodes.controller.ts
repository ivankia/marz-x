import { Controller, Get } from '@nestjs/common';
import { NodesService } from './nodes.service';

@Controller('nodes')
export class NodesController {
  constructor(private nodes: NodesService) {}

  @Get('status')
  getStatus(): Promise<any[]> {
    return this.nodes.getStatus();
  }
}
