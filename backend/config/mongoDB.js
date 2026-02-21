import mongoose  from "mongoose";

const connectDB = async()=>{
    try {
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
        process.exit(1);
    }
}
export default connectDB