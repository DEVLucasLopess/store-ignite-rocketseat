// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { stripe } from '@/lib/stripe'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

interface ResponseDataType {
  checkoutUrl: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { priceId } = req.body
  const successUrl = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_URL}/`;

  const checkoutSession = await stripe.checkout.sessions.create({
    success_url: successUrl,
    cancel_url: cancelUrl,
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ]
  })
  
  const responseData: ResponseDataType = {
    checkoutUrl: checkoutSession.url
  }

  return res.status(201).json(responseData)
}