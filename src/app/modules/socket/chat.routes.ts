import express, { Request, Response } from 'express';
import auth from '../../middleware/auth';
import { Chat } from './chat.model';


const router = express.Router();

const getChatsBetweenUsers = async (userAId?: string, userBId?: string) => {
  const chats = await Chat.find({
    $or: [
      { senderId: userAId, receiverId: userBId },
      { senderId: userBId, receiverId: userAId },
    ],
  })
    .populate("senderId", "name email role")
    .populate("receiverId", "name email role")
    .sort({ createdAt: 1 });

  return chats;
};

router.get('/', auth('admin'), async (req: Request, res: Response) => {
  const { tenantId, landlordId } = req.query;

  try {
    const chats = await getChatsBetweenUsers(tenantId as string, landlordId as string);

    res.status(201).json({
      success: true,
      data: chats,
      message: 'Chats fetched successfully',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
})


export const ChatRoutes = router;