
"use client";

import Link from 'next/link';
import { ShieldCheck, LogOut, UserCircle, LogInIcon, UserPlus, MessageSquare, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // router.push('/login') is handled by the logout function in useAuth
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-y-2">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ShieldCheck className="h-7 w-7" />
          <h1 className="text-xl font-semibold">Preço Real</h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/rtdb-example" className="flex items-center gap-1">
               <MessageSquare size={18} /> <span className="hidden xs:inline">Chat</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products" className="flex items-center gap-1">
               <ShoppingBag size={18} /> <span className="hidden xs:inline">Produtos</span>
            </Link>
          </Button>
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse hidden sm:block"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="flex items-center gap-1">
                  <UserCircle size={18} /> <span className="hidden xs:inline">Perfil</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut size={16} /> 
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="flex items-center gap-1">
                  <LogInIcon size={18} /> <span className="hidden xs:inline">Login</span>
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/register" className="flex items-center gap-1">
                  <UserPlus size={18} /> 
                  <span className="hidden sm:inline">Registrar</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
