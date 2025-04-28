import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString() // Assuming tripId is a string (like UUID or ObjectId)
  @IsNotEmpty()
  tripId: string;

  // Add any other relevant fields, e.g., senderName? Role?
}
