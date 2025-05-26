
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Store as StoreIcon, ShoppingBag, Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
// import { getUserProfileData, type UserProfileData } from '@/lib/firebase/realtime-db'; // We don't have store specific data yet in RTDB based on storeId alone

interface StoreInfo {
  name: string;
  // Future: description, ownerName, products, etc.
}

export default function StoreProfilePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      setLoading(true);
      // In a real app, you would fetch store details based on storeId
      // For now, we'll simulate fetching some data or use a placeholder.
      // Since the API only provides storeOwnerName and storeOwnerId with products,
      // we don't have a direct way to get store name from just storeId without another API endpoint
      // or assuming storeId is the owner's UID and fetching their profile.
      // For this placeholder, we'll just use the storeId.
      
      // Placeholder: Try to find if any product in a mock full list has this storeId to get a name
      // This is inefficient and just for placeholder purposes.
      const fetchStoreNameFromProducts = async () => {
        try {
          // Fetching all products to find store name - NOT EFFICIENT FOR REAL APP
          const response = await fetch('/api/products'); 
          if (!response.ok) throw new Error('Failed to fetch product data to infer store name');
          const products: Array<{ storeOwnerId: string; storeOwnerName: string }> = await response.json();
          const matchingProduct = products.find(p => p.storeOwnerId === storeId);
          if (matchingProduct) {
            setStoreInfo({ name: matchingProduct.storeOwnerName });
          } else {
            setStoreInfo({ name: `Loja ${storeId}` }); // Fallback name
          }
        } catch (err: any) {
          setError(err.message || "Falha ao buscar informações da loja.");
          setStoreInfo({ name: `Loja ${storeId}` }); // Fallback name on error
        } finally {
          setLoading(false);
        }
      };
      
      fetchStoreNameFromProducts();

    } else {
      setError("ID da loja não encontrado.");
      setLoading(false);
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-2">Carregando perfil da loja...</p>
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

  if (!storeInfo) {
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <StoreIcon className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4" />
          <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">{storeInfo.name || `Loja ${storeId}`}</CardTitle>
          <CardDescription>Bem-vindo à vitrine de {storeInfo.name || `Loja ${storeId}`}!</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Vitrine de Produtos</h2>
            <p className="text-muted-foreground">
              Produtos desta loja aparecerão aqui. (Funcionalidade em desenvolvimento)
            </p>
            {/* Future: Grid of products from this store */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
