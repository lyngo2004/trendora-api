import { IsString, IsOptional, IsNumber } from 'class-validator'

export class CreateProductVariantDto {

  @IsString()
  size: string

  @IsString()
  color: string

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsNumber()
  stock?: number
}