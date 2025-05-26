
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserCircle, Mail, Edit3, Store, CreditCard, Coins } from 'lucide-react';

import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileUpdateSchema, type ProfileUpdateFormData } from "@/lib/schemas/auth-schemas";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, loading, logout, updateUserDisplayNameAuth, becomeStoreOwner, addTestCredits } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user && user.displayName !== form.getValues("displayName")) {
      form.reset({ displayName: user.displayName || "" });
    }
  }, [user, loading, router, form]);

  async function onSubmitDisplayName(values: ProfileUpdateFormData) {
    await updateUserDisplayNameAuth(values);
  }

  const handleBecomeStoreOwner = async () => {
    await becomeStoreOwner();
  };

  const handleAddTestCredits = async () => {
    await addTestCredits(10); // Add 10 test credits
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4" />
          <CardTitle className="text-2xl sm:text-3xl font-bold">Seu Perfil</CardTitle>
          <CardDescription>Gerencie as informações da sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Mail size={18} /> Email</h3>
            <p className="text-muted-foreground bg-muted p-3 rounded-md break-all">{user.email}</p>
            {user.emailVerified === false && (
                <p className="text-sm text-yellow-600">Seu email não foi verificado.</p>
            )}
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitDisplayName)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Edit3 size={18} /> Nome de Exibição</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome de exibição" {...field} defaultValue={user.displayName || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting || loading}>
                {form.formState.isSubmitting || loading ? <Spinner size="sm" className="mr-2" /> : null}
                Atualizar Nome
              </Button>
            </form>
          </Form>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Coins size={18} /> Créditos</h3>
            <p className="text-muted-foreground">Você tem <span className="font-bold text-primary">{user.credits || 0}</span> créditos.</p>
            <Button onClick={handleAddTestCredits} variant="outline" className="w-full" disabled={loading}>
                Adicionar 10 Créditos (Teste)
            </Button>
          </div>

          <Separator />
          
          <div className="space-y-2">
             <h3 className="text-lg font-semibold flex items-center gap-2"><Store size={18} /> Loja</h3>
            {user.isStoreOwner ? (
              <p className="text-green-600 font-medium">Você é um lojista!</p>
              // TODO: Link para gerenciar loja/anúncios
            ) : (
              <>
                <p className="text-muted-foreground">Torne-se um lojista para anunciar seus produtos.</p>
                <Button 
                  onClick={handleBecomeStoreOwner} 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={loading || (user.credits || 0) <= 0}
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  Tornar-se Lojista
                </Button>
                {(user.credits || 0) <= 0 && <p className="text-xs text-muted-foreground text-center mt-1">Você precisa de créditos para se tornar um lojista.</p>}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button variant="destructive" onClick={logout} className="w-full" disabled={loading}>
             {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
