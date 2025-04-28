import { IsString, IsOptional } from 'class-validator';

export class UpdateMarkerNotesDto {
  @IsString() // Allow empty string
  @IsOptional()
  notes?: string;
}
