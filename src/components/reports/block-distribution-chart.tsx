
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type BlockColor } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SLOTS_PER_HOUR = 6;

// A small library of Tetris-like shapes for 1 to 4 blocks
const SHAPES: { [key: number]: number[][][] } = {
  1: [[[1]]], // Single block
  2: [[[1, 1]]], // 2-block line (horizontal)
  3: [
    [[1, 1, 1]], // 3-block line
    [[1, 1], [1, 0]], // L-shape
  ],
  4: [
    [[1, 1], [1, 1]], // O-shape (Square)
    [[1, 1, 1, 1]], // I-shape (Line)
    [[0, 1, 0], [1, 1, 1]], // T-shape
    [[1, 0, 0], [1, 1, 1]], // L-shape
    [[0, 0, 1], [1, 1, 1]], // J-shape
  ],
};

// Function to check if a shape can be placed at a specific position
const canPlaceShape = (grid: any[][], shape: number[][], startRow: number, startCol: number, rows: number, cols: number) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const gridRow = startRow + r;
        const gridCol = startCol + c;
        if (gridRow < 0 || gridRow >= rows || gridCol < 0 || gridCol >= cols || grid[gridRow][gridCol] !== null) {
          return false; // Out of bounds or collision
        }
      }
    }
  }
  return true;
};

// Function to place a shape on the grid
const placeShape = (grid: any[][], shape: number[][], startRow: number, startCol: number, blockInfo: { color: BlockColor; title: string }) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        if(startRow + r >= 0) {
            grid[startRow + r][startCol + c] = blockInfo;
        }
      }
    }
  }
};


interface BlockDistributionChartProps {
  data: {
    title: string;
    duration: number; // in 10-minute slots
    color: BlockColor;
  }[];
  rows: number;
  cols: number;
}

export function BlockDistributionChart({ data, rows, cols }: BlockDistributionChartProps) {
  const grid = React.useMemo(() => {
    const newGrid: ({ color: BlockColor; title: string } | null)[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));

    const activitiesWithBlocks = data
      .map(activity => ({
        ...activity,
        numBlocks: Math.round(activity.duration / SLOTS_PER_HOUR),
      }))
      .filter(activity => activity.numBlocks > 0)
      .sort((a,b) => b.numBlocks - a.numBlocks); // Process larger activities first

    activitiesWithBlocks.forEach(activity => {
      let remainingBlocks = activity.numBlocks;
      
      while (remainingBlocks > 0) {
        const shapeSize = Math.min(remainingBlocks, 4);
        const possibleShapes = SHAPES[shapeSize];
        if (!possibleShapes) {
          remainingBlocks -= shapeSize;
          continue;
        }
        const shape = possibleShapes[Math.floor(Math.random() * possibleShapes.length)];

        // Find the "best fit" by checking every possible position and choosing the one that's lowest.
        // If there are multiple "lowest" spots, we choose one randomly to avoid left-bias.
        let bestPositions: { r: number; c: number }[] = [];
        let lowestY = -1;

        // Iterate through all possible columns
        for (let c = 0; c <= cols - (shape[0]?.length || 1); c++) {
            // For each column, find the lowest possible row the shape can be in (its "landing spot")
            for (let r = rows - 1; r >= 0; r--) {
                if (canPlaceShape(newGrid, shape, r, c, rows, cols)) {
                    // This is a valid landing spot.
                    
                    // If it's lower than what we've seen, it's the new best. Reset our list.
                    if (r > lowestY) {
                        lowestY = r;
                        bestPositions = [{ r, c }];
                    } 
                    // If it's at the same level as the current best, add it to the list of choices.
                    else if (r === lowestY) {
                        bestPositions.push({ r, c });
                    }
                    
                    // Once we find the landing spot for a column, stop checking lower rows for it.
                    break;
                }
            }
        }

        // After checking all columns, pick one of the best positions at random and place the shape.
        if (bestPositions.length > 0) {
            const finalPosition = bestPositions[Math.floor(Math.random() * bestPositions.length)];
            placeShape(newGrid, shape, finalPosition.r, finalPosition.c, { color: activity.color, title: activity.title });
        }
        
        remainingBlocks -= shapeSize;
      }
    });

    return newGrid;
  }, [data, rows, cols]);

  if (!data || data.length === 0) {
    return (
        <div 
            className="w-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed"
            style={{ aspectRatio: `${cols}/${rows}` }}
        >
            <p className="text-muted-foreground text-center p-4">Jadwalkan beberapa blok waktu untuk melihat distribusi waktu Anda di sini.</p>
        </div>
    );
  }

  return (
    <TooltipProvider>
        <div
          className="grid gap-1 p-2 bg-muted/30 rounded-lg border"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            aspectRatio: `${cols}/${rows}`,
          }}
        >
          {grid.flat().map((cell, index) => {
             const isCustomColor = cell?.color.startsWith('#');
             const style = isCustomColor ? { backgroundColor: cell?.color } : {};
             const className = !isCustomColor && cell ? (BLOCK_COLORS[cell.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate).solid : 'bg-background/10';

             return (
                 <Tooltip key={index} delayDuration={50}>
                    <TooltipTrigger asChild>
                        <div
                          style={style}
                          className={cn(
                            'w-full h-full rounded-sm transition-opacity hover:opacity-80',
                            !cell && 'bg-background/10',
                            !isCustomColor && cell && className
                          )}
                        />
                    </TooltipTrigger>
                    {cell && (
                        <TooltipContent>
                            <p>{cell.title}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
             )
          })}
        </div>
    </TooltipProvider>
  );
}
