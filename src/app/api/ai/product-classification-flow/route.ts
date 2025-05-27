
import {NextRequest, NextResponse} from 'next/server';
import {
  productClassificationFlow,
  ProductClassificationInputSchema
} from '@/ai/flows/product-classification-flow';
import {z} from 'genkit';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = ProductClassificationInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: parseResult.error.flatten() }, { status: 400 });
    }

    const input = parseResult.data;
    const result = await productClassificationFlow(input);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in product classification flow API:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof z.ZodError) {
        errorMessage = 'Validation error in processing AI response.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}
