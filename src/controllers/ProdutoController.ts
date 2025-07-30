import { Prisma, PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ProdutoController {
    public static async createProduto(request: Request, response: Response) {
        try{
            const { titulo, descricao, preco, categoria, urlImagem, vendedorId } = request.body;

            // cria o produto no db com o prisma
            const createInput: Prisma.ProdutoCreateInput = {
                titulo: titulo,
                descricao: descricao,
                preco: preco, 
                categoria: categoria,
                dataPublicacao: new Date(),
                urlImagem: urlImagem,
                // Conecta o produto ao usuário vendedor existente
                vendedor: {
                    connect: {
                        id: vendedorId,
                    },
                },
            };

            const createdProduto = await prisma.produto.create({
                data: createInput,

                // Seleciona quais campos serão retornados para não expor informações desnecessárias
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    preco: true,
                    categoria: true,
                    dataPublicacao: true,
                    urlImagem: true,
                    vendedorId: true, // Inclui o ID do vendedor para referência
                    vendedor: { // Opcional: incluir alguns dados do vendedor
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
            console.error("Erro ao criar produto:", error);
            response.status(500).json({ message: error.message });
        }
    }

    public static async readProduto(request: Request, response: Response) {
        try {
            const { produtoId } = request.params; // Assumindo que o parâmetro na rota é 'userId'

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
            console.error("Erro ao ler produto:", error);
            response.status(500).json({ message: error.message });
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
            const { produtoId } = request.params;
            const { titulo, descricao, preco, categoria, urlImagem } = request.body;

            const updateInput: Prisma.ProdutoUpdateInput = {
                titulo: titulo,
                descricao: descricao,
                preco: preco,
                categoria: categoria,
                urlImagem: urlImagem
            };

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
            console.error("Erro ao atualizar produto:", error);
            response.status(500).json({ message: error.message });
        }
    }
    
    public static async deleteProduto(request: Request, response: Response) {
        try {
            const { produtoId } = request.params;

            const deletedProduto = await prisma.produto.delete({
                where: {
                    id: produtoId,
                },  
            });

            response.status(200).json({ message: "Produto deletado com sucesso.", deletedProduto });
        } catch (error: any) {
            console.error("Erro ao deletar produto:", error);
            response.status(500).json({ message: error.message });
        }
    }
}