import Searchbar from '@/components/Searchbar'
import { getAllProducts } from '@/lib/actions'
import ProductCard from '@/components/ProductCard'

const Home = async () => {
  const allProducts = await getAllProducts()

  return (
    <>
      <section className="px-6 md:px-20 py-12">
        <div className="justify-center items-center bg-gradient-to-r from-blue-500 to-blue-800 p-8 rounded-xl border-2 text-white">
          <h1 className="head-text">
            Acompanhe a variação de preços dos seus produtos:
          </h1>

          <p className="mt-6">
            Adicionando a URL de um produto dos sites KABUM, PICHAU, TERABYTE e
            AMAZON você passa a receber alertas das variações dos preços deles.
          </p>

          <Searchbar />
        </div>
      </section>

      <section className="trending-section">
        <h2 className="section-text">Produtos rastreados:</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
