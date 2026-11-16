/**
 * reflection — compliance step 5. A structured reflection on AI use: where the
 * student relied on AI, what they corrected, and where professional judgement was
 * required that AI could not supply.
 *
 * The guardrail here is pedagogical rather than citational: it blocks rubber-stamp
 * reflections. All three prompts must be answered with a minimum of substance, the
 * student must attest they reviewed AI output, and at least one concrete correction
 * or professional-judgement case must be documented.
 *
 * Self-contained (mirrors the other compliance modules).
 */

export interface ReflectionPayload {
  /** Where AI was used and what it produced. */
  ai_use_description: string;
  /** Where the student overrode or corrected AI output, and why. */
  corrections_made: string;
  /** Where AI was insufficient and professional judgement was required. */
  professional_judgement_cases: string;
  /** Student attests they reviewed all AI outputs. */
  verified_by_student: boolean;
}

export interface GuardrailFailure { rule: string; detail: string; field?: keyof ReflectionPayload }
export interface GuardrailResult { passed: boolean; failures: GuardrailFailure[] }

export const MIN_WORDS = 5;

function wordCount(s: string): number {
  const t = (s || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Validate a reflection.
 * passed === true only when every prompt is answered with >= MIN_WORDS, the student
 * has attested review, and at least one correction or judgement case is concrete.
 */
export function validateReflection(reflection: ReflectionPayload, minWords = MIN_WORDS): GuardrailResult {
  const failures: GuardrailFailure[] = [];

  const fields: (keyof ReflectionPayload)[] = [
    'ai_use_description',
    'corrections_made',
    'professional_judgement_cases',
  ];

  for (const f of fields) {
    const wc = wordCount(reflection[f] as string);
    if (wc === 0) {
      failures.push({ rule: 'empty_field', detail: `"${f}" is empty`, field: f });
    } else if (wc < minWords) {
      failures.push({ rule: 'too_short', detail: `"${f}" has ${wc} words; needs >= ${minWords}`, field: f });
    }
  }

  if (reflection.verified_by_student !== true) {
    failures.push({ rule: 'not_verified', detail: 'student has not attested they reviewed AI output' });
  }

  // Anti rubber-stamp: at least one of corrections / judgement must be substantive.
  const hasSubstance =
    wordCount(reflection.corrections_made) >= minWords ||
    wordCount(reflection.professional_judgement_cases) >= minWords;
  if (!hasSubstance) {
    failures.push({
      rule: 'rubber_stamp',
      detail: 'document at least one concrete correction or professional-judgement case',
    });
  }

  return { passed: failures.length === 0, failures };
}

export default validateReflection;
