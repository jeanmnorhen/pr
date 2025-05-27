
"use client";

import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Search, ShoppingCart, Tag, Sparkles, BookOpenCheck, Shapes } from 'lucide-react';
import { saveProductToDB, subscribeToProducts, updateProductInDB, type ProductData } from '@/lib/firebase/realtime-db'; // ProductData em vez de ProductAd
import { useToast } from '@/hooks/use-toast';

// Definindo a interface Product aqui para incluir os campos do RTDB
interface Product extends ProductData {
  id: string; // ID do Realtime Database
  category?: string; // Virá da classificação do Gemini
  attributes?: Record<string, any>; // Virá da extração do Gemini
  // Campos da busca original
  nome_produto: string;
  descricao?: string; // Pode ser opcional vindo do scraping
  url_produto?: string;
  url_imagem_produto: string;
  preco?: string;
  disponibilidade?: string; // Simulado
  nome_vendedor?: string; // Simulado
  timestamp?: number; // Adicionado ao salvar
}

// Interface para os dados que vêm da API de busca
interface SearchedProduct {
  nome_produto: string;
  descricao?: string;
  url_produto?: string;
  url_imagem_produto: string;
  preco?: string;
  disponibilidade?: string; // Simulado
  nome_vendedor?: string; // Simulado
}


