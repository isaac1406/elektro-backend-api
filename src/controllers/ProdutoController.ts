import { Prisma, PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { CreateProdutoSchema, UpdateProdutoSchema, ProdutoParamsSchema, VendedorParamsSchema } from "../schemas/ProdutoSchema";
import path from "path";
import fs from "fs"; 

const prisma = new PrismaClient();

export class ProdutoController {
    public static async createProduto(request: Request, response: Response) {
        try {
            // Valida os dados de entrada
            const validatedData = CreateProdutoSchema.parse(request.body);

            let imageUrl: string | undefined = validatedData.urlImagem;

            if (request.file) {
                imageUrl = `/uploads/photos/${path.basename(request.file.path)}`;
            } else if (!validatedData.urlImagem) {
                return response.status(400).json({ message: "É necessário enviar uma imagem ou fornecer uma URL para o produto." });
            }


            const createInput: Prisma.ProdutoCreateInput = {
                titulo: validatedData.titulo,
                descricao: validatedData.descricao,
                preco: validatedData.preco,
                categoria: validatedData.categoria,
                dataPublicacao: new Date(),
                urlImagem: imageUrl,
            
                vendedor: {
                    connect: {
                        id: validatedData.vendedorId,
                    },
                },
            };

            const createdProduto = await prisma.produto.create({
                data: createInput,
                // Seleciona quais campos serão retornados
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    preco: true,
                    categoria: true,
                    dataPublicacao: true,
                    urlImagem: true,
                    vendedorId: true,
                    vendedor: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                        }
                    }
                },
            });

            response.status(201).json(createdProduto);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return response.status(400).json({ message: "Dados de produto inválidos.", });
            }
            response.status(500).json({ message: error.message || "Erro interno do servidor ao criar produto." });
        }
    }


    public static async readProduto(request: Request, response: Response) {
        try {
            // Valida ID
            const { produtoId } = ProdutoParamsSchema.parse(request.params);

            // Busca o usuário pelo ID
            const foundProduto = await prisma.produto.findUnique({ 
                where: {
                    id: produtoId,
                },
                 // Seleciona todos os campos relevantes
                 select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    preco: true,
                    categoria: true,
                    dataPublicacao: true,
                    urlImagem: true,
                    vendedorId: true,
                    vendedor: { // Inclui informações básicas do vendedor
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                        }
                    }
                },
            });

            if (!foundProduto) {
                // Se o produto não for encontrado, retorna 404 (Not Found)
                return response.status(404).json({ message: "Produto não encontrado." });
            }   

            response.status(200).json(foundProduto);

        } catch (error: any) {
            if (error instanceof ZodError) {
                return response.status(400).json({ message: "Parâmetros de produto inválidos.", });
            }

            response.status(500).json({ message: error.message || "Erro interno do servidor ao ler produto." });
        }
    }

    public static async readAllProdutos(request: Request, response: Response) {
        try {
            const produtos = await prisma.produto.findMany({
            select: {
                id: true,
                titulo: true,
                preco: true,
                categoria: true,
                urlImagem: true,
                dataPublicacao: true,
                vendedor: {
                    select: {
                        nome: true,
                    }
                }
            },
            orderBy: { // Ordena os produtos, por exemplo, pelos mais recentes primeiro
                dataPublicacao: 'desc',
            }
        });

            response.status(200).json(produtos);

        } catch (error: any) {
            console.error("Erro ao ler todos os produtos:", error);
            response.status(500).json({ message: error.message });
        }
    }

    public static async updateProduto(request: Request, response: Response) {
        try {
            // Valida ID
            const { produtoId } = ProdutoParamsSchema.parse(request.params);
            // Valida os dados de entrada
            const validatedData = UpdateProdutoSchema.parse(request.body);

            const updateInput: Prisma.ProdutoUpdateInput = {};

            // Popula updateInput com dados validados
            if (validatedData.titulo !== undefined) updateInput.titulo = validatedData.titulo;
            if (validatedData.descricao !== undefined) updateInput.descricao = validatedData.descricao;
            if (validatedData.preco !== undefined) updateInput.preco = validatedData.preco;
            if (validatedData.categoria !== undefined) updateInput.categoria = validatedData.categoria;

            if (request.file) {
                const newImageUrl = `/uploads/photos/${path.basename(request.file.path)}`;
                updateInput.urlImagem = newImageUrl;
            } else if (validatedData.urlImagem !== undefined) {
                updateInput.urlImagem = validatedData.urlImagem;
            }


            const updatedProduto = await prisma.produto.update({
                data: updateInput,
                where: {
                    id: produtoId,
                },
                // Seleciona os campos que serão retornados após a atualização
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    preco: true,
                    categoria: true,
                    dataPublicacao: true,
                    urlImagem: true,
                    vendedorId: true,
                },
            });

            response.status(200).json(updatedProduto);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return response.status(400).json({ message: "Dados de atualização do produto inválidos.", });
            }
            response.status(500).json({ message: error.message  || "Erro interno do servidor ao atualizar produto."});
        }
    }
    
    public static async deleteProduto(request: Request, response: Response) {
        try {
            // Valida ID
            const { produtoId } = ProdutoParamsSchema.parse(request.params);
            
            // Verifica se o produto existe antes de tentar deletar
            const existingProduto = await prisma.produto.findUnique({
                where: { id: produtoId },
                select: { id: true },
            });

            if (!existingProduto) {
                return response.status(404).json({ message: "Produto não encontrado para exclusão." });
            }

            const deletedProduto = await prisma.produto.delete({
                where: {
                    id: produtoId,
                },  
            });

            response.status(200).json({ message: "Produto deletado com sucesso.", deletedProduto });
        } catch (error: any) {
            if (error instanceof ZodError) {
                return response.status(400).json({ message: "Parâmetros de produto inválidos.", });
            }

            response.status(500).json({ message: error.message || "Erro interno do servidor ao deletar produto." });
        }
    }
}