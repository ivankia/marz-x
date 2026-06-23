import { Injectable, NotFoundException } from '@nestjs/common';
import * as plansConfig from '../../config/plans.json';

export interface Plan {
  id: string;
  name: { ru: string; en: string };
  price: number;
  currency: string;
  durationDays: number;
  dataLimitGB: number | null;
  popular: boolean;
  features: { ru: string[]; en: string[] };
}

@Injectable()
export class PlansService {
  private plans: Plan[] = plansConfig.plans as Plan[];

  getAll(): Plan[] {
    return this.plans;
  }

  getById(id: string): Plan {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) throw new NotFoundException(`Plan "${id}" not found`);
    return plan;
  }

  getDataLimitBytes(plan: Plan): number {
    if (!plan.dataLimitGB) return 0; // 0 = unlimited in Marzban
    return plan.dataLimitGB * 1024 * 1024 * 1024;
  }
}
