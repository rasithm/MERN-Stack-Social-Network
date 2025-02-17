import express from 'express';
import protectRoute from '../middlewire/protectRoute.js';
import { getNotification , deleteNotification} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/' , protectRoute , getNotification)
router.delete('/t' , protectRoute , deleteNotification)

export default router