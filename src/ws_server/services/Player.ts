import { Player, RegistrationData } from "../../lib/types";

export class PlayerService {
  private players: Map<string, Player>;

  constructor() {
    this.players = new Map();
  }

  registerPlayer(data: RegistrationData): {
    success: boolean;
    player?: Player;
    error?: string;
  } {
    const { name, password } = data;

    if (!name || !password) {
      return { success: false, error: "Name and password are required" };
    }

    // Проверяем существующего игрока
    for (const [_, player] of this.players) {
      if (player.name === name) {
        // Если игрок существует, проверяем пароль
        if (player.password === password) {
          return { success: true, player };
        } else {
          return { success: false, error: "Invalid password" };
        }
      }
    }

    // Создаем нового игрока
    const newPlayer: Player = {
      name,
      password,
      index: this.generatePlayerIndex(),
      wins: 0,
    };

    this.players.set(newPlayer.index, newPlayer);
    return { success: true, player: newPlayer };
  }

  getPlayerByIndex(index: string): Player | undefined {
    return this.players.get(index);
  }

  getWinners(): Array<{ name: string; wins: number }> {
    return Array.from(this.players.values())
      .map((player) => ({
        name: player.name,
        wins: player.wins,
      }))
      .sort((a, b) => b.wins - a.wins);
  }

  incrementWins(playerIndex: string): void {
    const player = this.players.get(playerIndex);
    if (player) {
      player.wins += 1;
    }
  }

  private generatePlayerIndex(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
