import { ProductContainer, ImageContainer, ProductDatails } from "@/styles/Pages/products"
import { priceFormatter } from '@/utils/formatter';
import { GetStaticPaths, GetStaticProps } from "next"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import { useState } from "react";

interface ProductProps {
    product: {
        id: string,
        name: string,
        imageUrl: string,
        price: number,
        description: string,
        defaultPriceId: string
    }
}

export default function Products({ product }: ProductProps) {
    const [ isCreatingCheckoutSession, setCreatingCheckoutSession ] = useState(false)

    // inserindo o lodar no next
    const { isFallback } = useRouter()

    async function handlebuyProduct() {
        try {
            setCreatingCheckoutSession(true)
            if (!product) throw new Error('Pruduto indefinido');

            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId,
            })

            const { checkoutUrl } = response.data;

            window.location.href = checkoutUrl
        } catch (err) {
            // Conectar com uma ferramenta de observabilidade (Datadog / Sentry)
            setCreatingCheckoutSession(false)
            alert('Falha ao redirecionar o checkout')
        }
    }

    if (isFallback) {return <p>carregando ...</p>}
    if (product !== undefined) {
        return (
            <ProductContainer>
                <ImageContainer>
                    <Image src={product.imageUrl} width={520} height={480} alt="" />
                </ImageContainer>

                <ProductDatails>
                    <h1>{product.name}</h1>

                    <span>{ priceFormatter.format(product.price)}</span>

                    <p>{product.description}</p>
                    <button disabled={isCreatingCheckoutSession} onClick={handlebuyProduct}>
                        Comprar agora
                    </button>
                </ProductDatails>
            </ProductContainer>
        )
    } else {
        return <Link href='/' />
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            {
                params: { id: 'prod_Ofqf2tuxyGZ8E7' },
            }
        ],
        fallback: true
    }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    try {
      if (!params) throw new Error('Params are undefined');
  
      const productId = params.id;
      const product = await stripe.products.retrieve(productId, {
        expand: ['default_price'],
      });

      const price = product.default_price as Stripe.Price;
      if (!price || !price.unit_amount) throw new Error('Price is missing');
  
      return {
        props: {
          product: {
            id: product.id,
            name: product.name,
            imageUrl: product.images[0],
            price: price.unit_amount / 100,
            description: product.description,
            defaultPriceId: price.id,
          },
        },
      };
    } catch (error) {
      console.error(error);
      return {
        props: {
            product: {}
        }, 
        notFound: true,
      };
    }
};