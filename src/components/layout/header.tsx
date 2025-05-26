"use client";

import Link from 'next/link';
import { ShieldCheck, LogOut, UserCircle, LogInIcon, UserPlus } from 'lucide-react';
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
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ShieldCheck className="h-7 w-7" />
          <h1 className="text-xl font-semibold">AuthFlow</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="flex items-center gap-1">
                  <UserCircle size={18} /> Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut size={16} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="flex items-center gap-1">
                  <LogInIcon size={18} /> Login
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/register" className="flex items-center gap-1">
                  <UserPlus size={18} /> Register
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
