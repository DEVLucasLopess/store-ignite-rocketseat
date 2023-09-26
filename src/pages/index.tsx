import { HomeContainer, Product } from '@/styles/Pages/home'
import Image from 'next/image'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

import { format } from 'date-fns';

import { priceFormatter } from '@/utils/formatter';

import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { GetServerSideProps } from 'next'

interface ProductsType {
  products: {
    id: string,
    name: string,
    imageUrl: string,
    price: number,
  }[]
}

export default function Home({ products }: ProductsType) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  })

  return (
    <>
      <HomeContainer ref={sliderRef} className='keen-slider'>
        {products.map(productInfo => {
          return (
            <Product key={productInfo.id} className='keen-slider__slide'>
              <Image src={productInfo.imageUrl} width={520} height={480} alt="" />

              <footer>
                <strong>{productInfo.name}</strong>
                <span>{priceFormatter.format(productInfo.price)}</span>
              </footer>
            </Product>
          );
        })},
        </HomeContainer>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  })

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price

    type priceType = {
      price: number | null
    }

    if (price !== null) {
      if (price.unit_amount !== null) {
        return {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          price: price.unit_amount / 100,
        }
      } else {
        return {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          price: 'Indisponivel',
        }
      }
    }
  })

  return {
    props: {
      products
    }
  }
}