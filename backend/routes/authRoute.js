import express from 'express';
import {signup,login,logout,getme} from '../controllers/authControllers.js'
import protectRoute from '../middlewire/protectRoute.js'; 
const router = express.Router();


router.post('/signup' , signup );
router.post('/login' , login);
router.post('/logout' , logout);
router.get('/me', protectRoute ,getme);

export default router;