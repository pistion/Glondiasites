import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RenderDeploy {
  id: string;
  status?: string;
  commit?: {
    id?: string;
    message?: string;
  };
}

@Injectable()
export class RenderService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return this.getApiKey().length > 0;
  }

  async listServices() {
    return this.request('/services');
  }

  async triggerDeploy(serviceId: string): Promise<RenderDeploy> {
    const response = await this.request(`/services/${encodeURIComponent(serviceId)}/deploys`, {
      method: 'POST',
      body: JSON.stringify({})
    });

    return response as RenderDeploy;
  }

  async getDeploy(serviceId: string, deployId: string): Promise<RenderDeploy> {
    return this.request(`/services/${encodeURIComponent(serviceId)}/deploys/${encodeURIComponent(deployId)}`) as Promise<RenderDeploy>;
  }

  private async request(path: string, init: RequestInit = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('Render API key is not configured.');
    }

    const response = await fetch(`${this.config.getOrThrow<string>('RENDER_API_BASE_URL')}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...init.headers
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ServiceUnavailableException(payload?.message || `Render API request failed with ${response.status}.`);
    }

    return payload;
  }

  private getApiKey() {
    return this.config.get<string>('RENDER_API_KEY') ?? '';
  }
}
