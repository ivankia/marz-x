import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarzbanService } from '../marzban/marzban.service';

interface NodeStatus {
  id: number;
  name: string;
  address: string;
  status: 'connected' | 'disconnected' | 'error' | 'unknown';
  message: string | null;
  updatedAt: string;
}

@Injectable()
export class NodesService {
  private readonly logger = new Logger(NodesService.name);
  private cache: NodeStatus[] = [];
  private lastFetched: Date | null = null;

  constructor(private marzban: MarzbanService) {}

  async getStatus(): Promise<NodeStatus[]> {
    if (!this.lastFetched || Date.now() - this.lastFetched.getTime() > 30000) {
      await this.refresh();
    }
    return this.cache;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async refresh() {
    try {
      const nodes = await this.marzban.getNodes();
      this.cache = nodes.map((n) => ({
        id: n.id,
        name: n.name,
        address: n.address,
        status: n.status as NodeStatus['status'],
        message: n.message,
        updatedAt: new Date().toISOString(),
      }));
      this.lastFetched = new Date();
    } catch (err) {
      this.logger.warn(`Node status refresh failed: ${err.message}`);
    }
  }
}
