
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

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

interface UseGeolocationState {
  loading: boolean;
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | string | null; // Pode ser string para erros customizados
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
        error: 'Geolocalização não é suportada por este navegador ou o contexto não é seguro (HTTPS).',
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

    const handleError = (error: GeolocationError) => {
      let errorMessage = error.message;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permissão para acessar a localização foi negada.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Informação de localização não está disponível.";
          break;
        case error.TIMEOUT:
          errorMessage = "A requisição para obter a localização expirou.";
          break;
        default:
          errorMessage = "Ocorreu um erro desconhecido ao obter a localização.";
          break;
      }
      setState({
        loading: false,
        coordinates: null,
        error: { ...error, message: errorMessage },
      });
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [options]); // options como dependência do useCallback

  return { ...state, getLocation };
};

export default useGeolocation;
