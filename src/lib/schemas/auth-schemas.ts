
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, {message: 'Password must be at least 6 characters'}),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});
export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
});
export type ProfileUpdateFormData = z.infer<typeof ProfileUpdateSchema>;

// User Profile Data stored in Realtime Database
export interface UserProfileData {
  displayName?: string | null;
  email?: string | null;
  isStoreOwner?: boolean;
  credits?: number;
}

// Categories - aligned with products page for consistency
export const productCategories = [
  "Laptop Gamer", "Smartphone Pro", "Fone Bluetooth", "Smartwatch X", 
  "Tablet 10", "Câmera 4K", "Console NextGen", "Mouse Ergonômico", 
  "Teclado Mecânico", "Monitor Ultrawide"
] as const;

export const ProductAdSchema = z.object({
  name: z.string().min(3, { message: 'Nome do produto deve ter pelo menos 3 caracteres.' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres.' }),
  price: z.coerce.number().positive({ message: 'Preço deve ser um número positivo.' }),
  category: z.enum(productCategories, { errorMap: () => ({ message: 'Selecione uma categoria válida.'})}),
  imageUrl: z.string().url({ message: 'Por favor, insira uma URL de imagem válida.' }),
  adType: z.enum(['standard', 'offer', 'promotion'], { errorMap: () => ({ message: 'Selecione um tipo de anúncio.'})}),
});
export type ProductAdFormData = z.infer<typeof ProductAdSchema>;

export interface ProductAd extends ProductAdFormData {
  id: string;
  storeOwnerId: string;
  storeOwnerName: string; // Denormalized for easier display
  timestamp: number;
  'data-ai-hint'?: string; // Optional for consistency with mock products
}
