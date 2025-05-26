
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, PackagePlus, Tag, Sparkles, Image as ImageIcon, DollarSign, ClipboardList, Shapes } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { ProductAdSchema, type ProductAdFormData, productCategories } from "@/lib/schemas/auth-schemas";

export default function CreateAdPage() {
  const { user, loading: authLoading, postProductAd } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.isStoreOwner)) {
      router.push("/profile"); // Redirect if not a store owner or not logged in
    }
  }, [user, authLoading, router]);

  const form = useForm<ProductAdFormData>({
    resolver: zodResolver(ProductAdSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: undefined, // Or a default category if you prefer
      imageUrl: "",
      adType: "standard",
    },
  });

  async function onSubmit(values: ProductAdFormData) {
    const success = await postProductAd(values);
    if (success) {
      form.reset();
      router.push("/profile"); // Or to a page showing their ads
    }
  }

  if (authLoading || !user || !user.isStoreOwner) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Perfil
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <PackagePlus className="h-7 w-7 text-primary" />
            Criar Novo Anúncio de Produto
          </CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para listar seu produto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><ClipboardList size={16}/> Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Camiseta Estilosa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><ClipboardList size={16} /> Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva seu produto em detalhes..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><DollarSign size={16} /> Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 29.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Shapes size={16}/> Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><ImageIcon size={16} /> URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com/imagem.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-1"><Tag size={16}/> Tipo de Anúncio</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="standard" />
                          </FormControl>
                          <FormLabel className="font-normal">Padrão (0 créditos)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="offer" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Tag size={14} className="text-green-600"/> Oferta (1 crédito)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="promotion" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Sparkles size={14} className="text-orange-500"/> Promoção (2 créditos)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || authLoading}>
                {form.formState.isSubmitting || authLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Postar Anúncio
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
