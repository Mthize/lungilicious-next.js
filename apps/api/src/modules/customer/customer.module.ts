import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { AddressController } from './address.controller.js';
import { AddressService } from './address.service.js';
import { CustomerService } from './customer.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AddressController],
  providers: [CustomerService, AddressService],
  exports: [CustomerService, AddressService],
})
export class CustomerModule {}
