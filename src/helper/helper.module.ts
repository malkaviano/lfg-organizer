import { Module } from '@nestjs/common';

import { DateTimeHelper } from '@/helper/datetime.helper';

@Module({
  providers: [DateTimeHelper],
  exports: [DateTimeHelper],
})
export class HelperModule {}
