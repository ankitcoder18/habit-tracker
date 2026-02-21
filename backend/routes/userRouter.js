import express from 'express';
import { register, login } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { addHabit, deleteHabit, getHabits, editHabits, MarkCompleted } from '../controllers/habitController.js';
const userRouter= express.Router()
userRouter.post('/register', register)
userRouter.post('/login', login)


userRouter.post('/add-habits', authMiddleware, addHabit)
userRouter.delete('/habits/:id', authMiddleware, deleteHabit)
userRouter.get('/habits',authMiddleware,getHabits)
userRouter.put('/habits/completed/:id',authMiddleware,MarkCompleted)
userRouter.put('/habits/:id',authMiddleware,editHabits)
export default userRouter;