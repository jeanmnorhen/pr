"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserCircle, Mail, Edit3 } from 'lucide-react';

import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileUpdateSchema, type ProfileUpdateFormData } from "@/lib/schemas/auth-schemas";

export default function ProfilePage() {
  const { user, loading, logout, updateUserDisplayName } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || "",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user && user.displayName !== form.getValues("displayName")) {
      form.reset({ displayName: user.displayName || "" });
    }
  }, [user, loading, router, form]);

  async function onSubmit(values: ProfileUpdateFormData) {
    await updateUserDisplayName(values);
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-20 w-20 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
          <CardDescription>Manage your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Mail size={18} /> Email</h3>
            <p className="text-muted-foreground bg-muted p-3 rounded-md">{user.email}</p>
            {user.emailVerified === false && (
                <p className="text-sm text-yellow-600">Your email is not verified.</p>
            )}
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Edit3 size={18} /> Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting || loading}>
                {form.formState.isSubmitting || loading ? <Spinner size="sm" className="mr-2" /> : null}
                Update Display Name
              </Button>
            </form>
          </Form>

          <Button variant="destructive" onClick={logout} className="w-full mt-6" disabled={loading}>
             {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
