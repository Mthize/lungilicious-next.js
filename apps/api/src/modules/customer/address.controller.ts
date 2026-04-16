import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AddressService } from './address.service.js';
import {
  parseCreateAddressDto,
  type CreateAddressDto,
} from './dto/create-address.dto.js';
import {
  parseUpdateAddressDto,
  type UpdateAddressDto,
} from './dto/update-address.dto.js';

@Controller('me/addresses')
export class AddressController {
  constructor(private readonly addresses: AddressService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.addresses.listAddresses(userId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) body: CreateAddressDto,
  ) {
    return this.addresses.createAddress(userId, parseCreateAddressDto(body));
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body(ValidationPipe) body: UpdateAddressDto,
  ) {
    return this.addresses.updateAddress(userId, addressId, parseUpdateAddressDto(body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    await this.addresses.deleteAddress(userId, addressId);
  }
}
