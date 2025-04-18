import { Test, TestingModule } from '@nestjs/testing';
import { IdHelper } from './id.helper';

describe('IdHelper', () => {
  let service: IdHelper;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdHelper],
    }).compile();

    service = module.get<IdHelper>(IdHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('newId', () => {
    it('returns UUID', () => {
      expect(service.newId()).toMatch(uuidRegex);
    });
  });
});
