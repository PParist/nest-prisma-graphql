import { Test, TestingModule } from '@nestjs/testing';
import { LocalCacheService } from './local-cache.service';

describe('LocalCacheService ', () => {
  let service: LocalCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCacheService,
        {
          provide: 'LOCAL_CACHE_PORT',
          useValue: 6379,
        },
      ],
    }).compile();

    service = module.get<LocalCacheService>(LocalCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
