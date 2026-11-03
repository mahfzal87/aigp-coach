// Law Lab data shapes, shared by every exam pack.

export type LawRegion = "EU" | "US" | "Global" | "APAC" | "Org";
export type LawKind = "Law" | "Framework" | "Standard" | "Principles" | "Treaty" | "Policy";

export interface LawBranch {
  id: string;
  t: string; // branch label
  leaves: string[]; // one fact per leaf — lockable
}

export interface LawMapDef {
  id: string;
  name: string;
  short: string; // compact name used in the drill options
  kind: LawKind;
  region: LawRegion;
  tagline: string;
  weight: 1 | 2 | 3; // exam yield
  branches: LawBranch[];
  keywords: { term: string; cue: string }[]; // trigger word -> what it signals
  distinctions: { vs: string; point: string }[];
  traps: string[];
}

export interface Confusable {
  id: string;
  a: string;
  b: string;
  rows: { dim: string; a: string; b: string }[];
  tell: string; // the one-line exam tell
}

export function mapLeafKey(mapId: string, branchId: string, i: number) {
  return `${mapId}.${branchId}.${i}`;
}

export function totalLeaves(def: LawMapDef) {
  return def.branches.reduce((n, b) => n + b.leaves.length, 0);
}
