import { z } from 'zod';

// schema base para os campos do produto
const BaseProdutoSchema = z.object({
    titulo: z
        .string({ message: "O título deve ser uma string." })
        .min(3, "O título deve ter no mínimo 3 caracteres.")
        .max(100, "O título deve ter no máximo 100 caracteres.")
        .trim(),

    descricao: z
        .string({ message: "A descrição deve ser uma string." })
        .min(10, "A descrição deve ter no mínimo 10 caracteres.")
        .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
        .trim()
        .optional(), 

    preco: z.coerce
        .number({ message: "O preço deve ser um número válido." })
        .min(0.01, "O preço deve ser um valor positivo maior que zero."), 

    categoria: z
        .string({ message: "A categoria deve ser uma string." })
        .min(2, "A categoria deve ter no mínimo 2 caracteres.")
        .max(50, "A categoria deve ter no máximo 50 caracteres.")
        .trim(),

    urlImagem: z
        .string({ message: "A URL da imagem deve ser uma string." })
        .url("A URL da imagem deve ser um formato de URL válido.")
        .max(500, "A URL da imagem deve ter no máximo 500 caracteres.")
        .trim()
        .optional(),
});

// Schema para criação de um produto.
export const CreateProdutoSchema = BaseProdutoSchema.extend({
  vendedorId: z
    .string({ message: "O ID do vendedor deve ser uma string." })
    .uuid("O ID do vendedor deve ser um formato UUID válido."),
});

// Schema para atualização de um produto.
export const UpdateProdutoSchema = BaseProdutoSchema.partial();

// Schema para validação do ID do produto nos parâmetros da URL.
export const ProdutoParamsSchema = z.object({
  produtoId: z
    .string({ message: "O ID do produto deve ser uma string." })
    .uuid("O ID do produto deve ser um formato UUID válido."),
});

// Schema para validação do ID do vendedor nos parâmetros da URL (usado para buscar produtos por vendedor).
export const VendedorParamsSchema = z.object({
  vendedorId: 
    z.string({ message: "O ID do vendedor deve ser uma string." })
    .uuid("O ID do vendedor deve ser um formato UUID válido."), // Assumindo que IDs são UUIDs
});

// Opcional: Inferir tipos TypeScript dos schemas para uso em outras partes do código
export type CreateProdutoInput = z.infer<typeof CreateProdutoSchema>;
export type UpdateProdutoInput = z.infer<typeof UpdateProdutoSchema>;