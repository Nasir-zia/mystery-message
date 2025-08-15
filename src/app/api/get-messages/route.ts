import { User } from "next-auth";
import UserModel from "@/Model/User.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbconnection from "@/lib/dbconnection";
import mongoose from "mongoose";

export async function GET() {
  await dbconnection();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        message: "Unauthorized",
        success: false,
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
        {$match : {_id : userId}},
        {$unwind : '$messages'},
        {$sort :{'messages.createdAt':-1}},
        {$group:{_id:'$_id',messages : {$push:'$messages'}}}
    ])
    
    if(!user || user.length === 0){
        return Response.json({
            message: "No messages found",
            success: true,
            messages: []
        }, {status :200})
    }
    
    return Response.json({
        message: "Messages fetched successfully",
        success: true,
        messages: user[0].messages,
    }, {status :200})

    
  } catch (error) {
    console.log(error);
    return Response.json({
        message: "Error fetching messages",
        success: false,
    },{status : 500})
  }
}
