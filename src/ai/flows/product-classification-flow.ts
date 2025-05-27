
'use server';
/**
 * @fileOverview Flow para classificar produtos e extrair atributos usando IA generativa.
 *
 * - productClassificationFlow - Função que executa a classificação e extração.
 * - ProductClassificationInput - Tipo de entrada para o fluxo.
 * - ProductClassificationOutput - Tipo de saída do fluxo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ProductClassificationInputSchema = z.object({
  productName: z.string().describe('O nome do produto a ser classificado.'),
  productDescription: z.string().describe('A descrição do produto a ser classificada.'),
});
export type ProductClassificationInput = z.infer<typeof ProductClassificationInputSchema>;

export const ProductClassificationOutputSchema = z.object({
  category: z.string().describe('A categoria classificada do produto (ex: Eletrônicos > Celulares).'),
  attributes: z.record(z.any()).describe('Um objeto JSON com atributos chave extraídos do produto (ex: {"material": "couro", "cor": "preto"}).'),
});
export type ProductClassificationOutput = z.infer<typeof ProductClassificationOutputSchema>;

const classifyPrompt = ai.definePrompt({
  name: 'classifyProductCategoryPrompt',
  input: { schema: ProductClassificationInputSchema },
  output: { schema: z.object({ category: ProductClassificationOutputSchema.shape.category }) },
  prompt: `Você é um especialista em categorização de produtos de e-commerce.
Dada a seguinte informação do produto:
Nome: {{{productName}}}
Descrição: {{{productDescription}}}

Classifique este produto em uma hierarquia de categorias concisa e comum em e-commerce (ex: Casa e Cozinha > Móveis > Sofás).
Retorne apenas a string da categoria.
`,
});

const extractAttributesPrompt = ai.definePrompt({
  name: 'extractProductAttributesPrompt',
  input: { schema: ProductClassificationInputSchema },
  output: { schema: z.object({ attributes: ProductClassificationOutputSchema.shape.attributes }) },
  prompt: `Você é um especialista em extração de informações de produtos de e-commerce.
Dada a seguinte informação do produto:
Nome: {{{productName}}}
Descrição: {{{productDescription}}}

Extraia até 5 atributos chave relevantes do produto em formato JSON (ex: {"material": "couro sintético", "cor": "preto", "cancelamento_de_ruido": true}).
Se nenhum atributo óbvio for encontrado, retorne um JSON vazio {}.
Retorne apenas o objeto JSON.
`,
});


export async function classifyAndExtractProductDetails(input: ProductClassificationInput): Promise<ProductClassificationOutput> {
  // Chamada para classificação
  const classificationResponse = await classifyPrompt(input);
  const category = classificationResponse.output?.category || 'Não classificado';

  // Chamada para extração de atributos
  const attributesResponse = await extractAttributesPrompt(input);
  const attributes = attributesResponse.output?.attributes || {};
  
  return { category, attributes };
}


// Definindo o flow (opcional se a função wrapper for suficiente, mas bom para consistência)
const productClassificationFlowInternal = ai.defineFlow(
  {
    name: 'productClassificationFlow',
    inputSchema: ProductClassificationInputSchema,
    outputSchema: ProductClassificationOutputSchema,
  },
  async (input) => {
    return classifyAndExtractProductDetails(input);
  }
);

export async function productClassificationFlow(input: ProductClassificationInput): Promise<ProductClassificationOutput> {
    return productClassificationFlowInternal(input);
}
