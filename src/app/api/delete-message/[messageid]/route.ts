import UserModel, { Message } from '@/Model/User.model';
import { getServerSession } from 'next-auth/next';
import dbconnection from '@/lib/dbconnection';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;

  await dbconnection

  const session = await getServerSession(authOptions);
  const _user = session?.user as User;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Using $pull to remove a message by _id
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { Message: { _id: messageId } as unknown as Message } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}
