/* import { IsString, IsNumber, column, IsOptional } from 'class-validator';

export class User {
  @IsString()
  mobileNumber: string;

  @IsString()
  language: string;

  @IsString()
  Botid: string;
  
  @IsString()
  selectedState: string;

  @Column({ default: 0 }) // Default count is 0
  buttonClickCount: number;
} */
  import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';  // Import from TypeORM
  import { IsString, IsNumber, IsOptional } from 'class-validator';   // Import from class-validator
  
  @Entity('users') // Define the entity for the users table
  export class User {
    @IsString() // Validation for mobileNumber (must be a string)
    @Column()  // Define the column in the database
    mobileNumber: string;
  
    @IsString() // Validation for language (must be a string)
    @Column()  // Define the column in the database
    language: string;
  
    @IsString() // Validation for Botid (must be a string)
    @Column()  // Define the column in the database
    Botid: string;
  
    @IsString() // Validation for selectedState (must be a string)
    @Column()  // Define the column in the database
    selectedState: string;
  
    @IsNumber() // Validation for buttonClickCount (must be a number)
    @Column({ default: 0 }) // Column with a default value of 0
    buttonClickCount: number;

    @IsString() // Validation for feedback (optional string)
  @IsOptional()
  @Column({ nullable: true }) // Column can be null
  feedback?: string; // Optional feedback field
  }
  