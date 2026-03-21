import { query } from "./db.js";

interface GuessGame {
  answer: number;
  attempts: number;
  maxAttempts: number;
  bet: number;
  userId: string;
  startedAt: number;
}

export const guessGames = new Map<string, GuessGame>();

export function startGame(userId: string, bet: number): number {
  const answer = Math.floor(Math.random() * 100) + 1;
  guessGames.set(userId, { answer, attempts: 0, maxAttempts: 7, bet, userId, startedAt: Date.now() });
  setTimeout(() => guessGames.delete(userId), 600000); // 10 min timeout
  return answer;
}

interface GuessResult {
  correct: boolean;
  gameOver: boolean;
  tooHigh: boolean;
  answer: number;
  attempts: number;
  attemptsLeft: number;
  maxAttempts: number;
  wonCoins?: number;
  lostCoins?: number;
}

export async function processGuess(userId: string, num: number): Promise<GuessResult | null> {
  const game = guessGames.get(userId);
  if (!game) return null;

  game.attempts++;
  const correct   = num === game.answer;
  const tooHigh   = num > game.answer;
  const gameOver  = !correct && game.attempts >= game.maxAttempts;
  const attLeft   = game.maxAttempts - game.attempts;

  if (correct) {
    guessGames.delete(userId);
    if (game.bet > 0) {
      await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [game.bet, userId]);
    }
    return { correct: true, gameOver: false, tooHigh: false, answer: game.answer, attempts: game.attempts, attemptsLeft: 0, maxAttempts: game.maxAttempts, wonCoins: game.bet };
  }

  if (gameOver) {
    guessGames.delete(userId);
    if (game.bet > 0) {
      await query("UPDATE users SET balance = balance - $1 WHERE user_id = $2", [game.bet, userId]);
    }
    return { correct: false, gameOver: true, tooHigh, answer: game.answer, attempts: game.attempts, attemptsLeft: 0, maxAttempts: game.maxAttempts, lostCoins: game.bet };
  }

  return { correct: false, gameOver: false, tooHigh, answer: game.answer, attempts: game.attempts, attemptsLeft: attLeft, maxAttempts: game.maxAttempts };
}
