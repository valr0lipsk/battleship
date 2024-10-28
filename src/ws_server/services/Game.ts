import { Game, GamePlayer, Ship, ShotStatus } from "../../lib/types";

export class GameService {
  private static games: Map<string, Game> = new Map();
  private readonly BOARD_SIZE = 10;

  createGame(id: string, players: GamePlayer[]): Game {
    const game: Game = {
      id,
      players,
      currentTurn: players[0].gameId,
      board1: Array(this.BOARD_SIZE)
        .fill(null)
        .map(() => Array(this.BOARD_SIZE).fill(0)),
      board2: Array(this.BOARD_SIZE)
        .fill(null)
        .map(() => Array(this.BOARD_SIZE).fill(0)),
    };

    GameService.games.set(id, game);
    return game;
  }

  addShips(gameId: string, playerId: string, ships: Ship[]): boolean {
    const game = GameService.games.get(gameId);
    console.log("GAME", game);
    if (!game) return false;

    const playerIndex = game.players.findIndex((p) => p.gameId === playerId);
    console.log(playerIndex, game.players, playerId);
    if (playerIndex === -1) return false;

    game.players[playerIndex].ships = ships;

    const board = playerIndex === 0 ? game.board1 : game.board2;
    ships.forEach((ship) => {
      for (let i = 0; i < ship.length; i++) {
        const x = ship.direction ? ship.position.x : ship.position.x + i;
        const y = ship.direction ? ship.position.y + i : ship.position.y;
        board[y][x] = 2;
      }
    });

    return true;
  }

  processAttack(
    gameId: string,
    attackingPlayerId: string,
    x: number,
    y: number
  ): {
    status: ShotStatus;
    position: { x: number; y: number };
    currentPlayer: string;
  } | null {
    const game = GameService.games.get(gameId);
    if (!game) return null;

    if (game.currentTurn !== attackingPlayerId) return null;

    const defendingPlayerIndex = game.players.findIndex(
      (p) => p.gameId !== attackingPlayerId
    );
    const board = defendingPlayerIndex === 0 ? game.board1 : game.board2;

    let status: ShotStatus;
    if (board[y][x] === 2) {
      board[y][x] = 3;

      if (this.isShipKilled(x, y, board)) {
        status = ShotStatus.KILLED;
        this.markAroundKilledShip(x, y, board);
      } else {
        status = ShotStatus.SHOT;
      }
    } else {
      board[y][x] = 1;
      status = ShotStatus.MISS;

      game.currentTurn = game.players[defendingPlayerIndex].gameId;
    }

    return {
      status,
      position: { x, y },
      currentPlayer: attackingPlayerId,
    };
  }

  getRandomAttackPosition(
    gameId: string,
    playerId: string
  ): { x: number; y: number } | null {
    const game = GameService.games.get(gameId);
    if (!game) return null;

    const defendingPlayerIndex = game.players.findIndex(
      (p) => p.gameId !== playerId
    );
    const board = defendingPlayerIndex === 0 ? game.board1 : game.board2;

    const availableCells: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < this.BOARD_SIZE; y++) {
      for (let x = 0; x < this.BOARD_SIZE; x++) {
        if (board[y][x] === 0) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }

  isGameFinished(gameId: string): string | null {
    const game = GameService.games.get(gameId);
    if (!game) return null;

    const allShipsKilled1 = this.areAllShipsKilled(game.board1);
    if (allShipsKilled1) return game.players[1].gameId;

    const allShipsKilled2 = this.areAllShipsKilled(game.board2);
    if (allShipsKilled2) return game.players[0].gameId;

    return null;
  }

  private isShipKilled(x: number, y: number, board: number[][]): boolean {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      while (
        newX >= 0 &&
        newX < this.BOARD_SIZE &&
        newY >= 0 &&
        newY < this.BOARD_SIZE
      ) {
        if (board[newY][newX] === 2) return false;
        if (board[newY][newX] !== 3) break;
        newX += dx;
        newY += dy;
      }
    }
    return true;
  }

  private findAllShipCells(
    x: number,
    y: number,
    board: number[][]
  ): { x: number; y: number }[] {
    const shipCells: { x: number; y: number }[] = [{ x, y }];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy;
      while (
        newX >= 0 &&
        newX < this.BOARD_SIZE &&
        newY >= 0 &&
        newY < this.BOARD_SIZE
      ) {
        if (board[newY][newX] === 3) {
          shipCells.push({ x: newX, y: newY });
          newX += dx;
          newY += dy;
        } else {
          break;
        }
      }
    }

    return shipCells;
  }

  private markAroundKilledShip(x: number, y: number, board: number[][]): void {
    const shipCells = this.findAllShipCells(x, y, board);

    shipCells.forEach((cell) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const newX = cell.x + dx;
          const newY = cell.y + dy;
          if (
            newX >= 0 &&
            newX < this.BOARD_SIZE &&
            newY >= 0 &&
            newY < this.BOARD_SIZE &&
            board[newY][newX] === 0
          ) {
            board[newY][newX] = 1;
          }
        }
      }
    });
  }
  private areAllShipsKilled(board: number[][]): boolean {
    for (let y = 0; y < this.BOARD_SIZE; y++) {
      for (let x = 0; x < this.BOARD_SIZE; x++) {
        if (board[y][x] === 2) return false;
      }
    }
    return true;
  }

  getGame(gameId: string): Game | undefined {
    return GameService.games.get(gameId);
  }

  getCurrentPlayer(gameId: string): string | null {
    const game = GameService.games.get(gameId);
    return game ? game.currentTurn : null;
  }
}