export default function ProductsPage(): ReactNode {
  const searchParams = useSearchParams();
  const searchLabel = searchParams.get('searchLabel');
  const { toast } = useToast();

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [loadingClassification, setLoadingClassification] = useState<Record<string, boolean>>({});
  const [searchError, setSearchError] = useState<string | null>(null);

  // Função para chamar a API de classificação e atualizar o RTDB
  const classifyAndSaveProductDetails = useCallback(async (productId: string, product: ProductData) => {
    if (!product.nome_produto || !product.descricao) {
      console.warn(`Produto ${productId} sem nome ou descrição, pulando classificação.`);
      return;
    }

    setLoadingClassification(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch('/api/classify_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: product.nome_produto, 
          productDescription: product.descricao 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao classificar o produto ${productId}`);
      }

      const classificationResult = await response.json();
      
      // Atualiza o produto no RTDB com os novos dados
      await updateProductInDB(productId, {
        category: classificationResult.category,
        attributes: classificationResult.attributes,
      });

      toast({
        title: "Produto Atualizado",
        description: `Categoria e atributos adicionados para: ${product.nome_produto}`,
      });

    } catch (error: any) {
      console.error(`Erro ao classificar e salvar detalhes para ${productId}:`, error);
      toast({
        title: "Erro na Classificação",
        description: error.message || `Não foi possível classificar ${product.nome_produto}.`,
        variant: "destructive",
      });
    } finally {
      setLoadingClassification(prev => ({ ...prev, [productId]: false }));
    }
  }, [toast]);


  // Busca produtos da API de scraping e salva no RTDB
  useEffect(() => {
    if (searchLabel) {
      setLoadingSearch(true);
      setSearchError(null);
      const fetchSearchedProducts = async () => {
        try {
          console.log(`Buscando produtos para: ${searchLabel}`);
          const response = await fetch('/api/search_products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objectName: searchLabel }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao buscar produtos da API.');
          }
          const searchedProducts: SearchedProduct[] = await response.json();
          console.log("Produtos encontrados pela API de busca:", searchedProducts);

          if (searchedProducts && searchedProducts.length > 0) {
            toast({
              title: "Busca Concluída",
              description: `${searchedProducts.length} produtos encontrados para "${searchLabel}". Catalogando...`
            });

            for (const prod of searchedProducts) {
              const productToSave: ProductData = {
                nome_produto: prod.nome_produto,
                descricao: prod.descricao || prod.nome_produto, // Garante uma descrição
                url_produto: prod.url_produto,
                url_imagem_produto: prod.url_imagem_produto,
                preco: prod.preco,
                disponibilidade: prod.disponibilidade || "Disponível (simulado)",
                nome_vendedor: prod.nome_vendedor || "Vendedor Desconhecido",
                timestamp: Date.now(), // Firebase serverTimestamp é melhor no backend
              };
              try {
                const newProductId = await saveProductToDB(productToSave);
                console.log(`Produto ${newProductId} salvo no RTDB.`);
                // Após salvar, chama a classificação
                await classifyAndSaveProductDetails(newProductId, productToSave);
              } catch (dbError) {
                console.error("Erro ao salvar produto no RTDB:", dbError);
                toast({
                  title: "Erro ao Catalogar",
                  description: `Não foi possível salvar ${prod.nome_produto} no banco de dados.`,
                  variant: "destructive",
                });
              }
            }
          } else {
            setSearchError(`Nenhum produto encontrado para "${searchLabel}" na API externa.`);
             toast({
              title: "Nenhum Produto Encontrado",
              description: `Sua busca por "${searchLabel}" não retornou resultados da API.`,
              variant: "default",
            });
          }
        } catch (err: any) {
          console.error("Fetch error ao buscar produtos:", err);
          setSearchError(err.message || "Falha ao buscar produtos.");
          toast({
            title: "Erro na Busca",
            description: err.message || "Ocorreu um problema ao buscar os produtos.",
            variant: "destructive",
          });
        } finally {
          setLoadingSearch(false);
        }
      };
      fetchSearchedProducts();
    } else {
      setLoadingSearch(false);
      // Se não houver searchLabel, apenas escutamos o RTDB.
    }
  }, [searchLabel, toast, classifyAndSaveProductDetails]);

  // Escuta produtos do RTDB
  useEffect(() => {
    const unsubscribe = subscribeToProducts((products) => {
      console.log("Produtos recebidos do RTDB:", products);
      setDbProducts(products.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))); // Ordena por mais recente
       if (!searchLabel && products.length === 0 && !loadingSearch) {
        setSearchError("Nenhum produto catalogado ainda. Tente identificar um objeto na página inicial.");
      } else if (products.length > 0) {
        setSearchError(null); // Limpa o erro se produtos forem carregados
      }
    });
    return () => unsubscribe();
  }, [searchLabel, loadingSearch]);


  if (loadingSearch && !searchLabel) { // Loading inicial se não houver busca ativa
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando produtos catalogados...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-primary tracking-tight">
        {searchLabel ? `Produtos Relacionados a "${searchLabel}"` : "Produtos Catalogados"}
      </h1>
      
      {loadingSearch && searchLabel && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Buscando e catalogando produtos para "{searchLabel}"...</p>
        </div>
      )}

      {!loadingSearch && searchError && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6 bg-card rounded-lg shadow-md border">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">{searchError}</p>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Voltar para a Página Inicial
          </Button>
        </div>
      )}

      {!loadingSearch && !searchError && dbProducts.length === 0 && (
         <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 sm:p-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Nenhum produto encontrado.</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {searchLabel ? `Não encontramos produtos para "${searchLabel}" após a busca e catalogação.` : `Nenhum produto no banco de dados ainda.`}
          </p>
        </div>
      )}

      {!loadingSearch && dbProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8">
          {dbProducts.map((product, index) => (
            <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out rounded-xl border-border hover:border-primary/50 relative">
              <div className="relative w-full h-48 sm:h-56 group">
                <Image
                  src={product.url_imagem_produto || "https://placehold.co/600x400.png"}
                  alt={product.nome_produto}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-xl transition-transform duration-500 ease-in-out group-hover:scale-105"
                  data-ai-hint={product['data-ai-hint'] || 'product item'}
                  priority={index < 4} 
                />
              </div>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-lg sm:text-xl font-bold truncate text-foreground" title={product.nome_produto}>
                  {product.nome_produto}
                </CardTitle>
                {product.category && (
                  <Badge variant="secondary" className="mt-1 font-normal text-xs">
                    <Shapes size={12} className="mr-1.5"/> {product.category}
                  </Badge>
                )}
                 <CardDescription className="text-xs sm:text-sm text-muted-foreground h-10 sm:h-12 overflow-hidden text-ellipsis leading-relaxed pt-1">
                  {product.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between pt-2 px-4">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-primary mb-1 sm:mb-2">
                    {product.preco || "Preço não disponível"}
                  </p>
                  {product.nome_vendedor && (
                    <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                      Vendido por: <span className="font-medium text-foreground">{product.nome_vendedor}</span>
                    </p>
                  )}
                  {product.attributes && Object.keys(product.attributes).length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Atributos:</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product.attributes).map(([key, value]) => (
                           typeof value === 'boolean' && value === true ? (
                            <Badge key={key} variant="outline" className="text-xs px-1.5 py-0.5">{key.replace(/_/g, ' ')}</Badge>
                          ) : typeof value !== 'boolean' ? (
                            <Badge key={key} variant="outline" className="text-xs px-1.5 py-0.5">{key.replace(/_/g, ' ')}: {String(value)}</Badge>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
               <CardFooter className="px-4 pb-4 pt-1">
                {product.url_produto ? (
                  <Button asChild variant="outline" size="sm" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300">
                    <a href={product.url_produto} target="_blank" rel="noopener noreferrer">
                      <BookOpenCheck size={16} className="mr-2" />
                      Ver Produto
                    </a>
                  </Button>
                ) : (
                   <Button variant="outline" size="sm" className="w-full" disabled>
                      Link indisponível
                    </Button>
                )}
                {loadingClassification[product.id] && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-primary">Classificando...</span>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
