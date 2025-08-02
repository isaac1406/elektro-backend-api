import { Prisma, PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import { ZodError } from "zod";
import bcrypt from "bcryptjs"; 
import { createUserSchema, updateUserSchema, userParamsSchema, loginSchema } from "../schemas/UserSchema";
import nodemailer from 'nodemailer';
import auth from "../config/auth";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT, 
    auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.PASSWORD,
    },
});

async function sendConfirmationEmail(userEmail: string, userName: string) {
    const mailOptions = {
        from: process.env.MAIL_SENDER, 
        to: userEmail,
        subject: `Confirmação do Cadastro de ${userEmail}!`, 
        message: `Seja Bem Vindo ${userName}` 
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de confirmação enviado para ${userEmail}`);
    } catch (error) {
        console.error(`Erro ao enviar e-mail de confirmação para ${userEmail}:`, error);
    }
}

export class UserController {
    public static async createUser(request: Request, response: Response) {
        try{
            // validar dados
            const validatedData = createUserSchema.parse(request.body);

            // Hash da senha
            const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

            // cria o usuário no db com o prisma
            const createInput: Prisma.UsuarioCreateInput = {
                nome: validatedData.nome,
                email: validatedData.email,
                senhaHash: hashedPassword,
                dataCadastro: new Date(),
                telefone: validatedData.telefone,
                endereco: validatedData.endereco,
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
                },

			});

            await sendConfirmationEmail(createdUser.email, createdUser.nome);

            response.status(201).json(createdUser);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return response
                  .status(400)
                  .json({ message: "Dados de entrada inválidos." });
              }
              
              response.status(500).json({ message: error.message || "Erro interno do servidor." });
		}
    }

    public static async readUser(request: Request, response: Response) {
        try {
            // Validação ID
            const { userId } = userParamsSchema.parse(request.params);
        
            // Busca o usuário pelo ID
            const foundUsuario = await prisma.usuario.findUnique({
                where: {
                id: userId,
                },
                // Seleciona quais campos serão retornados para não expor a senha_hash
                select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                endereco: true,
                dataCadastro: true,
                // Incluir os anúncios que este usuário publicou
                produtos: {
                    // Selecionar apenas os campos mais importantes do anuncio
                    select: {
                    id: true,
                    titulo: true,
                    preco: true,
                    urlImagem: true,
                    },
                },
                },
            });
        
            if (!foundUsuario) {
                return response.status(404).json({ message: "Usuário não encontrado." });
            }
        
            response.status(200).json(foundUsuario);
            } catch (error: any) {
            if (error instanceof ZodError) {
                return response
                .status(400)
                .json({ message: "Parâmetros inválidos."});
            }

            response.status(500).json({ message: error.message || "Erro interno do servidor." });
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
                }
            });

            response.status(200).json(usuarios);

        } catch (error: any) {
            response.status(500).json({ message: error.message });
		}
    }

    public static async updateUser(request: Request, response: Response) {
        try {
            // Validação ID
            const { userId } = userParamsSchema.parse(request.params);
    
            // Validação dos dados de entrada
            const validatedData = updateUserSchema.parse(request.body);
            
            // Verifica se o usuário existe 
            const existingUser = await prisma.usuario.findUnique({
                where: { id: userId },
                select: { id: true },
            });
        
            if (!existingUser) {
                return response.status(404).json({ message: "Usuário não encontrado para atualização." });
            }
        
            const updateInput: Prisma.UsuarioUpdateInput = {
                nome: validatedData.nome,
                email: validatedData.email,
                telefone: validatedData.telefone,
                endereco: validatedData.endereco,
            };
        
            // Se uma nova senha for fornecida, fazer o hash e adicionar ao updateInput
            if (validatedData.senha) {
                updateInput.senhaHash = await bcrypt.hash(validatedData.senha, 10);
            }
        
            const updatedUser = await prisma.usuario.update({
                data: updateInput,
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
                },
            });
        
            response.status(200).json(updatedUser);
            } catch (error: any) {
            if (error instanceof ZodError) {
                return response
                .status(400)
                .json({ message: "Dados de entrada inválidos." });
            }

            response.status(500).json({ message: error.message || "Erro interno do servidor." });
        }
    }    
    
    public static async deleteUser(request: Request, response: Response) {
        try {
            // Validação ID
            const { userId } = userParamsSchema.parse(request.params);
        
            // Verifica se o usuário existe 
            const existingUser = await prisma.usuario.findUnique({
                where: { id: userId },
                select: { id: true },
            });
        
            if (!existingUser) {
                return response.status(404).json({ message: "Usuário não encontrado para exclusão." });
            }
        
            const deletedUser = await prisma.usuario.delete({
                where: {
                id: userId,
                },
            });
        
            response.status(200).json({ message: "Usuário deletado com sucesso.", deletedUser });
            } catch (error: any) {
            if (error instanceof ZodError) {
                return response
                .status(400)
                .json({ message: "Parâmetros inválidos." });
            }

            response.status(500).json({ message: error.message || "Erro interno do servidor." });
        }
    }

    public static async login(request: Request, response: Response) {
        try {
            // Validação dos dados de entrada
            const { email, senha } = loginSchema.parse(request.body);
        
            // Buscar o usuário pelo email
            const usuario = await prisma.usuario.findUnique({
                where: {
                email: email,
                },
            });
        
            if (!usuario) {
                return response.status(401).json({ message: "Credenciais inválidas (e-mail ou senha)." });
            }
        
            // Comparar a senha fornecida com a senha hashed no banco de dados
            const isPasswordValid = await bcrypt.compare(senha, usuario.senhaHash);
        
            if (!isPasswordValid) {
                return response.status(401).json({ message: "Credenciais inválidas (e-mail ou senha)." });
            }
            
            // Gerar token
            const token = auth.generateJWT(usuario);
        
            // Login bem-sucedido: Retornar dados do usuário, excluindo a senhaHash
            const usuarioResponse = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                endereco: usuario.endereco,
                dataCadastro: usuario.dataCadastro,
            };
        
            return response.status(200).json({ message: "Login bem-sucedido!", usuario: usuarioResponse, token });
            } catch (error: any) {
            if (error instanceof ZodError) {
                return response
                .status(400)
                .json({ message: "Dados de entrada inválidos." });
            }
            response.status(500).json({ message: "Erro interno do servidor durante o login.", error: error.message });
        }
    }
}