import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, type PrismaTransactionClient } from '../../common/database/prisma.service.js';
import type { CreateAddressDto } from './dto/create-address.dto.js';
import type { UpdateAddressDto } from './dto/update-address.dto.js';

const customerAddressSelect = {
  id: true,
  customerId: true,
  label: true,
  firstName: true,
  lastName: true,
  line1: true,
  line2: true,
  city: true,
  province: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CustomerAddressRecord = {
  id: string;
  customerId: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async listAddresses(userId: string): Promise<CustomerAddressRecord[]> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
          select: customerAddressSelect,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return customer.addresses as CustomerAddressRecord[];
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<CustomerAddressRecord> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: {
        id: true,
        _count: { select: { addresses: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const shouldBeDefault = dto.isDefault || customer._count.addresses === 0;

    const address = await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: customer.id },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          customerId: customer.id,
          label: dto.label ?? 'Address',
          firstName: dto.firstName,
          lastName: dto.lastName,
          line1: dto.line1,
          line2: dto.line2,
          city: dto.city,
          province: dto.province,
          postalCode: dto.postalCode,
          country: dto.country,
          isDefault: shouldBeDefault,
        },
        select: customerAddressSelect,
      });
    });

    return address as CustomerAddressRecord;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<CustomerAddressRecord> {
    const address = await this.getOwnedAddress(userId, addressId);

    const updatedAddress = await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      if (dto.isDefault === true) {
        await tx.customerAddress.updateMany({
          where: {
            customerId: address.customerId,
            id: { not: addressId },
          },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.update({
        where: { id: addressId },
        data: {
          ...(dto.label !== undefined ? { label: dto.label } : {}),
          ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          ...(dto.line1 !== undefined ? { line1: dto.line1 } : {}),
          ...(dto.line2 !== undefined ? { line2: dto.line2 } : {}),
          ...(dto.city !== undefined ? { city: dto.city } : {}),
          ...(dto.province !== undefined ? { province: dto.province } : {}),
          ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
          ...(dto.country !== undefined ? { country: dto.country } : {}),
          ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
        },
        select: customerAddressSelect,
      });
    });

    return updatedAddress as CustomerAddressRecord;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getOwnedAddress(userId, addressId);
    const addresses = await this.prisma.customerAddress.findMany({
      where: { customerId: address.customerId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, isDefault: true },
    });

    if (addresses.length <= 1) {
      throw new BadRequestException('Cannot delete the last remaining address');
    }

    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.customerAddress.delete({
        where: { id: addressId },
      });

      if (address.isDefault) {
        const nextAddress = addresses.find(
          (item: { id: string; isDefault: boolean }) => item.id !== addressId,
        );

        if (nextAddress) {
          await tx.customerAddress.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });
  }

  private async getOwnedAddress(
    userId: string,
    addressId: string,
  ): Promise<CustomerAddressRecord> {
    const address = await this.prisma.customerAddress.findUnique({
      where: { id: addressId },
      select: {
        ...customerAddressSelect,
        customer: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.customer.userId !== userId) {
      throw new ForbiddenException('Cannot access this address');
    }

    const { customer, ...ownedAddress } = address;
    return ownedAddress as CustomerAddressRecord;
  }
}
