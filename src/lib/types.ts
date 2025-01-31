export type PipeType =
  | "straight"
  | "corner"
  | "tee"
  | "cross"
  | "start"
  | "end"
  | "empty";

export type PipeDirection = 0 | 90 | 180 | 270;

export interface PipeState {
  type: PipeType;
  direction: PipeDirection;
  isFixed: boolean;
  isConnected?: boolean;
}

export interface Stage {
  id: number;
  name: string;
  width: number;
  height: number;
  pipes: PipeState[][];
  createdAt: string | Date;
  updatedAt: string | Date;
}
