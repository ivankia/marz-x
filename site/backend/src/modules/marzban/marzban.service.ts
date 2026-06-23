import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

interface MarzbanNode {
  id: number;
  name: string;
  address: string;
  port: number;
  status: string;
  message: string | null;
}

interface MarzbanUserData {
  username: string;
  subscription_url: string;
  status: string;
  data_limit: number;
  expire: number | null;
  used_traffic: number;
  data_limit_reset_strategy: string;
}

@Injectable()
export class MarzbanService implements OnModuleInit {
  private readonly logger = new Logger(MarzbanService.name);
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get('MARZBAN_API_URL'),
      timeout: 15000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
  }

  async onModuleInit() {
    try {
      await this.authenticate();
    } catch (err) {
      this.logger.warn(`Marzban initial auth failed: ${err.message}`);
    }
  }

  async authenticate() {
    const params = new URLSearchParams({
      username: this.config.get('MARZBAN_USERNAME') as string,
      password: this.config.get('MARZBAN_PASSWORD') as string,
    });

    const res = await axios.post(
      `${this.config.get('MARZBAN_API_URL')}/api/admin/token`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      },
    );

    this.accessToken = res.data.access_token;
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // refresh 5 min before expiry
    this.logger.log('Marzban authenticated');
  }

  private async ensureToken() {
    if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      await this.authenticate();
    }
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  async getNodes(): Promise<MarzbanNode[]> {
    await this.ensureToken();
    const res = await this.http.get('/api/nodes', { headers: this.authHeaders() });
    return res.data;
  }

  async createUser(username: string, dataLimitBytes: number, expireTimestamp: number): Promise<MarzbanUserData> {
    await this.ensureToken();
    const res = await this.http.post(
      '/api/user',
      {
        username,
        proxies: { vless: {}, vmess: {}, trojan: {}, shadowsocks: {} },
        data_limit: dataLimitBytes,
        expire: expireTimestamp,
        data_limit_reset_strategy: 'no_reset',
        status: 'active',
      },
      { headers: this.authHeaders() },
    );
    return res.data;
  }

  async updateUser(username: string, dataLimitBytes: number, expireTimestamp: number): Promise<MarzbanUserData> {
    await this.ensureToken();
    const res = await this.http.put(
      `/api/user/${username}`,
      {
        data_limit: dataLimitBytes,
        expire: expireTimestamp,
        status: 'active',
      },
      { headers: this.authHeaders() },
    );
    return res.data;
  }

  async getUser(username: string): Promise<MarzbanUserData | null> {
    await this.ensureToken();
    try {
      const res = await this.http.get(`/api/user/${username}`, { headers: this.authHeaders() });
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  async disableUser(username: string) {
    await this.ensureToken();
    await this.http.put(
      `/api/user/${username}`,
      { status: 'disabled' },
      { headers: this.authHeaders() },
    );
  }
}
