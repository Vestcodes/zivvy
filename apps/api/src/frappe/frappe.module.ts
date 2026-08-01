import { Module, Global } from '@nestjs/common';
import { FrappeService } from './frappe.service';

@Global()
@Module({
  providers: [FrappeService],
  exports: [FrappeService],
})
export class FrappeModule {}
