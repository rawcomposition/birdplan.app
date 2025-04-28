import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Re-define TargetListItem with validation for nested use
// Matches the class in target-list.entity.ts
class TargetListItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  percent: number;

  @IsNumber()
  @IsNotEmpty()
  percentYr: number;
}

// DTO for PATCH requests to create/update a TargetList
export class UpsertTargetListDto {
  // type is determined by the route, not sent in body

  // hotspotId might be sent for hotspot targets,
  // could also be inferred from route param potentially
  @IsOptional()
  @IsString()
  hotspotId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetListItemDto)
  items: TargetListItemDto[];

  @IsInt()
  @IsNotEmpty()
  N: number;

  @IsInt()
  @IsNotEmpty()
  yrN: number;
}

// DTO for setting notes on the Trip document
export class SetTargetNotesDto {
  @IsString() // speciesCode
  @IsNotEmpty()
  key: string;

  @IsString() // The note content
  @IsOptional() // Allow unsetting notes
  value?: string;
}

// DTO for adding/removing star from Trip document
export class TargetStarDto {
  @IsString()
  @IsNotEmpty()
  code: string; // speciesCode
}
