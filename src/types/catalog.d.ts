export interface Category {
  id: number
  name: string
  slug: string

  parentId?: number | null

  createdAt: Date
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string | null
  price: number
  sku?: string | null

  categoryId: number

  createdAt: Date
}

export interface ProductVariant {
  id: number
  size: string
  color: string

  sku?: string | null
  price?: number | null
  stock: number

  productId: number

  createdAt: Date
}

export interface ProductImage {
  id: number
  url: string

  position: number
  isThumbnail: boolean

  productId: number

  createdAt: Date
}