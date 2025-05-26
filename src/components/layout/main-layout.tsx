import type { ReactNode } from 'react';
import Header from './header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        AuthFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
