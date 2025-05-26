"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, KeyRound } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { LoginSchema, type LoginFormData } from "@/lib/schemas/auth-schemas";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  async function onSubmit(values: LoginFormData) {
    await login(values);
  }

  if (authLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthFormWrapper
      title="Sign In"
      description="Enter your credentials to access your account."
      footerContent={
        <>
          Don't have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
            <Link href="/register">Sign up</Link>
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Mail size={16}/> Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><KeyRound size={16}/> Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-sm text-right">
            <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
                <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || authLoading}>
            {form.formState.isSubmitting || authLoading ? <Spinner size="sm" className="mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
