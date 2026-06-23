import { IsString, IsInt, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  planId: string;

  @IsInt()
  @IsIn([2, 10, 11, 12, 13])
  paymentMethod: number;
}
