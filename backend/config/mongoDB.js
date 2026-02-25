import mongoose  from "mongoose";

const connectDB = async()=>{
    try {
        // Skip connection if already connected
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Database already connected');
            return;
        }

        mongoose.connection.on("connected", () => {
            console.log('✅ Database connected successfully');
            console.log('📊 Database name:', mongoose.connection.name);
            console.log('🌐 Host:', mongoose.connection.host);
        });
        
        mongoose.connection.on("error", (err) => {
            console.log('❌ Database connection error:', err);
        });
        
        await mongoose.connect(`${process.env.MONGODB_URI}/habittracker`);
        
        console.log('🔗 Connecting to MongoDB...');
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        // Don't exit on serverless - just log error
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}
export default connectDB