import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB  from './config/mongoDB.js'
import userRouter from './routes/userRouter.js'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://*.vercel.app', 'https://*.vercelapp.com'],
    credentials: true
}))
connectDB()
app.use('/api/user', userRouter)

// Database stats endpoint for testing
app.get('/api/db-stats', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const stats = {};
        
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            stats[collection.name] = count;
        }
        
        res.json({
            success: true,
            database: 'habittracker',
            collections: stats,
            connectionState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// app.get('/',(req,res)=>{
//     res.send("hello from server <h1>9555153411</h1>")
// })
// nJzriwHc8BAnK353

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`server conected to port : ${PORT}`);
    })
}

export default app;