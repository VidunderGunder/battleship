import { css } from "@emotion/react";
import { Button, Center, Group, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ShipVariant = {
  name: ShipName;
  size: number;
};
const shipVariants: ShipVariant[] = [
  {
    name: "carrier",
    size: 5,
  },
  {
    name: "battleship",
    size: 4,
  },
  {
    name: "cruiser",
    size: 3,
  },
  {
    name: "submarine",
    size: 3,
  },
  {
    name: "destroyer",
    size: 2,
  },
];
const validShipNames = [
  "carrier",
  "battleship",
  "cruiser",
  "submarine",
  "destroyer",
];
const validCellStates = ["empty", "miss", "hit", "sunk", "ship"];

type ShipName = typeof validShipNames[number];
type Ship = ShipVariant & {
  x: number;
  y: number;
  direction: "horizontal" | "vertical";
};
type Cell = {
  state: typeof validCellStates[number];
  ship?: Ship;
};
type Board = Cell[][];

function pointIsOutOfBounds(x: number, y: number, board: Board): boolean {
  return x < 0 || x >= board.length || y < 0 || y >= board[0].length;
}

function fireCell(cell: Cell): Cell {
  if (cell.state === "empty") return { ...cell, state: "miss" };
  if (cell.state === "ship") return { ...cell, state: "hit" };
  throw new Error("Invalid cell");
}

function fire(
  board: Board,
  x: number,
  y: number
): { board: Board; sunk: boolean } {
  if (pointIsOutOfBounds(x, y, board)) throw new Error("Invalid coordinates");

  const newBoard = [...board];
  let result = fireCell(newBoard[x][y]);
  newBoard[x][y] = result;

  // If the cell is a hit, check if the ship is sunk
  if (result.state === "hit") {
    if (result.ship !== undefined) {
      const { x, y, direction, size } = result.ship;
      const shipCells = Array(size).fill(null);
      for (let i = 0; i < size; i++) {
        if (direction === "horizontal") {
          shipCells[i] = newBoard[x + i][y];
        } else {
          shipCells[i] = newBoard[x][y + i];
        }
      }

      const shipIsSunk = shipCells.every((cell) => cell.state === "hit");
      if (shipIsSunk) {
        shipCells.forEach((cell) => (cell.state = "sunk"));
        result = { ...result, state: "sunk" };

        // Set all cells in the ship to sunk
        if (direction === "horizontal") {
          for (let i = 0; i < size; i++) {
            newBoard[x + i][y] = { ...newBoard[x + i][y], state: "sunk" };
          }
        } else {
          for (let i = 0; i < size; i++) {
            newBoard[x][y + i] = { ...newBoard[x][y + i], state: "sunk" };
          }
        }
        return { board: newBoard, sunk: true };
      }
    }
  }

  return { board: newBoard, sunk: false };
}

function initializeBoard(rows: number, cols: number): Board {
  const board: Board = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill({ state: "empty" }));

  return placeShipsRandomly(board);
}

function placeShipsRandomly(board: Board): Board {
  const newBoard = [...board];

  shipVariants.forEach((ship) => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 1000;
    const coordinates: ([number, number] | null)[] = Array(ship.size).fill(
      null
    );
    let direction: "horizontal" | "vertical";
    let x: number;
    let y: number;

    while (!placed && attempts < maxAttempts) {
      direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      x = Math.floor(
        direction === "horizontal"
          ? Math.random() * (board.length - ship.size + 1)
          : Math.random() * board.length
      );
      y = Math.floor(
        direction === "vertical"
          ? Math.random() * (board[0].length - ship.size + 1)
          : Math.random() * board[0].length
      );

      if (direction === "horizontal") {
        for (let i = 0; i < ship.size; i++) {
          if (newBoard[x + i][y].state !== "empty") {
            placed = false;
            coordinates.fill(null);
            break;
          }
          coordinates[i] = [x + i, y];
          placed = true;
        }
      } else {
        for (let i = 0; i < ship.size; i++) {
          if (newBoard[x][y + i].state !== "empty") {
            placed = false;
            coordinates.fill(null);
            break;
          }
          coordinates[i] = [x, y + i];
          placed = true;
        }
      }

      attempts++;
    }

    if (!placed) throw new Error("Could not place ship");

    coordinates.forEach((r) => {
      if (r === null) throw new Error("Invalid coordinates");
      const [_x, _y] = r;

      newBoard[_x][_y] = { ship: { ...ship, x, y, direction }, state: "ship" };
    });
  });

  return newBoard;
}

