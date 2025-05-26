import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

export function AuthFormWrapper({ title, description, children, footerContent }: AuthFormWrapperProps) {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footerContent && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
