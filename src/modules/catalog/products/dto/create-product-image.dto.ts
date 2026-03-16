import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator'

export class CreateProductImageDto {

  @IsString()
  url: string

  @IsOptional()
  @IsNumber()
  position?: number

  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean
}