import { useEffect, useMemo, useState } from "react";
import { unlockAchievement } from "./utils/achievements";
import "./styles/ChessEasterEgg.css";

/**
 * ChessEasterEgg
 *
 * Vilas loves chess — so there's a hidden chess board tucked into the site.
 * It can be revealed two ways:
 *   • type the word "chess" anywhere on the page, or
 *   • click the tiny knight glyph the RoamingBot hints about (dispatched via a
 *     custom "open-chess" window event so other components can open it too).
 *
 * The board is rendered from Unicode chess pieces in the classic starting
 * position with a soft teal-accented frame that matches the site theme. A
 * couple of famous opening moves auto-play to bring it to life, and an
 * achievement fires the first time it's discovered.
 */

// Classic starting position, rank 8 (top) → rank 1 (bottom).
const START: string[][] = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

// A short, famous line (the "Immortal Game" opening feel) that auto-plays as
// [fromRow, fromCol, toRow, toCol] once the board is revealed.
const SCRIPTED_MOVES: [number, number, number, number][] = [
  [6, 4, 4, 4], // e2 → e4
  [1, 4, 3, 4], // e7 → e5
  [7, 5, 4, 2], // Bf1 → c4
  [0, 1, 2, 2], // Nb8 → c6
  [7, 6, 5, 5], // Ng1 → f3
];

const clonePosition = () => START.map((row) => [...row]);

const ChessEasterEgg = () => {
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useState<string[][]>(clonePosition);
  const [highlight, setHighlight] = useState<{ r: number; c: number }[]>([]);

  const TRIGGER = useMemo(() => "chess", []);

  // Reveal via typing "chess" or a custom event from elsewhere (e.g. the bot).
  useEffect(() => {
    let buf = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-TRIGGER.length);
      if (buf === TRIGGER) reveal();
    };
    const onOpen = () => reveal();
    const reveal = () => {
      setBoard(clonePosition());
      setHighlight([]);
      setOpen(true);
      unlockAchievement("chess", "You found Vilas's hidden chess board! ♞");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-chess", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-chess", onOpen as EventListener);
    };
  }, [TRIGGER]);

  // Auto-play the scripted opening once the board is shown.
  useEffect(() => {
    if (!open) return;
    let idx = 0;
    let timer: number;
    const play = () => {
      if (idx >= SCRIPTED_MOVES.length) {
        // pause, then reset and loop the demo
        timer = window.setTimeout(() => {
          setBoard(clonePosition());
          setHighlight([]);
          idx = 0;
          timer = window.setTimeout(play, 900);
        }, 2600);
        return;
      }
      const [fr, fc, tr, tc] = SCRIPTED_MOVES[idx];
      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        next[tr][tc] = next[fr][fc];
        next[fr][fc] = "";
        return next;
      });
      setHighlight([
        { r: fr, c: fc },
        { r: tr, c: tc },
      ]);
      idx += 1;
      timer = window.setTimeout(play, 1100);
    };
    timer = window.setTimeout(play, 1000);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  if (!open) return null;

  const isHi = (r: number, c: number) =>
    highlight.some((h) => h.r === r && h.c === c);

  return (
    <div
      className="chess-overlay"
      role="dialog"
      aria-label="Hidden chess board"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="chess-modal">
        <div className="chess-head">
          <div className="chess-title">
            <span className="chess-knight">♞</span>
            <div>
              <h3>Vilas ♥ Chess</h3>
              <p>
                A quiet passion off the keyboard — here's a classic opening,
                playing itself.
              </p>
            </div>
          </div>
          <button
            className="chess-close"
            onClick={() => setOpen(false)}
            aria-label="Close chess board"
            data-cursor="disable"
          >
            ✕
          </button>
        </div>

        <div className="chess-board-frame">
          <div className="chess-board">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const dark = (r + c) % 2 === 1;
                const white = "♙♖♘♗♕♔".includes(piece);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`chess-cell ${dark ? "dark" : "light"} ${
                      isHi(r, c) ? "hi" : ""
                    }`}
                  >
                    {piece && (
                      <span
                        className={`chess-piece ${white ? "white" : "black"}`}
                      >
                        {piece}
                      </span>
                    )}
                    {c === 0 && <span className="chess-rank">{8 - r}</span>}
                    {r === 7 && <span className="chess-file">{FILES[c]}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="chess-hint">Press Esc to close · type “chess” to reopen</p>
      </div>
    </div>
  );
};

export default ChessEasterEgg;
