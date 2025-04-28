import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HotspotFav } from '../../trips/entities/trip.entity';

// Export the nested DTO
export class HotspotFavDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  range?: string;

  @IsOptional()
  @IsNumber()
  percent?: number;
}

// DTO for adding/updating a hotspot within a trip
export class HotspotDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  species?: number;

  // targetsId is likely managed internally, not provided by client directly

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotspotFavDto)
  favs?: HotspotFavDto[];
}
