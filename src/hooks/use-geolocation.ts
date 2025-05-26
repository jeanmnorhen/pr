
"use client";

import { useState, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

// GeolocationPosition e GeolocationPositionError são tipos globais do DOM, não precisam ser redefinidos.

// Estrutura simplificada para o erro no estado do hook
export interface SimpleGeolocationError {
  code: number; // Usaremos 0 para erros customizados/não padrão
  message: string;
}

interface UseGeolocationState {
  loading: boolean;
  coordinates: GeolocationCoordinates | null;
  error: SimpleGeolocationError | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const useGeolocation = (options?: UseGeolocationOptions) => {
  const [state, setState] = useState<UseGeolocationState>({
    loading: false,
    coordinates: null,
    error: null,
  });

  const getLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({
        loading: false,
        coordinates: null,
        error: { code: 0, message: 'Geolocalização não é suportada por este navegador ou o contexto não é seguro (HTTPS).' },
      });
      return;
    }

    setState({ loading: true, coordinates: null, error: null });

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        coordinates: position.coords,
        error: null,
      });
    };

    const handleError = (geoError: GeolocationPositionError) => {
      let message = geoError.message;
      // Códigos de erro padrão da API de Geolocalização
      const PERMISSION_DENIED_CODE = 1;
      const POSITION_UNAVAILABLE_CODE = 2;
      const TIMEOUT_CODE = 3;

      switch (geoError.code) {
        case PERMISSION_DENIED_CODE:
          message = "Permissão para acessar a localização foi negada.";
          break;
        case POSITION_UNAVAILABLE_CODE:
          message = "Informação de localização não está disponível.";
          break;
        case TIMEOUT_CODE:
          message = "A requisição para obter a localização expirou.";
          break;
        // Não é necessário um default se usarmos geoError.message como fallback,
        // mas podemos manter um para clareza se a mensagem original não for boa.
        default:
          message = `Ocorreu um erro desconhecido ao obter a localização (Código: ${geoError.code}).`;
          break;
      }
      setState({
        loading: false,
        coordinates: null,
        error: { code: geoError.code, message },
      });
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [options]); // options como dependência do useCallback

  return { ...state, getLocation };
};

export default useGeolocation;
