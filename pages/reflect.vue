<template>
  <div class="lb-page page-reflect">
    <div class="page-header">
      <div class="eyebrow">compliance · step 5</div>
      <h1 class="serif page-title">Reflection on AI Use</h1>
      <p class="page-sub mono">Account for how you used AI. A reflection cannot be submitted until each prompt is answered with substance.</p>
    </div>

    <div class="rf-field" :class="{ 'rf-field--bad': short(form.ai_use_description) }">
      <label class="rf-label">Where did you use AI, and what did it produce?</label>
      <textarea v-model="form.ai_use_description" rows="3" class="rf-input"></textarea>
      <span class="rf-count mono">{{ words(form.ai_use_description) }} words</span>
    </div>

    <div class="rf-field" :class="{ 'rf-field--bad': short(form.corrections_made) }">
      <label class="rf-label">Where did you override or correct AI output, and why?</label>
      <textarea v-model="form.corrections_made" rows="3" class="rf-input"></textarea>
      <span class="rf-count mono">{{ words(form.corrections_made) }} words</span>
    </div>

    <div class="rf-field" :class="{ 'rf-field--bad': short(form.professional_judgement_cases) }">
      <label class="rf-label">Where was professional judgement required that AI could not provide?</label>
      <textarea v-model="form.professional_judgement_cases" rows="3" class="rf-input"></textarea>
      <span class="rf-count mono">{{ words(form.professional_judgement_cases) }} words</span>
    </div>

    <label class="rf-attest">
      <input type="checkbox" v-model="form.verified_by_student" />
      I have reviewed every AI-generated output in this exercise.
    </label>

    <div class="rf-actions">
      <span class="rf-gate mono" :class="{ 'rf-gate--ok': passed }">{{ passed ? '✓ ready to submit' : firstFailure }}</span>
      <button class="rf-submit" :class="{ 'rf-submit--off': !passed }" :disabled="!passed" @click="submit">Submit reflection</button>
    </div>
    <p v-if="submitted" class="rf-done mono">Reflection submitted. The exercise is complete.</p>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { useArtifact } from '@legalblocks/module-runtime'

const reflectionOut = useArtifact('reflection')

const MIN_WORDS = 5
const words = (s) => { const t = (s || '').trim(); return t ? t.split(/\s+/).length : 0 }
const short = (s) => words(s) < MIN_WORDS

const form = reactive({
  ai_use_description: '',
  corrections_made: '',
  professional_judgement_cases: '',
  verified_by_student: false,
})
const submitted = ref(false)

// Mirrors validateReflection() in reflection.ts
const failures = computed(() => {
  const f = []
  for (const k of ['ai_use_description', 'corrections_made', 'professional_judgement_cases']) {
    if (words(form[k]) === 0) f.push(`"${k}" is empty`)
    else if (short(form[k])) f.push(`"${k}" needs >= ${MIN_WORDS} words`)
  }
  if (form.verified_by_student !== true) f.push('attest that you reviewed AI output')
  const hasSubstance = !short(form.corrections_made) || !short(form.professional_judgement_cases)
  if (!hasSubstance) f.push('document at least one concrete correction or judgement case')
  return f
})
const passed = computed(() => failures.value.length === 0)
const firstFailure = computed(() => failures.value[0] || '')

function persist() {
  reflectionOut.write({
    artifact_type: 'reflection',
    schema_version: '0.1.0',
    payload: { ...form },
    lineage: { produced_by_package: 'reflection', produced_by_module: 'reflection' },
  }).catch(() => {})
}
watch(form, persist, { deep: true })

function submit() { if (passed.value) { persist(); submitted.value = true } }
</script>

<style scoped>
.page-reflect { max-width: 760px; margin: 0 auto; padding: 36px 24px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 400; margin: 6px 0 0; color: var(--ink); }
.page-sub { font-size: 11px; color: var(--muted); margin: 8px 0 0; }

.rf-field { background: var(--white); border: 1px solid var(--line); border-left: 3px solid #4F6E9E; border-radius: 8px; padding: 14px; margin-bottom: 12px; position: relative; }
.rf-field--bad { border-left-color: #B6371A; }
.rf-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.rf-input { width: 100%; font-size: 13px; padding: 8px 10px; border: 1px solid var(--line-2); border-radius: 6px; font-family: inherit; resize: vertical; }
.rf-count { position: absolute; top: 14px; right: 16px; font-size: 10px; color: var(--muted); }

.rf-attest { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-2); margin: 8px 0 20px; }

.rf-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rf-gate { font-size: 11px; color: var(--muted); }
.rf-gate--ok { color: #5F7A3A; }
.rf-submit { font-weight: 600; font-size: 13px; padding: 9px 18px; border: none; border-radius: 8px; background: var(--vermillion); color: #fff; cursor: pointer; }
.rf-submit--off { opacity: 0.4; cursor: not-allowed; }
.rf-done { color: #5F7A3A; font-size: 12px; margin-top: 14px; }
</style>
