import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('me')
export class MeController {
  @Get()
  me(@CurrentUser() _user: unknown) {
    throw new NotImplementedException('Profile endpoint not yet implemented');
  }
}
