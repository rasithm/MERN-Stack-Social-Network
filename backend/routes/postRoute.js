import express from 'express';
import protectRoute from '../middlewire/protectRoute.js';
import { createPost ,deletePost , createComment , likeUnlike ,
         allPost , likedPosters ,getFollowingposters ,getUserPost} from '../controllers/postController.js';

const router = express.Router();


router.post("/create" , protectRoute , createPost);
router.delete('/:id' , protectRoute , deletePost);
router.post('/comment/:id' , protectRoute , createComment);
router.post('/like/:id' , protectRoute , likeUnlike);
router.get('/all' , protectRoute , allPost);
router.get('/likedPosters/:id' , protectRoute , likedPosters);
router.get('/followingPosters', protectRoute , getFollowingposters);
router.get('/user/:username' , protectRoute , getUserPost);
export default router