import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveHotspotFavDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
