
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
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
import type { LoginFormData, RegisterFormData, ProfileUpdateFormData, ForgotPasswordFormData, UserProfileData } from '@/lib/schemas/auth-schemas';
import { getUserProfileData, updateUserProfileData, ensureUserProfileExists } from '@/lib/firebase/realtime-db';

export interface AppUser extends FirebaseUser, UserProfileData {}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (data: ForgotPasswordFormData) => Promise<void>;
  updateUserDisplayNameAuth: (data: ProfileUpdateFormData) => Promise<void>;
  becomeStoreOwner: () => Promise<void>;
  addTestCredits: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const profileData = await ensureUserProfileExists(currentUser);
        setUser({ ...currentUser, ...profileData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (err instanceof Error && 'code' in err) {
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
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        const profileData = await ensureUserProfileExists(userCredential.user);
        setUser({ ...userCredential.user, ...profileData });
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push('/profile');
      }
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
      if (userCredential.user) {
        if (data.displayName) {
          await firebaseUpdateProfile(userCredential.user, { displayName: data.displayName });
        }
        const profileData = await ensureUserProfileExists(userCredential.user); // This will create the RTDB profile
        setUser({ ...userCredential.user, ...profileData, displayName: data.displayName || userCredential.user.displayName }); 
        toast({ title: 'Registration Successful', description: 'Welcome! Your account has been created.' });
        router.push('/profile');
      }
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
      setUser(null);
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

  const updateUserDisplayNameAuth = async (data: ProfileUpdateFormData) => {
    if (!auth.currentUser || !user) {
      setError("User not logged in.");
      toast({ title: 'Error', description: 'User not logged in.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName: data.displayName });
      await updateUserProfileData(auth.currentUser.uid, { displayName: data.displayName });
      setUser(prevUser => prevUser ? ({ ...prevUser, displayName: data.displayName }) : null);
      toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
    } catch (err) {
      handleAuthError(err, 'Failed to update display name.');
    } finally {
      setLoading(false);
    }
  };

  const becomeStoreOwner = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
      return;
    }
    if ((user.credits || 0) <= 0) {
      toast({ title: 'Action Required', description: 'You need credits to become a store owner. (Use "Add Test Credits" for now)', variant: 'default'});
      return;
    }
    setLoading(true);
    try {
      await updateUserProfileData(user.uid, { isStoreOwner: true });
      setUser(prev => prev ? ({ ...prev, isStoreOwner: true }) : null);
      toast({ title: 'Success!', description: 'You are now a store owner.'});
    } catch (err) {
      handleAuthError(err, 'Failed to update store owner status.');
    } finally {
      setLoading(false);
    }
  };

  const addTestCredits = async (amount: number) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
      return;
    }
    setLoading(true);
    const currentCredits = user.credits || 0;
    const newCredits = currentCredits + amount;
    try {
      await updateUserProfileData(user.uid, { credits: newCredits });
      setUser(prev => prev ? ({ ...prev, credits: newCredits }) : null);
      toast({ title: 'Success!', description: `${amount} credits added.`});
    } catch (err) {
      handleAuthError(err, 'Failed to add credits.');
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
    updateUserDisplayNameAuth,
    becomeStoreOwner,
    addTestCredits,
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
