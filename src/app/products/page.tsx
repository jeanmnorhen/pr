
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  'data-ai-hint'?: string;
}

export default function ProductsPage(): ReactNode {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/products'); 
        if (!response.ok) {
          let errorText = `Error ${response.status}`;
          try {
            const errorData = await response.json();
            errorText = `${errorText}: ${errorData.error || response.statusText}`;
          } catch (e) {
            // If parsing error JSON fails, use the original statusText
            errorText = `${errorText}: ${response.statusText}`;
          }
          throw new Error(errorText);
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Falha ao buscar produtos.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-center p-4 sm:p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-center p-4 sm:p-6 bg-destructive/10 rounded-lg shadow-md">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-2">Oops! Algo deu errado.</h1>
        <p className="text-destructive/80 mb-6 text-sm sm:text-base">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-center p-4 sm:p-6">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Nenhum produto encontrado.</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Parece que não há produtos disponíveis no momento. Volte mais tarde!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 sm:mb-10 text-center text-primary tracking-tight">
        Conheça Nossos Produtos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8">
        {products.map((product, index) => (
          <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out rounded-xl border-border hover:border-primary/50">
            <div className="relative w-full h-48 sm:h-56 group">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: 'cover' }}
                className="rounded-t-xl transition-transform duration-500 ease-in-out group-hover:scale-105"
                data-ai-hint={product['data-ai-hint'] || 'product image'}
                priority={index < 4} 
              />
            </div>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-lg sm:text-xl font-bold truncate text-foreground" title={product.name}>
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground h-10 sm:h-12 overflow-hidden text-ellipsis leading-relaxed">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end pt-2 px-4 pb-4">
              <div>
                <p className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                <ShoppingCart size={18} className="mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