function getFontSizeCSS(rows: number) {
  return css`
    font-size: min(${(100 / 10) * 0.69}vw, 3rem);
  `;
}
function getCellSizeCSS(rows: number) {
  return css`
    width: ${(100 / 10) * 0.96}vw;
    max-width: 4rem;
    height: ${(100 / 10) * 0.96}vw;
    max-height: 4rem;
  `;
}

function getInitializedBoards(rows: number, cols: number) {
  return [initializeBoard(rows, cols), initializeBoard(rows, cols)];
}

export default function Battleship({
  rows = 10,
  cols = 10,
  flipTime = 690,
  debug = false,
}) {
  const [boards, setBoards] = useState<Board[]>();
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [player, setPlayer] = useState<0 | 1>(0);
  const [flip, setFlip] = useState<boolean>(false);

  const fontSizeCSS = getFontSizeCSS(rows);
  const cellSizeCSS = getCellSizeCSS(rows);

  function onFire(x: number, y: number) {
    if (boards === undefined) return;
    const newBoards = [...boards];
    const { board: newBoard, sunk } = fire(board, x, y);
    newBoards[player] = newBoard;
    setBoards(newBoards);

    if (sunk) {
      setScores((scores) => {
        const newScores = [...scores];
        newScores[player]++;
        return newScores;
      });
    }

    setTimeout(() => {
      setFlip(true);
    }, flipTime * 0.5);
    setTimeout(() => {
      setPlayer(player === 0 ? 1 : 0);
      setFlip(false);
    }, flipTime * 1);
  }

  function restart() {
    setBoards(getInitializedBoards(rows, cols));
    setScores([0, 0]);
    setPlayer(0);
    setFlip(false);
  }

  useEffect(() => {
    setBoards(getInitializedBoards(rows, cols));
  }, [rows, cols]);

  if (boards === undefined) return;
  const board = boards[player];

  return (
    <>
      <Center
        css={css`
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        `}
      >
        <Center
          css={css`
            display: flex;
            flex-direction: column;
          `}
        >
          <Title order={1}>BATTLESHIP</Title>
          <motion.span animate={flip ? { scale: 1.05 } : { scale: 1 }}>
            <Title order={2}>
              Player {player + 1}
              &apos;s turn
            </Title>
          </motion.span>
          <Text>
            {scores[player]} of {shipVariants.length}
          </Text>
        </Center>
        <motion.div
          animate={{ opacity: flip ? 0.25 : 1, scale: flip ? 0.925 : 1 }}
          transition={{ duration: flipTime / 1000 / 2 / 1.25 }}
        >
          <Group spacing={0} direction="column">
            {board?.map((row, x) => (
              <Group spacing={0} key={x}>
                {row.map((cell, y) => {
                  return (
                    <Center
                      key={y}
                      css={css`
                        padding: 0;
                        margin: 0;
                        ${cellSizeCSS};
                      `}
                    >
                      {["hit", "miss", "sunk"].includes(cell.state) ? (
                        <Text
                          color={cell.state === "hit" ? "green" : "red"}
                          css={css`
                            ${fontSizeCSS};
                          `}
                        >
                          {cell.state === "hit"
                            ? "😮"
                            : cell.state === "sunk"
                            ? "😵"
                            : ""}
                        </Text>
                      ) : (
                        <Button
                          disabled={["hit", "miss"].includes(cell.state)}
                          variant={"subtle"}
                          color={"gray"}
                          css={css`
                            padding: 0;
                            margin: 0;
                            border-radius: 100px;
                            ${cellSizeCSS};
                          `}
                          onClick={() => {
                            if (flip) return;
                            onFire(x, y);
                          }}
                        >
                          <span
                            css={css`
                              opacity: 0.5;
                              ${fontSizeCSS};
                            `}
                          >
                            {debug ? cell.state : "❔"}
                          </span>
                        </Button>
                      )}
                    </Center>
                  );
                })}
              </Group>
            ))}
          </Group>
        </motion.div>
        <Button color="red" onClick={restart}>
          Restart
        </Button>
      </Center>
    </>
  );
}
