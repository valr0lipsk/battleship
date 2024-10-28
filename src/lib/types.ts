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
