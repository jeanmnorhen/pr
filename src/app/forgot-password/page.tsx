"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail } from 'lucide-react';

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
import { ForgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas/auth-schemas";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const { sendPasswordReset, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/profile");
    }
  }, [user, authLoading, router]);

  async function onSubmit(values: ForgotPasswordFormData) {
    await sendPasswordReset(values);
    // Optionally, clear form or show specific success message in-page
    // form.reset(); // If you want to clear form after submission
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
      title="Reset Your Password"
      description="Enter your email address and we'll send you a link to reset your password."
      footerContent={
        <>
          Remember your password?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
            <Link href="/login">Sign in</Link>
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
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting || authLoading}>
            {form.formState.isSubmitting || authLoading ? <Spinner size="sm" className="mr-2" /> : null}
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
