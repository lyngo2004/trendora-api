import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

import { CreateProductImageDto } from './create-product-image.dto'
import { CreateProductVariantDto } from './create-product-variant.dto'

export class CreateProductDto {

  @IsString()
  name: string

  @IsString()
  slug: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  price: number

  @IsOptional()
  @IsString()
  sku?: string

  @IsNumber()
  categoryId: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[]
}