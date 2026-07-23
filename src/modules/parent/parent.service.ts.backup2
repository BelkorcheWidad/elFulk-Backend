import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { auth } from '../../auth';
import { Parent } from './parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private readonly repo: Repository<Parent>,
  ) {}

  async findById(id: string): Promise<Parent> {
    const parent = await this.repo.findOne({ where: { id } });
    if (!parent) {
      throw new NotFoundException(`Parent with id ${id} not found`);
    }
    return parent;
  }

  async findByUserId(userId: string): Promise<Parent> {
    const parent = await this.repo.findOne({ where: { userId } });
    if (!parent) {
      throw new NotFoundException(`Parent with user id ${userId} not found`);
    }
    return parent;
  }

  async findByEmail(email: string): Promise<Parent | null> {
    return await this.repo
      .createQueryBuilder('parent')
      .addSelect('parent.password_hash')
      .addSelect('parent.pin_hash')
      .where('parent.email = :email', { email })
      .getOne();
  }

  async create(dto: CreateParentDto): Promise<Parent> {
    const { user } = await auth.api.signUpEmail({
      email: dto.email,
      password: dto.password,
      name: dto.username,
      data: {
        username: dto.username,
        phone_number: dto.phone_number,
      },
    });

    const parent = this.repo.create({
      ...dto,
      userId: user.id,
      password_hash: undefined as never,
    });
    return await this.repo.save(parent);
  }

  async update(id: string, partial: UpdateParentDto): Promise<Parent> {
    const parent = await this.findById(id);
    Object.assign(parent, partial);
    return await this.repo.save(parent);
  }

  private hashPin(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex');
  }

  async activatePin(id: string, pin: string): Promise<{ message: string }> {
    const parent = await this.repo
      .createQueryBuilder('parent')
      .addSelect('parent.pin_hash')
      .where('parent.id = :id', { id })
      .getOne();

    if (!parent) {
      throw new NotFoundException(`Parent with id ${id} not found`);
    }

    if (parent.pin_activated) {
      throw new BadRequestException('Parent mode is already activated');
    }

    parent.pin_hash = this.hashPin(pin);
    parent.pin_activated = true;
    await this.repo.save(parent);

    return { message: 'Parent mode activated successfully' };
  }

  async verifyPin(id: string, pin: string): Promise<boolean> {
    const parent = await this.repo
      .createQueryBuilder('parent')
      .addSelect('parent.pin_hash')
      .where('parent.id = :id', { id })
      .getOne();

    if (!parent) {
      throw new NotFoundException(`Parent with id ${id} not found`);
    }

    if (!parent.pin_activated || !parent.pin_hash) {
      throw new BadRequestException(
        'Parent mode is not activated. Please set a PIN first.',
      );
    }

    const matches = parent.pin_hash === this.hashPin(pin);
    if (!matches) {
      throw new UnauthorizedException('Invalid PIN');
    }

    return true;
  }
}
