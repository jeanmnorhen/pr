"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { LoginFormData, RegisterFormData, ProfileUpdateFormData, ForgotPasswordFormData } from '@/lib/schemas/auth-schemas';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (data: ForgotPasswordFormData) => Promise<void>;
  updateUserDisplayName: (data: ProfileUpdateFormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (err instanceof Error && 'code' in err) { // AuthError has a 'code' property
        const authError = err as AuthError;
        message = authError.message || defaultMessage;
        switch (authError.code) {
            case 'auth/user-not-found':
                message = 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password.';
                break;
            case 'auth/email-already-in-use':
                message = 'This email is already registered.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. It should be at least 6 characters.';
                break;
            // Add more specific Firebase error codes as needed
        }
    } else if (err instanceof Error) {
        message = err.message;
    }
    setError(message);
    toast({ title: 'Authentication Error', description: message, variant: 'destructive' });
  };

  const login = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/profile');
    } catch (err) {
      handleAuthError(err, 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user && data.displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName: data.displayName });
        // Refresh user to get updated display name
        setUser(auth.currentUser); 
      }
      toast({ title: 'Registration Successful', description: 'Welcome! Your account has been created.' });
      router.push('/profile');
    } catch (err) {
      handleAuthError(err, 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (err) {
      handleAuthError(err, 'Failed to logout.');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSendPasswordResetEmail(auth, data.email);
      toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a password reset link.' });
    } catch (err) {
      handleAuthError(err, 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserDisplayName = async (data: ProfileUpdateFormData) => {
    if (!auth.currentUser) {
      setError("User not logged in.");
      toast({ title: 'Error', description: 'User not logged in.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName: data.displayName });
      setUser(auth.currentUser); // Refresh user state
      toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
    } catch (err) {
      handleAuthError(err, 'Failed to update display name.');
    } finally {
      setLoading(false);
    }
  };
  

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    sendPasswordReset,
    updateUserDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
