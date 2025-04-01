import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeHelper {
  public timestamp(): string {
    return new Date().toISOString();
  }
}
