import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
} from 'class-validator';

// Placeholder DTO - Validation will be added later
// Based on frontend/lib/types.ts TripInput
export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsInt()
  @Min(0)
  @Max(11) // Assuming 0-11 for months
  startMonth: number;

  @IsInt()
  @Min(0)
  @Max(11)
  endMonth: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // Optional based on schema default
}
