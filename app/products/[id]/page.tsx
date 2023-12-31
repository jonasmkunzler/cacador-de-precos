import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import { getProductById } from "@/lib/actions"
import { formatCurrency } from "@/lib/utils";
import { ProductType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: { id: string }
}

const ProductDetails = async ({ params: { id } }: Props) => {
  const product: ProductType = await getProductById(id);

  if(!product) redirect('/')

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image">
          <Link
            href={product.url}
            target="_blank"
          >
            <Image 
              src={product.image}
              alt={product.title}
              width={580}
              height={400}
              className="mx-auto"
              />
            </Link>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <Link
                href={product.url}
                target="_blank"
              >
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image 
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />

                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image 
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image 
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
              {formatCurrency(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
              {formatCurrency(product.originalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex">
                <div className="product-reviews">
                  <Image 
                    src="/assets/icons/timer.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    Número de Atualizações: {product.reviewsCount} 
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard 
                title="Preço Atual"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${formatCurrency(product.currentPrice)}`}
              />
              <PriceInfoCard 
                title="Preço Médio"
                iconSrc="/assets/icons/chart.svg"
                value={`${formatCurrency(product.averagePrice)}`}
              />
              <PriceInfoCard 
                title="Maior Preço"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${formatCurrency(product.highestPrice)}`}
              />
              <PriceInfoCard 
                title="Menor Preço"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${formatCurrency(product.lowestPrice)}`}
              />
            </div>
          </div>

          <Modal productId={id} />
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>

          <div className="flex flex-col gap-4">
            {product?.description?.split('\n')}
          </div>
        </div>

        <Link href="/" className="text-base text-white">
          <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
            <Image 
              src="/assets/icons/bag.svg"
              alt="check"
              width={22}
              height={22}
            />

              Voltar
          </button>
        </Link>
      </div>
    </div>
  )
}

export default ProductDetails