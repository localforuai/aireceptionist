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
    id: 'prod_SG6ofw3zr7YDpT',
    priceId: 'UKPOS01M00S-03',
    name: 'POS01M00 POS System',
    description: 'Complete Point of Sale system for your business',
    mode: 'subscription',
    price: 0,
    currency: 'gbp'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};