"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ShieldCheck, LogIn, UserPlus, UserCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Carregando status do usuário...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6">
      <ShieldCheck className="w-20 h-20 sm:w-24 sm:h-24 text-primary mb-6" />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Preço Real</h1>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl">
        Gerencie sua autenticação de forma segura com Firebase e Next.js.
        Esta aplicação demonstra registro de usuário, login, gerenciamento de perfil e recuperação de senha.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {user ? (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/profile" className="flex items-center justify-center gap-2">
              <UserCircle size={20} /> Ir para Seu Perfil
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              <Link href="/register" className="flex items-center justify-center gap-2">
                <UserPlus size={20} /> Criar Conta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <LogIn size={20} /> Entrar
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
