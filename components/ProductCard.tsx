import { formatCurrency } from '@/lib/utils';
import { ProductType } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

interface Props {
  product: ProductType;
}
 
const ProductCard = ({ product }: Props) => {
  return (
    <Link href={`/products/${product._id}`} className="product-card border-2">
      <div className="product-card_img-container">
        <Image 
          src={product.image}
          alt={product.title}
          width={140}
          height={140}
          className="product-card_img"
        />
      </div>

      <div className="flex flex-col small-text gap-3 border-t-2">
        <h4 className="product-title">{product.title}</h4>

        <div className="flex justify-between">
          <p className="text-black opacity-50 text-lg capitalize">
            {product.category}
          </p>

          <p className="text-black text-lg font-semibold">
            <span>{formatCurrency(product?.currentPrice)}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard