import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AuditService {
  log(): Promise<void> {
    throw new NotImplementedException('Audit logging not yet implemented');
  }

  logLogin(): Promise<void> {
    throw new NotImplementedException('Audit logging not yet implemented');
  }

  logSensitiveAction(): Promise<void> {
    throw new NotImplementedException('Audit logging not yet implemented');
  }
}
