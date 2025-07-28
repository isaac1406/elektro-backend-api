import { Prisma, PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class UserController {
    public static async createUser(request: Request, response: Response) {
        try{
            const { nome, email, senha, telefone, endereco } = request.body;

            // cria o usuário no db com o prisma
            const createInput: Prisma.UsuarioCreateInput = {
                nome: nome,
                email: email,
                senhaHash: senha,
                telefone: telefone,
                endereco: endereco,
            };

            const createdUser = await prisma.usuario.create({
				data: createInput,

                // Seleciona quais campos serão retornados paa não expor a senha_hash
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    endereco: true,
                    dataCadastro: true,
                    dataAtualizacao: true,
                },

			});

            response.status(201).json(createdUser);
        } catch (error: any) {
			response.status(500).json({ message: error.message });
		}
    }

    public static async readUser(request: Request, response: Response) {
        try {
            const { userId } = request.params; // Assumindo que o parâmetro na rota é 'userId'

            // Busca o usuário pelo ID
            const foundUsuario = await prisma.usuario.findUnique({ 
                where: {
                    id: userId,
                },
                // Seleciona quais campos serão retornados paa não expor a senha_hash
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    endereco: true,
                    dataCadastro: true,
                    dataAtualizacao: true,
                    // Incluir os anúncios que este usuário publicou
                    anuncios: {
                        // Selecionar apenas os campos mais importantes do anuncio
                        select: {
                            id: true,
                            titulo: true,
                            preco: true,
                            urlImagem: true,
                        }
                    }
                }
            });
            response.status(200).json(foundUsuario);

        } catch (error: any) {
			response.status(500).json({ message: error.message });
		}
    }

    public static async readAllUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    endereco: true,
                    dataCadastro: true,
                    dataAtualizacao: true,
                }
            });

            response.status(200).json(usuarios);

        } catch (error: any) {
            response.status(500).json({ message: error.message });
		}
    }

    public static async updateUser(request: Request, response: Response) {
		try {
			const { userId } = request.params;
			const { nome, email, senhaHash, telefone, endereco } = request.body;

			const createInput: Prisma.UsuarioUpdateInput = {
				nome: nome,
				email: email,
                senhaHash: senhaHash,
                telefone: telefone,
                endereco: endereco
			};

			const updatedUser = await prisma.usuario.update({
				data: createInput,
				where: {
					id: userId,
				},
                // Seleciona quais campos retornar para evitar expor a senha_hash
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    endereco: true,
                    dataCadastro: true,
                    dataAtualizacao: true,
                },
			});

			response.status(200).json(updatedUser);
		} catch (error: any) {
			response.status(500).json({ message: error.message });
		}
	}
    public static async upsertUser(request: Request, response: Response) {
		try {
			const { userId } = request.params;
			const { nome, email, senhaHash, telefone, endereco } = request.body;

			const createInput: Prisma.UsuarioCreateInput = {
				nome: nome,
				email: email,
                senhaHash: senhaHash,
                telefone: telefone,
                endereco: endereco
			};

            const updateInput: Prisma.UsuarioUpdateInput = {
				nome: nome,
				email: email,
                senhaHash: senhaHash,
                telefone: telefone,
                endereco: endereco
			};

			const upsertedUser = await prisma.usuario.upsert({
				create: createInput,
                update: updateInput,
				where: {
					id: userId,
				},
                // Seleciona quais campos retornar para evitar expor a senha_hash
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    endereco: true,
                    dataCadastro: true,
                    dataAtualizacao: true,
                },
			});

			response.status(200).json(upsertedUser);
		} catch (error: any) {
			response.status(500).json({ message: error.message });
		}
	}

    public static async deleteUser(request: Request, response: Response) {
		try {
			const { userId } = request.params;

			const deletedUser = await prisma.usuario.delete({
				where: {
					id: userId,
				},
			});

			response.status(200).json(deletedUser);
		} catch (error: any) {
			response.status(500).json({ message: error.message });
		}
	}

    public static async deleteAllUsers(request: Request, response: Response) {
		try {
			const deletedUser = await prisma.usuario.deleteMany();

			response.status(200).json(deletedUser);
		} catch (error: any) {
			response.status(500).json({ message: error.message });
		}
	}

    public static async login(request: Request, response: Response) {
        const { email, senha } = request.body;

        try {
            // Buscar o usuário pelo email
            const usuario = await prisma.usuario.findUnique({ 
                where: { 
                    email: email,
                 }, 
            });

            if (!usuario) {
                return response.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // Login bem-sucedido: Retornar dados do usuário, excluindo a senha
            const usuarioResponse = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                endereco: usuario.endereco,
                dataCadastro: usuario.dataCadastro,
                dataAtualizacao: usuario.dataAtualizacao,
            };

            return response.status(200).json({ message: 'Login bem-sucedido!', usuario: usuarioResponse });
        } catch (error: any) {
            response.status(500).json({ message: "Erro interno do servidor durante o login.", error: error.message });
        }
    }
}