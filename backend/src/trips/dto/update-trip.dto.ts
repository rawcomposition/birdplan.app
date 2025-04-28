import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

// Placeholder DTO - Validation will be added later
// Based on frontend/app/api/v1/trips/[id]/route.ts BodyT
export class UpdateTripDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  startMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  endMonth?: number;

  // Add other updateable fields as needed (e.g., isPublic)
  // @IsOptional()
  // @IsBoolean()
  // isPublic?: boolean;
}
