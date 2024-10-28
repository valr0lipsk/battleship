import { WebSocketServer, WebSocket, RawData } from "ws";

interface Message {
  type: string;
  data: any;
  id: number;
}

interface CustomWebSocket extends WebSocket {
  id?: string;
  username?: string;
}

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

  process.on("SIGINT", () => {
    wss.clients.forEach((client) => {
      client.close();
    });
    wss.close(() => {
      console.log("WebSocket server shut down");
      process.exit(0);
    });
  });

  return wss;
};
