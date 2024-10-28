import { WebSocketServer, WebSocket, RawData } from "ws";
import { PlayerService } from "./services/Player";
import { RoomService } from "./services/Room";
import {
  CustomWebSocket,
  Message,
  MessageType,
  RegistrationData,
} from "../lib/types";

const playerService = new PlayerService();
const roomService = new RoomService();

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port }, () => {
    console.log(`WebSocket Server is running on port ${port}`);
  });

  wss.on("connection", (ws: CustomWebSocket) => {
    console.log("New client connected");
    ws.id = Math.random().toString(36).substring(7);

    ws.on("message", (rawMessage: RawData) => {
      try {
        const message: Message = JSON.parse(rawMessage.toString());
        console.log("Received:", message);

        if (
          message.data &&
          typeof message.data === "string" &&
          message.data !== ""
        ) {
          try {
            message.data = JSON.parse(message.data);
          } catch (e) {
            console.log("Data is not JSON:", message.data);
          }
        }

        handleMessage(ws, message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`Client ${ws.id} disconnected`);
    });

    ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });
  });

  function sendMessage(
    ws: CustomWebSocket,
    type: MessageType,
    data: any
  ): void {
    const messageData = typeof data === "string" ? data : JSON.stringify(data);
    const message = JSON.stringify({
      type,
      data: messageData,
      id: 0,
    });
    console.log("Sending message:", message);
    ws.send(message);
  }

  function broadcast(type: MessageType, data: any): void {
    const messageData = typeof data === "string" ? data : JSON.stringify(data);
    const message = JSON.stringify({
      type,
      data: messageData,
      id: 0,
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function handleCreateRoom(ws: CustomWebSocket): void {
    console.log("Creating room for player:", ws.playerName);

    if (!ws.playerName || !ws.playerIndex) {
      console.error("Player not registered");
      return;
    }

    if (roomService.isPlayerInAnyRoom(ws.playerIndex)) {
      console.log("Player already in room:", ws.playerName);
      return;
    }

    const room = roomService.createRoom(ws.playerName, ws.playerIndex);

    const rooms = roomService.getRooms().map((room) => ({
      roomId: room.id,
      roomUsers: room.roomUsers,
    }));

    broadcast(MessageType.UPDATE_ROOM, rooms);
  }

  function handleJoinRoom(ws: CustomWebSocket, data: any): void {
    console.log("Player joining room:", { player: ws.playerName, data });

    if (!ws.playerName || !ws.playerIndex) {
      console.error("Player not registered");
      return;
    }

    const { indexRoom } = data;
    const room = roomService.addUserToRoom(
      indexRoom,
      ws.playerName,
      ws.playerIndex
    );

    if (room) {
      const gameId = Math.random().toString(36).substr(2, 9);
      const player1Id = Math.random().toString(36).substr(2, 9);
      const player2Id = Math.random().toString(36).substr(2, 9);

      console.log("Starting game:", {
        gameId,
        player1: room.roomUsers[0],
        player2: room.roomUsers[1],
      });

      room.roomUsers.forEach((user, index) => {
        const playerId = index === 0 ? player1Id : player2Id;

        wss.clients.forEach((client: CustomWebSocket) => {
          if (client.playerIndex === user.index) {
            sendMessage(client, MessageType.CREATE_GAME, {
              idGame: gameId,
              idPlayer: playerId,
            });
          }
        });
      });

      const rooms = roomService.getRooms().map((room) => ({
        roomId: room.id,
        roomUsers: room.roomUsers,
      }));
      broadcast(MessageType.UPDATE_ROOM, rooms);
    }
  }

  function handleRegistration(
    ws: CustomWebSocket,
    data: RegistrationData
  ): void {
    console.log("Processing registration:", data);

    if (!data.name || !data.password) {
      sendMessage(ws, MessageType.REGISTRATION, {
        name: data.name || "",
        index: "",
        error: true,
        errorText: "Name and password are required",
      });
      return;
    }

    const result = playerService.registerPlayer(data);

    if (result.success && result.player) {
      ws.playerName = result.player.name;
      ws.playerIndex = result.player.index;

      const registrationResponse = {
        name: result.player.name,
        index: result.player.index,
        error: false,
        errorText: "",
      };

      console.log("Sending registration response:", registrationResponse);
      sendMessage(ws, MessageType.REGISTRATION, registrationResponse);

      const winners = playerService.getWinners();
      console.log("Sending winners list:", winners);
      broadcast(MessageType.UPDATE_WINNERS, winners);

      const rooms = roomService.getRooms().map((room) => ({
        roomId: room.id,
        roomUsers: room.roomUsers,
      }));
      broadcast(MessageType.UPDATE_ROOM, rooms);
    } else {
      const errorResponse = {
        name: data.name,
        index: "",
        error: true,
        errorText: result.error || "Registration failed",
      };

      console.log("Sending error response:", errorResponse);
      sendMessage(ws, MessageType.REGISTRATION, errorResponse);
    }
  }

  function handleMessage(ws: CustomWebSocket, message: Message): void {
    console.log("Processing message:", message);

    switch (message.type) {
      case MessageType.REGISTRATION:
        handleRegistration(ws, message.data as RegistrationData);
        break;

      case MessageType.CREATE_ROOM:
        handleCreateRoom(ws);
        break;

      case MessageType.ADD_USER_TO_ROOM:
        handleJoinRoom(ws, message.data);
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  }

  return wss;
};
