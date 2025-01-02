
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


    @IsNumber() // Validation for Botid (must be a string)
    @Column()  // Define the column in the database
    YearButtonCount: number;

  
    @IsString() // Validation for selectedState (must be a string)
    @Column()  // Define the column in the database
    selectedState: string;
  
  

    @IsNumber() // Validation for buttonClickCount (must be a number)
    @Column({ default: 0 }) // Column with a default value of 0
    seeMoreCount: number;

    @IsNumber() // Validation for buttonClickCount (must be a number)
    @Column({ default: 0 }) // Column with a default value of 0
    applyLinkCount: number;

    // add selected year 
    @IsNumber()
    @Column({ default: 0 }) 
    selectedYear: number;

    @IsString() // Validation for feedback (optional string)
  @IsOptional()
  @Column({ nullable: true }) // Column can be null
  feedback?: string; // Optional feedback field

  @Column({ nullable: true }) // Make it nullable if optional
    previousButtonMessage: string;

  @Column({ nullable: true }) // Make it nullable if optional
  previousButtonMessage1: string;

  }

  
  