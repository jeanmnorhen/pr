
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store as StoreIcon, ShoppingBag, Info, Loader2, Tag, Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getStoreProducts, type ProductAd, getUserProfileData } from '@/lib/firebase/realtime-db'; // Updated import

interface StoreInfo {
  name: string;
  // Future: description, etc.
}

export default function StoreProfilePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeProducts, setStoreProducts] = useState<ProductAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      setLoading(true);
      setError(null);
      
      const fetchStoreData = async () => {
        try {
          const profileData = await getUserProfileData(storeId);
          if (profileData) {
            setStoreInfo({ name: profileData.displayName || `Loja ${storeId}` });
          } else {
            // Fallback if profile not found, but store might still have products if ID is valid
            setStoreInfo({ name: `Loja ${storeId}` }); 
          }

          const products = await getStoreProducts(storeId);
          setStoreProducts(products);

        } catch (err: any) {
          console.error("Error fetching store data:", err);
          setError(err.message || "Falha ao buscar informações da loja e produtos.");
          // Set a fallback name even on error so the page can render something
          if (!storeInfo) setStoreInfo({ name: `Loja ${storeId}` });
        } finally {
          setLoading(false);
        }
      };
      
      fetchStoreData();

    } else {
      setError("ID da loja não encontrado.");
      setLoading(false);
    }
  }, [storeId]); // Removed storeInfo from dependencies to avoid re-fetch loop

  const getAdTypeBadge = (adType: ProductAd['adType']) => {
    if (adType === 'offer') {
      return (
        <Badge variant="default" className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
          <Tag size={14} className="mr-1" /> Oferta
        </Badge>
      );
    }
    if (adType === 'promotion') {
      return (
        <Badge variant="default" className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1">
          <Sparkles size={14} className="mr-1" /> Promoção
        </Badge>
      );
    }
    return null;
  };


  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-2">Carregando perfil da loja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <Info size={48} className="text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Erro ao Carregar Loja</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para Produtos</Link>
        </Button>
      </div>
    );
  }

  if (!storeInfo) { // Should ideally not happen if loading is false and no error, but good fallback
    return (
       <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <StoreIcon size={48} className="text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loja não encontrada</h1>
        <p className="text-muted-foreground mb-4">Não conseguimos encontrar detalhes para esta loja.</p>
        <Button asChild>
          <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para Produtos</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Link>
      </Button>

      <Card className="shadow-xl mb-8">
        <CardHeader className="text-center border-b pb-6">
          <StoreIcon className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4" />
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">{storeInfo.name}</CardTitle>
          <CardDescription>Bem-vindo à vitrine de {storeInfo.name}!</CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ShoppingBag className="text-primary" /> Produtos Anunciados
      </h2>
      {storeProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
             <ShoppingBag size={48} className="mx-auto mb-4" />
            <p>Este lojista ainda não anunciou produtos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeProducts.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out rounded-xl border-border hover:border-primary/50 relative">
              {getAdTypeBadge(product.adType as 'offer' | 'promotion' | null)}
              <div className="relative w-full h-56 group">
                <Image
                  src={product.imageUrl || "https://placehold.co/600x400.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-xl transition-transform duration-500 ease-in-out group-hover:scale-105"
                  data-ai-hint={product['data-ai-hint'] || 'product image'}
                />
              </div>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-lg sm:text-xl font-bold truncate text-foreground" title={product.name}>
                  {product.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground h-12 overflow-hidden text-ellipsis leading-relaxed">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between pt-2 px-4 pb-4">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-primary mb-2 sm:mb-3">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                {/* Link para página do produto individual, se existir, ou apenas informativo */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
