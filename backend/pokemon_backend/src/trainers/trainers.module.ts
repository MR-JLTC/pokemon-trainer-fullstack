import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { Trainer } from './entities/trainer.entity'; // Import your Trainer entity

@Module({
  imports: [TypeOrmModule.forFeature([Trainer])], // Register the Trainer entity for this module
  controllers: [TrainersController],
  providers: [TrainersService],
})
export class TrainersModule {}
