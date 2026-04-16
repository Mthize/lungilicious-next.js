import { Body, Controller, Get, Patch, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CustomerService } from '../customer/customer.service.js';
import {
  parseUpdateProfileDto,
  type UpdateProfileDto,
} from '../customer/dto/update-profile.dto.js';

@Controller('me')
export class MeController {
  constructor(private readonly customers: CustomerService) {}

  @Get()
  me(@CurrentUser('id') userId: string) {
    return this.customers.getProfile(userId);
  }

  @Patch()
  update(
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) body: UpdateProfileDto,
  ) {
    return this.customers.updateProfile(userId, parseUpdateProfileDto(body));
  }
}
