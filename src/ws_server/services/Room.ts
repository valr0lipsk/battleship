import { Room } from "../../lib/types";

export class RoomService {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

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

    this.rooms.set(roomId, room);
    return room;
  }

  addUserToRoom(
    roomId: string,
    playerName: string,
    playerIndex: string
  ): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.roomUsers.length >= 2) return null;

    room.roomUsers.push({
      name: playerName,
      index: playerIndex,
    });

    if (room.roomUsers.length === 2) {
      this.rooms.delete(roomId);
    }

    return room;
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.roomUsers.length === 1
    );
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }
}
