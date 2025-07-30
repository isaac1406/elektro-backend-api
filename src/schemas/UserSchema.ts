import { z } from "zod";

// Schema para as regras de senha
export const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve conter no mínimo 8 caracteres." })
  .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." })
  .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula." })
  .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." })
  .regex(/[^a-zA-Z0-9]/, { message: "A senha deve conter pelo menos um caractere especial." });

// 1. Schema para Criação de Usuário (createUser)
export const createUserSchema = z.object({
  nome: z
    .string({ message: "O nome é obrigatório." })
    .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
    .max(100, { message: "O nome não pode exceder 100 caracteres." }),
  email: z
    .string({ message: "O e-mail é obrigatório." })
    .email({ message: "Formato de e-mail inválido." }),
  senha: passwordSchema, 
  telefone: z
    .string({ message: "O telefone é obrigatório." })
    .regex(/^\d{10,11}$/, { message: "Telefone inválido. Deve conter 10 ou 11 dígitos (DDD + número)." }),
  endereco: z
    .string({ message: "O endereço é obrigatório." })
    .min(5, { message: "O endereço deve ter no mínimo 5 caracteres." })
    .max(255, { message: "O endereço não pode exceder 255 caracteres." }),
});

// 2. Schema para Atualização de Usuário (updateUser)
export const updateUserSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
    .max(100, { message: "O nome não pode exceder 100 caracteres." })
    .optional(),
  email: z
    .string()
    .email({ message: "Formato de e-mail inválido." })
    .optional(),
  senha: passwordSchema.optional(), // Senha opcional para atualização
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, { message: "Telefone inválido. Deve conter 10 ou 11 dígitos (DDD + número)." })
    .optional(),
  endereco: z
    .string()
    .min(5, { message: "O endereço deve ter no mínimo 5 caracteres." })
    .max(255, { message: "O endereço não pode exceder 255 caracteres." })
    .optional(),
});

// 3. Schema para Parâmetros de Usuário (userId na URL)
export const userParamsSchema = z.object({
  userId: z
    .string({ message: "O ID do usuário é obrigatório." })
    .uuid({ message: "ID de usuário inválido. Deve ser um UUID válido." }),
});

// 4. Schema para Login
export const loginSchema = z.object({
  email: z
    .string({ message: "O e-mail é obrigatório." })
    .email({ message: "Formato de e-mail inválido." }),
  senha: z
    .string({ message: "A senha é obrigatória." })
    .min(1, { message: "A senha não pode ser vazia." }),
});