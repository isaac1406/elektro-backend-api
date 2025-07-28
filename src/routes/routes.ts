import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router(); 

router.post('/user', UserController.createUser);
router.post('/user/login', UserController.login);    
router.get('/user/all', UserController.readAllUsers);
router.get('/user/:userId', UserController.readUser);
router.put('/user/update/:userId', UserController.updateUser);
router.put('/user/upsert/:userId', UserController.upsertUser);
router.delete('/user/:userId', UserController.deleteUser);
router.delete('/user/all', UserController.deleteAllUsers);

export default router;