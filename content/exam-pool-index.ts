import type { Question } from "@/lib/types";
import { examPoolI } from "./exam-pool-i";
import { examPoolII } from "./exam-pool-ii";
import { examPoolIII } from "./exam-pool-iii";
import { examPoolIV } from "./exam-pool-iv";
import { examPoolDDTech } from "./exam-pool-dd-tech";
import { examPoolDDLaw } from "./exam-pool-dd-law";

// Hard exam pool (e-*): original items authored Oct 2026 for the mock exam clusters.
// Merged into the main bank via lib/content.ts; lib/exams.ts front-loads these when
// building the fixed forms so papers stay fresh and mutually disjoint.
export const examPool: Question[] = [
  ...examPoolI,
  ...examPoolII,
  ...examPoolIII,
  ...examPoolIV,
  ...examPoolDDTech,
  ...examPoolDDLaw,
];
