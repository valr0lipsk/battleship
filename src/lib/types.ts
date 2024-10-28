import { WebSocket } from "ws";

export enum MessageType {
  REGISTRATION = "reg",
  CREATE_ROOM = "create_room",
  ADD_USER_TO_ROOM = "add_user_to_room",
  ADD_SHIPS = "add_ships",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  TURN = "turn",
  FINISH = "finish",
}

export interface RegistrationData {
  name: string;
  password: string;
}

export interface RegistrationResponse {
  name: string;
  index: string | number;
  error: boolean;
  errorText: string;
}

export interface Message {
  type: MessageType;
  data: any;
  id: number;
}

export interface CustomWebSocket extends WebSocket {
  id?: string;
  playerName?: string;
  playerIndex?: string;
}

export interface Player {
  name: string;
  password: string;
  index: string;
  wins: number;
}

export interface RoomUser {
  name: string;
  index: string;
}

export interface Room {
  id: string;
  roomUsers: RoomUser[];
}

export interface PlayerServiceResponse {
  success: boolean;
  player?: Player;
  error?: string;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean; // true - вертикальный, false - горизонтальный
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export interface GamePlayer {
  index: string; // индекс игрока
  gameId: string; // id игрока в конкретной игре
  ships: Ship[] | null;
}

export interface Game {
  id: string;
  players: GamePlayer[];
  currentTurn: string; // gameId текущего игрока
  board1: number[][]; // доска первого игрока
  board2: number[][]; // доска второго игрока
}

export enum ShotStatus {
  MISS = "miss",
  SHOT = "shot",
  KILLED = "killed",
}
