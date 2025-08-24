import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import mongoose from "mongoose";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../config";
import { Room } from "./room.model";
import { Chat } from "./chat.model";
import { User } from "../user/user.model";
import { sendEmail } from "../../utils/sendEmail";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
}

const ONLINE_USERS_KEY = "online_users";
export const onlineUsers = new Set<string>();
const userSockets = new Map<string, ExtendedWebSocket>();

export async function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: ExtendedWebSocket) => {

    ws.on("message", async (data: string) => {
      try {
        const parsedData = JSON.parse(data);

        switch (parsedData.event) {
          case "authenticate": {
            const token = parsedData.token;

            if (!token) {
              ws.close();
              return;
            }

            const user = jwt.verify(
              token,
              config.JWT_SECRET as string,
            ) as JwtPayload;


            // const user = jwtHelpers.verifyToken(
            //   token,
            //   config.jwt.jwt_secret
            // );

            if (!user) {
              ws.close();
              return;
            }

            const { role, userId, iat } = user;
            // const { id } = user;
            ws.userId = userId;
            onlineUsers.add(userId);
            userSockets.set(userId, ws);

            broadcastToAll(wss, {
              event: "userStatus",
              data: { userId: userId, isOnline: true },
            });
            break;
          }

          case "message": {
            const { receiverId, message, images } = parsedData;

            if (!ws.userId || !receiverId || !message) {
              return;
            }

            let room = await Room.findOne({
              $or: [
                { senderId: ws.userId, receiverId },
                { senderId: receiverId, receiverId: ws.userId },
              ],
            });

            if (!room) {
              room = await Room.create({
                senderId: ws.userId,
                receiverId,
              });
            }

            const chat = await Chat.create({
              senderId: ws.userId,
              receiverId,
              roomId: room._id,
              message,
              images: images || [],
            });

            const receiverSocket = userSockets.get(receiverId);
            if (receiverSocket) {
              receiverSocket.send(
                JSON.stringify({ event: "message", data: chat })
              );
            } else {
              // Send email if user is offline
              const receiver = await User.findById(receiverId);
              if (receiver?.email) {
                const subject = "New Message Received";
                const htmlContent = `
                        <p>You have a new message from a user.</p>
                        <p><strong>Message:</strong> ${chat.message}</p>
                      `;
                await sendEmail(receiver.email, subject, htmlContent);
              }
            }

            ws.send(JSON.stringify({ event: "message", data: chat }));
            break;
          }

          case "toAdminMessage": {
            const { message, images } = parsedData;
            if (!ws.userId || !message) {
              return;
            }

            try {
              // 1. Get admin user (you can refine this by email if needed)
              const adminUser = await User.findOne({ role: "admin" });

              if (!adminUser) {
                ws.send(
                  JSON.stringify({
                    event: "error",
                    message: "Admin user not found",
                  })
                );
                return;
              }

              const receiverId = adminUser._id;

              // 2. Find or create the room
              let room = await Room.findOne({
                $or: [
                  { senderId: ws.userId, receiverId },
                  { senderId: receiverId, receiverId: ws.userId },
                ],
              });

              if (!room) {
                room = await Room.create({
                  senderId: ws.userId,
                  receiverId,
                });
              }

              // 3. Create the chat
              const chat = await Chat.create({
                senderId: ws.userId,
                receiverId,
                roomId: room._id,
                message,
                images: images || [],
              });

              // 4. Send message to receiver (admin)
              const receiverSocket = userSockets.get(receiverId.toString());
              if (receiverSocket) {
                receiverSocket.send(
                  JSON.stringify({ event: "toAdminMessage", data: chat })
                );
              } else {
                // Admin is offline — send email
                const subject = "New Message From User";
                const htmlContent = `
                    <p>You received a message from a user.</p>
                    <p><strong>Message:</strong> ${chat.message}</p>
                  `;
                await sendEmail(adminUser.email, subject, htmlContent);
              }


              // 5. Also send back to sender
              ws.send(JSON.stringify({ event: "toAdminMessage", data: chat }));
            } catch (error) {
              console.error("Error in toAdminMessage:", error);
              ws.send(
                JSON.stringify({
                  event: "error",
                  message: "Failed to send message to admin",
                })
              );
            }

            break;
          }


          case "fetchChats": {
            const { receiverId } = parsedData;
            if (!ws.userId) {
              return;
            }

            const room = await Room.findOne({
              $or: [
                { senderId: ws.userId, receiverId },
                { senderId: receiverId, receiverId: ws.userId },
              ],
            });

            if (!room) {
              ws.send(JSON.stringify({ event: "fetchChats", data: [] }));
              return;
            }

            const chats = await Chat.find({ roomId: room._id }).sort({ createdAt: 1 });

            await Chat.updateMany(
              { roomId: room._id, receiverId: ws.userId },
              { $set: { isRead: true } }
            );

            ws.send(
              JSON.stringify({
                event: "fetchChats",
                data: chats,
              })
            );
            break;
          }
          case "fetchWithAdminChats": {
            if (!ws.userId) {
              return;
            }

            // Get admin user
            const adminUser = await User.findOne({ role: "admin" });

            if (!adminUser) {
              ws.send(
                JSON.stringify({
                  event: "error",
                  message: "Admin user not found",
                })
              );
              return;
            }

            const adminId = adminUser._id.toString();

            // Find room between current user and admin
            const room = await Room.findOne({
              $or: [
                { senderId: ws.userId, receiverId: adminId },
                { senderId: adminId, receiverId: ws.userId },
              ],
            });

            if (!room) {
              ws.send(JSON.stringify({ event: "fetchAdminChats", data: [] }));
              return;
            }

            // Fetch chat history
            const chats = await Chat.find({ roomId: room._id }).sort({ createdAt: 1 });

            // Mark messages as read if the current user is receiver
            await Chat.updateMany(
              { roomId: room._id, receiverId: ws.userId },
              { $set: { isRead: true } }
            );

            ws.send(
              JSON.stringify({
                event: "fetchAdminChats",
                data: chats,
              })
            );
            break;
          }

          case "onlineUsers": {
            const onlineUserList = Array.from(onlineUsers);
            const users = await User.find(
              { _id: { $in: onlineUserList } },
              { _id: 1, email: 1, isApproved: 1, isCompleteProfile: 1, role: 1 }
            );

            ws.send(
              JSON.stringify({
                event: "onlineUsers",
                data: users,
              })
            );
            break;
          }

          case "unReadMessages": {
            const { receiverId } = parsedData;
            if (!ws.userId || !receiverId) {
              return;
            }

            const room = await Room.findOne({
              $or: [
                { senderId: ws.userId, receiverId },
                { senderId: receiverId, receiverId: ws.userId },
              ],
            });

            if (!room) {
              ws.send(JSON.stringify({ event: "noUnreadMessages", data: [] }));
              return;
            }

            const unReadMessages = await Chat.find({
              roomId: room._id,
              isRead: false,
              receiverId: ws.userId,
            });

            const unReadCount = unReadMessages.length;

            ws.send(
              JSON.stringify({
                event: "unReadMessages",
                data: { messages: unReadMessages, count: unReadCount },
              })
            );
            break;
          }

          case "messageList": {
            try {
              const rooms = await Room.find({
                $or: [{ senderId: ws.userId }, { receiverId: ws.userId }],
              }).populate({
                path: "chat",
                options: { sort: { createdAt: -1 }, limit: 1 },
              });

              const userIds = rooms.map((room) =>
                room.senderId.toString() === ws.userId ? room.receiverId : room.senderId
              );

              const userInfos = await User.find(
                { _id: { $in: userIds } },
                { image: 1, name: 1, _id: 1 }
              );

              const userWithLastMessages = rooms.map((room) => {
                const otherUserId =
                  room.senderId.toString() === ws.userId ? room.receiverId : room.senderId;
                const userInfo = userInfos.find(
                  (user) => user._id.toString() === otherUserId.toString()
                );

                return {
                  user: userInfo || null,
                  lastMessage: room.chat[0] || null,
                };
              });

              ws.send(
                JSON.stringify({
                  event: "messageList",
                  data: userWithLastMessages,
                })
              );
            } catch (error) {
              console.error(
                "Error fetching user list with last messages:",
                error
              );
              ws.send(
                JSON.stringify({
                  event: "error",
                  message: "Failed to fetch users with last messages",
                })
              );
            }
            break;
          }

          default:
            console.log("Unknown event type:", parsedData.event);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        onlineUsers.delete(ws.userId);
        userSockets.delete(ws.userId);

        broadcastToAll(wss, {
          event: "userStatus",
          data: { userId: ws.userId, isOnline: false },
        });
      }
      console.log("User disconnected");
    });
  });

  return wss;
}

function broadcastToAll(wss: WebSocketServer, message: object) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}