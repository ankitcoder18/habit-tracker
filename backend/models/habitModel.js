import mongoose from "mongoose";
const habitSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true

    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    frequency:{
        type:String,
        required:true
    },
    category:{
        type:String,
        default:"Other",
        enum:["Health", "Work", "Learning", "Fitness", "Mindfulness", "Personal", "Other"]
    },
    reminderTime:{
        type:String, // Format: "HH:MM" (24-hour)
        default:null
    },
    reminderMinutes:{
        type:Number, // Minutes before to remind (5, 10, 15, 30, 60)
        default:10
    },
    logs:[{
        date:String,
        completed:Boolean
    }]
})
const habitModel =mongoose.models.Habit || mongoose.model("Habit", habitSchema)
export default habitModel