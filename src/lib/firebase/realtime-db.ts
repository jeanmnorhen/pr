
// src/lib/firebase/realtime-db.ts
import { db } from './config';
import { ref, set, onValue, push, serverTimestamp, off, type DataSnapshot, query, orderByChild, limitToLast, update, get, child } from 'firebase/database';
import type { User } from 'firebase/auth';
import type { UserProfileData, ProductAdFormData } from '@/lib/schemas/auth-schemas';

// Interface para os dados básicos do produto salvos inicialmente ou vindos do scraping
export interface ProductData {
  nome_produto: string;
  descricao?: string;
  url_produto?: string;
  url_imagem_produto: string;
  preco?: string;
  disponibilidade?: string;
  nome_vendedor?: string;
  timestamp?: number | object; // Pode ser número ou serverTimestamp
  category?: string; // Adicionado para classificação
  attributes?: Record<string, any>; // Adicionado para atributos
  'data-ai-hint'?: string; // Para consistência com mock
}

// Interface para o produto completo com ID do RTDB
export interface Product extends ProductData {
  id: string;
}


export interface Message {
  id: string;
  text: string;
  timestamp: number;
  userId?: string; 
  userName?: string;
}

const MESSAGES_PATH = 'messages';
const USERS_PATH = 'users';
const PRODUCTS_PATH = 'products'; // Novo caminho para produtos catalogados
const STORE_PRODUCTS_PATH = 'storeProducts'; // Para anúncios específicos de lojas

export async function addMessage(messageText: string, user: User | null): Promise<void> {
  if (!messageText.trim()) {
    throw new Error('Message text cannot be empty.');
  }
  try {
    const messagesRef = ref(db, MESSAGES_PATH);
    const newMessageRef = push(messagesRef);
    
    const messageData: { text: string; timestamp: object; userId?: string; userName?: string } = {
      text: messageText,
      timestamp: serverTimestamp(),
    };

    if (user) {
      messageData.userId = user.uid;
      messageData.userName = user.displayName || user.email || 'Anonymous';
    } else {
      messageData.userName = 'Guest';
    }

    await set(newMessageRef, messageData);
  } catch (error) {
    console.error("Error adding message to Realtime Database:", error);
    throw error;
  }
}

export function subscribeToMessages(callback: (messages: Message[]) => void, messageLimit: number = 25): () => void {
  const messagesQuery = query(ref(db, MESSAGES_PATH), orderByChild('timestamp'), limitToLast(messageLimit));
  
  const listener = onValue(messagesQuery, (snapshot: DataSnapshot) => {
    const messagesData = snapshot.val();
    if (messagesData) {
      const messagesList: Message[] = Object.keys(messagesData).map(key => ({
        id: key,
        ...messagesData[key]
      })).sort((a, b) => a.timestamp - b.timestamp);
      callback(messagesList);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error subscribing to messages:", error);
    callback([]);
  });

  return () => off(messagesQuery, 'value', listener);
}

export async function getUserProfileData(userId: string): Promise<UserProfileData | null> {
  try {
    const userProfileRef = child(ref(db, USERS_PATH), `${userId}/profile`);
    const snapshot = await get(userProfileRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
}

export async function updateUserProfileData(userId: string, data: Partial<UserProfileData>): Promise<void> {
  try {
    const userProfileRef = child(ref(db, USERS_PATH), `${userId}/profile`);
    await update(userProfileRef, data);
  } catch (error) {
    console.error("Error updating user profile data:", error);
    throw error;
  }
}

export async function ensureUserProfileExists(user: User): Promise<UserProfileData> {
  let profileData = await getUserProfileData(user.uid);
  if (!profileData) {
    const initialProfile: UserProfileData = {
      displayName: user.displayName || null,
      email: user.email || null,
      isStoreOwner: false,
      credits: 0,
    };
    await updateUserProfileData(user.uid, initialProfile);
    return initialProfile;
  }
  const updates: Partial<UserProfileData> = {};
  if (profileData.displayName === undefined) updates.displayName = user.displayName || null;
  if (profileData.email === undefined) updates.email = user.email || null;
  if (profileData.isStoreOwner === undefined) updates.isStoreOwner = false;
  if (profileData.credits === undefined) updates.credits = 0;
  if (Object.keys(updates).length > 0) {
    await updateUserProfileData(user.uid, updates);
    profileData = { ...profileData, ...updates };
  }
  return profileData;
}

// Para salvar anúncios de produtos de lojistas
export interface ProductAd extends ProductAdFormData {
  id: string;
  storeOwnerId: string;
  storeOwnerName: string; 
  timestamp: number | object;
  'data-ai-hint'?: string; 
}


export async function addProductAd(
  userId: string,
  storeOwnerName: string,
  productData: ProductAdFormData
): Promise<string> {
  try {
    const userProductsRef = ref(db, `${STORE_PRODUCTS_PATH}/${userId}`);
    const newProductRef = push(userProductsRef);
    const newProductId = newProductRef.key;
    if (!newProductId) {
      throw new Error("Failed to generate new product ID.");
    }

    const fullProductData: Omit<ProductAd, 'id'> = {
      ...productData,
      storeOwnerId: userId,
      storeOwnerName: storeOwnerName,
      timestamp: serverTimestamp(),
    };
    await set(newProductRef, fullProductData);
    return newProductId;
  } catch (error) {
    console.error("Error adding product ad to Realtime Database:", error);
    throw error;
  }
}

export async function getStoreProducts(storeId: string): Promise<ProductAd[]> {
  try {
    const storeProductsRef = query(ref(db, `${STORE_PRODUCTS_PATH}/${storeId}`), orderByChild('timestamp'));
    const snapshot = await get(storeProductsRef);
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      const productsList: ProductAd[] = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      })).sort((a, b) => (b.timestamp as number) - (a.timestamp as number)); 
      return productsList;
    }
    return [];
  } catch (error) {
    console.error("Error fetching store products:", error);
    return [];
  }
}


// Funções para o catálogo geral de produtos identificados
export async function saveProductToDB(productData: ProductData): Promise<string> {
  try {
    const productsRefPath = ref(db, PRODUCTS_PATH);
    const newProductRef = push(productsRefPath);
    const productId = newProductRef.key;
    if (!productId) {
      throw new Error("Failed to generate product ID");
    }
    const dataToSave = { ...productData, timestamp: productData.timestamp || serverTimestamp() };
    await set(newProductRef, dataToSave);
    return productId;
  } catch (error) {
    console.error("Error saving product to Realtime Database:", error);
    throw error;
  }
}

export async function updateProductInDB(productId: string, dataToUpdate: Partial<ProductData>): Promise<void> {
  try {
    const productRefPath = ref(db, `${PRODUCTS_PATH}/${productId}`);
    await update(productRefPath, dataToUpdate);
  } catch (error) {
    console.error(`Error updating product ${productId} in Realtime Database:`, error);
    throw error;
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void, limit: number = 20): () => void {
  const productsQuery = query(ref(db, PRODUCTS_PATH), orderByChild('timestamp'), limitToLast(limit));
  
  const listener = onValue(productsQuery, (snapshot: DataSnapshot) => {
    const productsData = snapshot.val();
    if (productsData) {
      const productsList: Product[] = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      })).sort((a, b) => (b.timestamp as number) - (a.timestamp as number)); // Mais recentes primeiro
      callback(productsList);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error subscribing to products:", error);
    callback([]);
  });

  return () => off(productsQuery, 'value', listener);
}
