import { IsString, IsOptional } from 'class-validator';

export class UpdateHotspotNotesDto {
  @IsString() // Allow empty string
  @IsOptional() // Or make it required based on desired behavior
  notes?: string;
}
