import { Room } from "../../lib/types";

export class RoomService {
  private static rooms: Map<string, Room> = new Map();

  constructor() {}

  createRoom(playerName: string, playerIndex: string): Room {
    const roomId = Math.random().toString(36).substr(2, 9);
    const room: Room = {
      id: roomId,
      roomUsers: [
        {
          name: playerName,
          index: playerIndex,
        },
      ],
    };

    RoomService.rooms.set(roomId, room);
    console.log("Created room:", room);
    return room;
  }

  addUserToRoom(
    roomId: string,
    playerName: string,
    playerIndex: string
  ): Room | null {
    const room = RoomService.rooms.get(roomId);
    if (!room) {
      console.log("Room not found:", roomId);
      return null;
    }

    const isPlayerInRoom = room.roomUsers.some(
      (user) => user.index === playerIndex
    );
    if (isPlayerInRoom) {
      console.log("Player already in room:", playerName);
      return null;
    }

    if (room.roomUsers.length >= 2) {
      console.log("Room is full:", room);
      return null;
    }

    room.roomUsers.push({
      name: playerName,
      index: playerIndex,
    });

    console.log("Added user to room:", room);

    if (room.roomUsers.length === 2) {
      console.log("Room is now full, deleting:", room);
      RoomService.rooms.delete(roomId);
    }

    return room;
  }

  getRooms(): Room[] {
    const rooms = Array.from(RoomService.rooms.values()).filter(
      (room) => room.roomUsers.length === 1
    );
    console.log("Getting available rooms:", rooms);
    return rooms;
  }

  deleteRoom(roomId: string): void {
    RoomService.rooms.delete(roomId);
    console.log("Deleted room:", roomId);
  }

  getRoom(roomId: string): Room | undefined {
    return RoomService.rooms.get(roomId);
  }

  isPlayerInAnyRoom(playerIndex: string): boolean {
    return Array.from(RoomService.rooms.values()).some((room) =>
      room.roomUsers.some((user) => user.index === playerIndex)
    );
  }
}
