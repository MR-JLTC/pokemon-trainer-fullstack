import {
  IsString,
  IsEmail,
  IsDateString,
  IsMobilePhone,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateTrainerDto {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsDateString()
  birthday: string; // Use string for DTO input and convert to Date in service

  @IsString()
  @IsMobilePhone('en-PH') // Assuming Philippine mobile numbers, adjust as needed
  @Length(10, 15) // Common length for mobile numbers
  mobileNumber: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  favoriteColor?: string; // Made optional as per entity's nullable: true
}
