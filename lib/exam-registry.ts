import type { ExamPack } from "@/lib/exam-pack";
import { getActiveExam, type ExamSlug } from "@/lib/exam-state";
import { aigpPack } from "@/content/exams/aigp/pack";
import { cippePack } from "@/content/exams/cippe/pack";
import { cipmPack } from "@/content/exams/cipm/pack";

// Every exam the app can run. Adding an exam = add a pack folder under
// content/exams/<slug>/, assemble its pack.ts, and register it here
// (plus add the slug to EXAM_SLUGS in lib/exam-state.ts).

const PACKS: Record<ExamSlug, ExamPack> = {
  aigp: aigpPack,
  cippe: cippePack,
  cipm: cipmPack,
};

export function getActivePack(): ExamPack {
  return PACKS[getActiveExam()];
}

export function getPack(slug: ExamSlug): ExamPack {
  return PACKS[slug];
}

export function listPacks(): ExamPack[] {
  return Object.values(PACKS);
}
