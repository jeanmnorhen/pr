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
        <p className="mt-4 text-muted-foreground">Loading user status...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
      <ShieldCheck className="w-24 h-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-primary">Preço Real</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        Securely manage your authentication with Firebase and Next.js. 
        This application demonstrates user registration, login, profile management, and password recovery.
      </p>
      <div className="space-x-4">
        {user ? (
          <Button asChild size="lg">
            <Link href="/profile" className="flex items-center gap-2">
              <UserCircle size={20} /> Go to Your Profile
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/register" className="flex items-center gap-2">
                <UserPlus size={20} /> Create Account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn size={20} /> Sign In
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
