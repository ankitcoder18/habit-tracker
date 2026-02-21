import habitModel from "../models/habitModel.js";

const addHabit = async(req, res)=>{
    try {
        const userId=req.user?.id
        const {name,description,frequency,category,reminderTime,reminderMinutes} = req.body
        
        console.log("=== AddHabit Called ===");
        console.log("User ID:", userId);
        console.log("Habit data:", { name, description, frequency, category, reminderTime, reminderMinutes });
        
        if(!name || !description || !frequency){
               return res.status(401).json({success:false, message:"all fields required"})
        }
        
        const currentDate = new Date().toISOString().split('T')[0]
        const newLogEntry = {date: currentDate, completed: false}
        const logs = [newLogEntry]

        const newHabit = new habitModel({
            userId,
            name,
            description,
            frequency,
            category: category || "Other",
            reminderTime: reminderTime || null,
            reminderMinutes: reminderMinutes || 10,
            logs
        })

        const saveHabit = await newHabit.save()
        console.log("Habit saved successfully with ID:", saveHabit._id);
        
        res.status(201).json({success:true, message:"habit added successfully", data:saveHabit})

    } catch (error) {
        console.log("ERROR in addHabit:", error.message);
        console.log("Full error:", error);
        res.status(500).json({success:false, message:"internal server error: " + error.message})
    }
}

const deleteHabit = async(req,res)=>{
    try {
        const habitId = req.params.id;

        const deletedHabit = await habitModel.findByIdAndDelete(habitId)
        if(!deletedHabit){

            return res.status(404).json({success:false, message:"habit not found"})
        }

        res.status(200).json({success:true, message:"habit deleted successfully"})
        
    } catch (error) {
          console.log(error);
        res.status(500).json({success:false, message:"internal server error."})
        
    }

}

const getHabits = async(req,res)=>{
    try {
        const userId = req.user?.id

        if(!userId){
            return res.status(400).json({success:false,message:"user not found"})
        }

        const habits = await habitModel.find({userId}).exec()

        if(!habits || habits.length === 0){
            return res.status(200).json({success:true, data:[]})
        }

        res.status(200).json({success:true,data:habits})
        
    } catch (error) {
         console.log(error);
        res.status(500).json({success:false, message:"internal server error."})
            
    }
}

const editHabits = async(req,res)=>{
    try {
        const habitId  = req.params;
        const userId= req.user?.id
        const {name, description, frequency,logs}= req.body


        const habit = await habitModel.findByIdAndUpdate(
            {_id:habitId, userId:userId},
            {name,description,frequency, logs},
            {new:true}
        )

        if(!habit){
            return res.status(404).json({message:"Habit not found"})
        }

        res.status(200).json({success:true, message:"habit updated successfully", data:habit})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:"internal server error."})
            
    }
}

const MarkCompleted = async(req,res)=>{
    try {
        const habitId = req.params.id;
        const receivedDate = req.body.date || new Date().toISOString().split('T')[0]
        const selectedDate = receivedDate.split('T')[0]
        
        console.log("=== MarkCompleted Called ===");
        console.log("Habit ID:", habitId);
        console.log("Selected Date:", selectedDate);
        console.log("User ID:", req.user?.id);
        
        const habit = await habitModel.findById(habitId);
        
        if(!habit){
            console.log("ERROR: Habit not found with ID:", habitId);
            return res.status(404).json({success:false, message:"Habit not found"})
        }

        console.log("Found habit:", habit.name);
        console.log("Current logs count:", habit.logs.length);

        // Find if a log entry exists for this date
        const logIndex = habit.logs.findIndex(log => {
            const logDate = log.date.split('T')[0];
            return logDate === selectedDate;
        });
        
        if(logIndex !== -1){
            console.log("Updating existing log at index:", logIndex);
            habit.logs[logIndex].completed = true;
        } else {
            console.log("Adding new log for date:", selectedDate);
            habit.logs.push({
                date: selectedDate,
                completed: true
            });
        }
        
        const updatedHabit = await habit.save();
        console.log("Habit saved successfully. New logs count:", updatedHabit.logs.length);
        
        res.status(200).json({success:true, message:"habit marked successfully", data:updatedHabit})

    } catch (error) {
        console.log("ERROR in MarkCompleted:", error.message);
        console.log("Full error:", error);
        res.status(500).json({success:false, message:"internal server error: " + error.message})
    }

}
export {addHabit, deleteHabit, getHabits,editHabits,MarkCompleted}