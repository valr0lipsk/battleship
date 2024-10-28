import { Player, PlayerServiceResponse } from "../../lib/types";

export class PlayerService {
  private static players: Map<string, Player> = new Map();

  constructor() {}

  registerPlayer(data: {
    name: string;
    password: string;
  }): PlayerServiceResponse {
    const { name, password } = data;

    if (!name || !password) {
      return { success: false, error: "Name and password are required" };
    }
    console.log("Registering player:", name);

    const existingPlayer = Array.from(PlayerService.players.values()).find(
      (player) => player.name === name
    );

    if (existingPlayer) {
      if (existingPlayer.password === password) {
        console.log("Player logged in:", existingPlayer);
        return {
          success: true,
          player: existingPlayer,
        };
      } else {
        console.log("Wrong password for player:", name);
        return {
          success: false,
          error: "Invalid password",
        };
      }
    }

    const newPlayer: Player = {
      name,
      password,
      index: Math.random().toString(36).substring(2, 9),
      wins: 0,
    };

    PlayerService.players.set(newPlayer.index, newPlayer);
    console.log("New player registered:", newPlayer);

    return {
      success: true,
      player: newPlayer,
    };
  }

  getPlayerByIndex(index: string): Player | undefined {
    return PlayerService.players.get(index);
  }

  getWinners(): Array<{ name: string; wins: number }> {
    return Array.from(PlayerService.players.values())
      .map((player) => ({
        name: player.name,
        wins: player.wins,
      }))
      .sort((a, b) => b.wins - a.wins);
  }

  incrementWins(playerIndex: string): void {
    console.log(PlayerService.players.values());
    const player = PlayerService.players.get(playerIndex);
    if (player) {
      player.wins += 1;
      console.log("Incremented wins for player:", player);
    }
  }

  getAllPlayers(): Player[] {
    return Array.from(PlayerService.players.values());
  }
}
