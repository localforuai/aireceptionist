import React from 'react';
import { stripeProducts } from '../stripe-config';
import { ProductCard } from './ProductCard';

export const ProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Products</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with our test product integration
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
          {stripeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};