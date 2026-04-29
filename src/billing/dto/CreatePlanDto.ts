import { IsIn, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  readonly name: string;

  @IsInt()
  @Min(1)
  readonly price: number;

  @IsIn(['monthly', 'yearly'])
  readonly interval: 'monthly' | 'yearly';
}
