// The exam's light: a fixed, slowly drifting color field behind the glass.
// Pure CSS (see .exam-light in globals.css) — hues come from the active exam's
// tokens, motion is transform-only and stops under prefers-reduced-motion.
export function ExamLight() {
  return (
    <div aria-hidden className="exam-light">
      <span className="exam-light__a" />
      <span className="exam-light__b" />
      <span className="exam-light__c" />
      <span className="exam-light__grain" />
    </div>
  );
}
