export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_Rxl7U7v7kB21e9',
    priceId: 'AUTEST003M00O-10',
    name: 'TEST003M00 Test Product',
    description: 'Test product for payment integration validation',
    mode: 'payment',
    price: 0,
    currency: 'aud'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};