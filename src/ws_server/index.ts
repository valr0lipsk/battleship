import { WebSocketServer, WebSocket, RawData } from "ws";
import { PlayerService } from "./services/Player";
import {
  CustomWebSocket,
  Message,
  MessageType,
  RegistrationData,
} from "../lib/types";

const playerService = new PlayerService();

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

        if (typeof message.data === "string") {
          message.data = JSON.parse(message.data);
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
    const messageData = JSON.stringify(data);
    const message = JSON.stringify({
      type,
      data: messageData,
      id: 0,
    });
    console.log("Sending message:", message);
    ws.send(message);
  }

  function broadcast(type: MessageType, data: any): void {
    const messageData = JSON.stringify(data);
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

      broadcast(MessageType.UPDATE_ROOM, []);
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
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  return wss;
};
