import { Test, TestingModule } from '@nestjs/testing';

import { DateTimeHelper } from '@/helper/datetime.helper';

describe('DatetimeService', () => {
  let service: DateTimeHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateTimeHelper],
    }).compile();

    service = module.get<DateTimeHelper>(DateTimeHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('timestamp', () => {
    it('generate in ISO format', () => {
      const result = service.timestamp();

      expect(result).toContain('Z');
    });
  });
});
