
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ShieldCheck, LogIn, UserPlus, UserCircle, MapPin } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import useGeolocation, { type GeolocationError as GeoErrorType, type GeolocationCoordinates } from '@/hooks/use-geolocation'; // Importar o hook
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    coordinates, 
    loading: geoLoading, 
    error: geoError, 
    getLocation 
  } = useGeolocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });

  const handleGetLocation = () => {
    getLocation();
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Carregando status do usuário...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6">
      <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-6" />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Preço Real</h1>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl">
        Gerencie sua autenticação de forma segura com Firebase e Next.js.
        Esta aplicação demonstra registro de usuário, login, gerenciamento de perfil e recuperação de senha.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
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

      <Card className="w-full max-w-md shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <MapPin className="text-primary" /> Teste de Geolocalização
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleGetLocation} disabled={geoLoading} className="w-full">
            {geoLoading ? <Spinner size="sm" className="mr-2" /> : <MapPin size={18} className="mr-2" />}
            {geoLoading ? 'Obtendo localização...' : 'Obter Minha Localização'}
          </Button>
          {coordinates && (
            <div className="text-sm text-left p-3 bg-muted rounded-md w-full">
              <p><strong>Latitude:</strong> {coordinates.latitude.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {coordinates.longitude.toFixed(6)}</p>
              {coordinates.accuracy && <p><strong>Precisão:</strong> {coordinates.accuracy.toFixed(2)} metros</p>}
            </div>
          )}
          {geoError && (
            <p className="text-destructive text-sm mt-2">
              Erro: {typeof geoError === 'string' ? geoError : (geoError as GeoErrorType).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
