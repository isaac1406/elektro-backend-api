import { z } from 'zod';

export const CreateOfertaSchema = z.object({
  produtoId: z
    .string({ message: "O ID do produto deve ser uma string." })
    .uuid("O ID do produto deve ser um formato UUID válido."),
});

export const OfertaParamsSchema = z.object({
  ofertaId: z
    .string({ message: "O ID do produto deve ser uma string." })
    .uuid("O ID da oferta deve ser um formato UUID válido."),
});

export const UsuarioOfertasParamsSchema = z.object({
  usuarioId: z
    .string({ message: "O ID do produto deve ser uma string." })
    .uuid("O ID do usuário deve ser um formato UUID válido."),
});

export const ProdutoOfertasParamsSchema = z.object({
  produtoId: z
    .string({ message: "O ID do produto deve ser uma string." })
    .uuid("O ID do produto deve ser um formato UUID válido."),
});

export type CreateOfertaInput = z.infer<typeof CreateOfertaSchema>;