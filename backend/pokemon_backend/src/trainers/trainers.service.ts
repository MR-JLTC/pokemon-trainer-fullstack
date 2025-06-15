import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Trainer } from './entities/trainer.entity'; // Ensure this path is correct

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const newTrainer = this.trainersRepository.create(createTrainerDto);
    return this.trainersRepository.save(newTrainer);
  }

  async findAll(): Promise<Trainer[]> {
    return this.trainersRepository.find();
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOneBy({ id });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }
    return trainer;
  }

  async update(
    id: number,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const trainer = await this.findOne(id);
    Object.assign(trainer, updateTrainerDto);
    return this.trainersRepository.save(trainer);
  }

  async remove(id: number): Promise<void> {
    const result = await this.trainersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Trainer with ID ${id} not found for deletion`,
      );
    }
  }
}
