import { Prisma, PrismaClient } from "../generated/prisma";
import { Request, response, Response } from 'express';
import { ZodError } from 'zod';
import { CreateOfertaSchema, OfertaParamsSchema } from '../schemas/OfertaSchema';

const prisma = new PrismaClient();

declare global {
    namespace Express {
      interface Request {
        userId?: string; 
      }
    }
  }

export class OfertaController {
  async createOferta(request: Request, response: Response): Promise<Response> {
    const usuarioId = request.userId; 
    if (!usuarioId) {
      return response.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const { produtoId } = CreateOfertaSchema.parse(request.body); 

      const produto = await prisma.produto.findUnique({
        where: { id: produtoId },
        select: { id: true, titulo: true, vendedorId: true }
      });

      if (!produto) {
        return response.status(404).json({ message: 'Produto não encontrado.' });
      }

      if (produto.vendedorId === usuarioId) {
        return response.status(403).json({ message: 'Você não pode registrar interesse no seu próprio produto.' });
      }

      const oferta = await prisma.oferta.create({
        data: {
          usuarioId: usuarioId,
          produtoId: produtoId,
          dataOferta: new Date(),
        },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          produto: { select: { id: true, titulo: true, preco: true, vendedorId: true } }
        }
      });

      return response.status(201).json(oferta);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return response.status(400).json({ message: "Dados de oferta inválidos.", });
        }
        response.status(500).json({ message: error.message || "Erro interno do servidor ao criar oferta." });
    }
  }

  async deleteOferta(request: Request, response: Response): Promise<Response> {
    const { ofertaId } = OfertaParamsSchema.parse(request.params); 
    const usuarioId = request.userId; 

    if (!usuarioId) {
      return response.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const oferta = await prisma.oferta.findUnique({
        where: { id: ofertaId },
        select: { id: true, usuarioId: true, produto: { select: { vendedorId: true } } }
      });

      if (!oferta) {
        return response.status(404).json({ message: 'Oferta não encontrada.' });
      }

      const isOfferCreator = oferta.usuarioId === usuarioId;
      const isProductOwner = oferta.produto.vendedorId === usuarioId;

      if (!isOfferCreator && !isProductOwner) {
        return response.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar esta oferta.' });
      }

      await prisma.oferta.delete({
        where: { id: ofertaId },
      });

      return response.status(204).send();
    } catch (error: any) {
        if (error instanceof ZodError) {
            return response.status(400).json({ message: "Dados de oferta inválidos.", });
        }
        response.status(500).json({ message: error.message || "Erro interno do servidor ao criar oferta." });
    }
  }
}