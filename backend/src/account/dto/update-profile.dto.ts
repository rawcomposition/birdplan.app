import { IsString, IsArray, IsOptional, IsDate } from 'class-validator';

// DTO for PATCH /my-profile
export class UpdateProfileDto {
  // Client sends scientific names, backend will convert
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifelistSci?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exceptions?: string[]; // Assuming these are speciesCodes already

  @IsOptional()
  @IsString()
  dismissedNoticeId?: string;

  // Add other potentially updateable fields if needed
  @IsOptional()
  @IsString()
  name?: string;
}

// We might not need a specific CreateProfileDto if creation
// is handled internally within the GET /my-profile logic.
