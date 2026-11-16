/**
 * Tests for the reflection guardrail.
 * Run: npx tsx modules/reflection/reflection.test.ts
 */
import assert from 'node:assert';
import { validateReflection, type ReflectionPayload } from './reflection.ts';

let passed = 0;
const ok = (name: string, fn: () => void) => { fn(); passed++; console.log('  ✓', name); };

const good: ReflectionPayload = {
  ai_use_description: 'I used the deontic classifier to draft the obligation register entries.',
  corrections_made: 'I corrected the agent on the ESRS obligation from Member State to the undertaking.',
  professional_judgement_cases: 'I judged the treaty provision non-binding on the company without AI input.',
  verified_by_student: true,
};

ok('a complete, substantive, verified reflection passes', () => {
  const r = validateReflection(good);
  assert.equal(r.passed, true);
  assert.equal(r.failures.length, 0);
});

ok('an unverified reflection fails not_verified', () => {
  const r = validateReflection({ ...good, verified_by_student: false });
  assert.equal(r.passed, false);
  assert.ok(r.failures.some(f => f.rule === 'not_verified'));
});

ok('an empty field fails empty_field', () => {
  const r = validateReflection({ ...good, ai_use_description: '' });
  assert.equal(r.passed, false);
  assert.ok(r.failures.some(f => f.rule === 'empty_field' && f.field === 'ai_use_description'));
});

ok('a too-short field fails too_short', () => {
  const r = validateReflection({ ...good, ai_use_description: 'used AI' });
  assert.equal(r.passed, false);
  assert.ok(r.failures.some(f => f.rule === 'too_short'));
});

ok('a rubber-stamp reflection (no concrete correction or judgement) is blocked', () => {
  // both fields present but only filler-length so anti-rubber-stamp triggers
  const r = validateReflection({
    ai_use_description: 'I used AI to draft every section of the memorandum quickly.',
    corrections_made: 'none none',
    professional_judgement_cases: 'none none',
  } as ReflectionPayload & { verified_by_student?: boolean } as ReflectionPayload, 5);
  assert.equal(r.passed, false);
  assert.ok(r.failures.some(f => f.rule === 'rubber_stamp'));
});

console.log(`\nreflection: ${passed} passed`);
