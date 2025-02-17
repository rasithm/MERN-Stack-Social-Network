import express from 'express';
import protectRoute from '../middlewire/protectRoute.js';
import { getProfile , followUnfollow , getSuggestedUsers ,updateUser} from '../controllers/userControllers.js';


const router = express.Router();

router.get('/profile/:username' , protectRoute ,getProfile);
router.post('/follow/:id' , protectRoute , followUnfollow);
router.get('/suggested' , protectRoute , getSuggestedUsers);
router.post('/update' , protectRoute , updateUser);


export default router;