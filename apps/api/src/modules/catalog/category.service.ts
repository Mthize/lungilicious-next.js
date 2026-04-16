import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicCategoryTreeNode = PublicCategory & {
  children: PublicCategoryTreeNode[];
};

const publicCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  parentId: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PublicCategory[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: publicCategorySelect,
    }) as Promise<PublicCategory[]>;
  }

  async getTree(): Promise<PublicCategoryTreeNode[]> {
    const categories = await this.findAll();
    const grouped = new Map<string | null, PublicCategory[]>();

    for (const category of categories) {
      const siblings = grouped.get(category.parentId) ?? [];
      siblings.push(category);
      grouped.set(category.parentId, siblings);
    }

    const buildTree = (parentId: string | null): PublicCategoryTreeNode[] => {
      const children = grouped.get(parentId) ?? [];

      return children.map((category) => ({
        ...category,
        children: buildTree(category.id),
      }));
    };

    return buildTree(null);
  }

  adminCreate(dto: CreateCategoryDto): Promise<PublicCategory> {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        parentId: dto.parentId,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
      select: publicCategorySelect,
    }) as Promise<PublicCategory>;
  }

  adminUpdate(id: string, dto: UpdateCategoryDto): Promise<PublicCategory> {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      select: publicCategorySelect,
    }) as Promise<PublicCategory>;
  }

  async adminDelete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
