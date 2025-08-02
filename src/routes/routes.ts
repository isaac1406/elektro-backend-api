import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { ProdutoController } from "../controllers/ProdutoController";
import { OfertaController } from "../controllers/OfertaController";
import authenticate from "../middlewares/authentication";
import { photoUpload } from "../config/uploader";

const router = Router(); 

// Rotas de Usuário

//Rotas Públicas
router.post('/user', UserController.createUser);
router.post('/user/login', UserController.login);

// Rotas Protegidas
router.get('/user', authenticate, UserController.readAllUsers);
router.get('/user/:userId', authenticate, UserController.readUser);
router.put('/user/:userId', authenticate, UserController.updateUser);
router.delete('/user/:userId', authenticate, UserController.deleteUser);

// Rotas de Produto
// Rotas Públicas
router.get('/produto', ProdutoController.readAllProdutos);
router.get('/produto/:produtoId', ProdutoController.readProduto);

// Rotas Protegidas
router.post('/produto', authenticate, photoUpload.single('imagemProduto'), ProdutoController.createProduto);
router.put('/produto/:produtoId', authenticate, photoUpload.single('imagemProduto'), ProdutoController.updateProduto);
router.delete('/produto/:produtoId', authenticate, ProdutoController.deleteProduto);

// 1. Criar uma nova oferta (registrar interesse)
// Requisito: "Inserir a relação de uma instância específica de um objeto com uma instância específica de outro objeto."
// POST /ofertas
router.post('/ofertas', authenticate, new OfertaController().createOferta);

// 2. Deletar uma oferta (retirar o registro de interesse)
// Requisito: "Remover a relação de uma instância específica."
// DELETE /ofertas/:ofertaId
router.delete('/ofertas/:ofertaId', authenticate, new OfertaController().deleteOferta);

export default router;