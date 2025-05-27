
"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Image as ImageIcon, Search, Brain } from 'lucide-react';

interface TestResult {
  data: any | null;
  error: string | null;
}

export default function BackendTestsPage() {
  // State for Image Identification
  const [imageUrl, setImageUrl] = useState<string>('');
  const [identifyLoading, setIdentifyLoading] = useState<boolean>(false);
  const [identifyResult, setIdentifyResult] = useState<TestResult | null>(null);

  // State for Product Search
  const [objectName, setObjectName] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<TestResult | null>(null);

  // State for Product Classification
  const [classifyProductName, setClassifyProductName] = useState<string>('');
  const [classifyProductDesc, setClassifyProductDesc] = useState<string>('');
  const [classifyLoading, setClassifyLoading] = useState<boolean>(false);
  const [classifyResult, setClassifyResult] = useState<TestResult | null>(null);

  const handleIdentifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setIdentifyResult({ data: null, error: 'Por favor, insira uma URL de imagem.' });
      return;
    }
    setIdentifyLoading(true);
    setIdentifyResult(null);
    try {
      const response = await fetch('/api/identify_objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }
      setIdentifyResult({ data, error: null });
    } catch (err: any) {
      setIdentifyResult({ data: null, error: err.message || 'Falha ao identificar objetos.' });
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!objectName) {
      setSearchResult({ data: null, error: 'Por favor, insira um nome de objeto.' });
      return;
    }
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const response = await fetch('/api/search_products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }
      setSearchResult({ data, error: null });
    } catch (err: any) {
      setSearchResult({ data: null, error: err.message || 'Falha ao buscar produtos.' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClassifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!classifyProductName || !classifyProductDesc) {
      setClassifyResult({ data: null, error: 'Por favor, insira nome e descrição do produto.' });
      return;
    }
    setClassifyLoading(true);
    setClassifyResult(null);
    try {
      const response = await fetch('/api/classify_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: classifyProductName, productDescription: classifyProductDesc }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || `Erro ${response.status}`);
      }
      setClassifyResult({ data, error: null });
    } catch (err: any) {
      setClassifyResult({ data: null, error: err.message || 'Falha ao classificar produto.' });
    } finally {
      setClassifyLoading(false);
    }
  };

  const renderResult = (result: TestResult | null) => {
    if (!result) return null;
    if (result.error) {
      return <pre className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm whitespace-pre-wrap break-all">{result.error}</pre>;
    }
    if (result.data) {
      return <pre className="mt-4 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap break-all">{JSON.stringify(result.data, null, 2)}</pre>;
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary mb-10">Página de Testes do Backend</h1>

      {/* Teste de Identificação de Objetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="text-accent" /> Testar Identificação de Objetos</CardTitle>
          <CardDescription>Endpoint: <code>POST /api/identify_objects</code></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIdentifySubmit} className="space-y-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">URL da Imagem:</label>
              <Input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
            </div>
            <Button type="submit" disabled={identifyLoading} className="w-full sm:w-auto">
              {identifyLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
              Identificar
            </Button>
          </form>
          {renderResult(identifyResult)}
        </CardContent>
      </Card>

      {/* Teste de Busca de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="text-accent"/> Testar Busca de Produtos</CardTitle>
          <CardDescription>Endpoint: <code>POST /api/search_products</code></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label htmlFor="objectName" className="block text-sm font-medium mb-1">Nome do Objeto:</label>
              <Input
                type="text"
                id="objectName"
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                placeholder="Ex: cadeira gamer"
                required
              />
            </div>
            <Button type="submit" disabled={searchLoading} className="w-full sm:w-auto">
              {searchLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
              Buscar Produtos
            </Button>
          </form>
          {renderResult(searchResult)}
        </CardContent>
      </Card>

      {/* Teste de Classificação de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="text-accent"/> Testar Classificação de Produtos (Genkit)</CardTitle>
          <CardDescription>Endpoint: <code>POST /api/classify_product</code></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleClassifySubmit} className="space-y-4">
            <div>
              <label htmlFor="classifyProductName" className="block text-sm font-medium mb-1">Nome do Produto:</label>
              <Input
                type="text"
                id="classifyProductName"
                value={classifyProductName}
                onChange={(e) => setClassifyProductName(e.target.value)}
                placeholder="Ex: Cadeira Gamer Pro X"
                required
              />
            </div>
            <div>
              <label htmlFor="classifyProductDesc" className="block text-sm font-medium mb-1">Descrição do Produto:</label>
              <Textarea
                id="classifyProductDesc"
                value={classifyProductDesc}
                onChange={(e) => setClassifyProductDesc(e.target.value)}
                placeholder="Ex: Cadeira ergonômica com suporte lombar, ideal para longas sessões de jogo."
                required
                rows={3}
              />
            </div>
            <Button type="submit" disabled={classifyLoading} className="w-full sm:w-auto">
              {classifyLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
              Classificar Produto
            </Button>
          </form>
          {renderResult(classifyResult)}
        </CardContent>
      </Card>
    </div>
  );
}

    