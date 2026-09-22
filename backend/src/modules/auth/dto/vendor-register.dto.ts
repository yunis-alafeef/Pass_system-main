import { IsNotEmpty, IsString } from 'class-validator';

export class VendorRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
