import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ok when the database responds', async () => {
    const service = new HealthService(
      {
        getOrThrow: (key: string) => ({
          'app.name': 'glondia-backend',
          'app.nodeEnv': 'test'
        })[key]
      } as never,
      {
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }])
      } as never
    );

    await expect(service.getHealth()).resolves.toMatchObject({
      status: 'ok',
      app: 'glondia-backend',
      environment: 'test',
      dependencies: {
        database: 'up',
        redis: 'configured'
      }
    });
  });
});
