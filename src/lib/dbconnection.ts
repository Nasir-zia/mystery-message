import mongoose from "mongoose";

type connectionobject = {
    isConnected?: number;
}

const connection : connectionobject = {}

async function dbconnection() : Promise <void> {
    if(connection.isConnected) {
        console.log("Already connected to the database");
        return;
    }

    try {
      const db =   await mongoose.connect(process.env.MONGODB_URI || '')
      connection.isConnected = db.connections[0].readyState;
      console.log("Connected to the database successfully");
    
}
    catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}
export default dbconnection;
