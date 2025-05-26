
"use client";

import type { ReactNode, ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, Loader2, AlertTriangle, Search, XCircle, Store,
  Laptop, Smartphone, Headphones, Watch, TabletIcon as Tablet, Camera, Gamepad2, Mouse, Keyboard, Monitor
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  'data-ai-hint'?: string;
  storeOwnerId: string;
  storeOwnerName: string;
}

interface CategoryFilter {
  name: string;
  originalName: string; 
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

const categories: CategoryFilter[] = [
  { name: "Laptops", icon: Laptop, originalName: "Laptop Gamer" },
  { name: "Smartphones", icon: Smartphone, originalName: "Smartphone Pro" },
  { name: "Fones", icon: Headphones, originalName: "Fone Bluetooth" },
  { name: "Smartwatches", icon: Watch, originalName: "Smartwatch X" },
  { name: "Tablets", icon: Tablet, originalName: "Tablet 10" },
  { name: "Câmeras", icon: Camera, originalName: "Câmera 4K" },
  { name: "Consoles", icon: Gamepad2, originalName: "Console NextGen" },
  { name: "Mouses", icon: Mouse, originalName: "Mouse Ergonômico" },
  { name: "Teclados", icon: Keyboard, originalName: "Teclado Mecânico" },
  { name: "Monitores", icon: Monitor, originalName: "Monitor Ultrawide" },
];

export default function ProductsPage(): ReactNode {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let url = '/api/products';
    const params = new URLSearchParams();

    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
    }
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await fetch(url); 
      if (!response.ok) {
        let errorText = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorText = `${errorText}: ${errorData.error || response.statusText}`;
        } catch (e) {
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
  }, [debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryClick = (categoryOriginalName: string | null) => {
    setSelectedCategory(prevCategory => 
      prevCategory === categoryOriginalName ? null : categoryOriginalName
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };
  
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-primary tracking-tight">
        Buscar Anúncios de Produtos
      </h1>

      <div className="mb-8 p-4 sm:p-6 bg-card shadow-lg rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative w-full sm:flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos ou lojas..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full h-11 text-base"
            />
          </div>
           {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-sm sm:ml-auto flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <XCircle size={16} /> Limpar Filtros
            </Button>
          )}
        </div>
        
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.originalName}
                variant={selectedCategory === cat.originalName ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(cat.originalName)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm transition-all duration-200 ease-in-out
                  ${selectedCategory === cat.originalName 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-card hover:bg-accent hover:text-accent-foreground border-border'
                  }`}
              >
                <cat.icon size={16} />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Carregando produtos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6 bg-destructive/10 rounded-lg shadow-md">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-2">Oops! Algo deu errado.</h1>
          <p className="text-destructive/80 mb-6 text-sm sm:text-base">{error}</p>
          <Button onClick={fetchProducts} variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            Tentar Novamente
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Nenhum produto encontrado.</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Tente ajustar sua busca ou filtros.
          </p>
        </div>
      ) : (
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
              <CardContent className="flex-grow flex flex-col justify-between pt-2 px-4 pb-4">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-primary mb-2 sm:mb-3">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                   <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
                    Vendido por: <span className="font-medium text-foreground">{product.storeOwnerName}</span>
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                  <Link href={`/store/${product.storeOwnerId}`}>
                    <Store size={16} className="mr-2" />
                    Ver Loja
                  </Link>
                </Button>
              </CardContent>
              {/* <CardFooter className="p-4 pt-0"> 
                // Placeholder for Add to Cart or other actions
                 <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                  <ShoppingCart size={18} className="mr-2" />
                  Adicionar ao Carrinho
                </Button> 
              </CardFooter> */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
