import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { ProdutoController } from "../controllers/ProdutoController";

const router = Router(); 

// Rotas de Usuário
router.post('/user', UserController.createUser);
router.post('/user/login', UserController.login);    
router.get('/user', UserController.readAllUsers);
router.get('/user/:userId', UserController.readUser);
router.put('/user/:userId', UserController.updateUser);
router.delete('/user/:userId', UserController.deleteUser);

// Rotas de Produto
router.post('/produto', ProdutoController.createProduto);
router.get('/produto', ProdutoController.readAllProdutos);
router.get('/produto/:produtoId', ProdutoController.readProduto);
router.put('/produto/:produtoId', ProdutoController.updateProduto);
router.delete('/produto/:produtoId', ProdutoController.deleteProduto);

export default router;