import { describe, it, expect } from 'vitest'
import {
  MEASUREMENT_TYPE_LABELS,
  getMeasurementTypeLabel,
  getPeriodLabel,
  getDifficultyLabel,
} from '@/lib/display-labels'

// ---- Measurement type labels ----

describe('Measurement type labels', () => {
  it('should return English label for boolean', () => {
    expect(getMeasurementTypeLabel('boolean')).toBe('Done / Not done')
  })

  it('should return English label for count', () => {
    expect(getMeasurementTypeLabel('count')).toBe('Count')
  })

  it('should return English label for minutes', () => {
    expect(getMeasurementTypeLabel('minutes')).toBe('minutes')
  })

  it('should return English label for hours', () => {
    expect(getMeasurementTypeLabel('hours')).toBe('hours')
  })

  it('should return English label for duration (legacy)', () => {
    expect(getMeasurementTypeLabel('duration')).toBe('minutes')
  })

  it('should return English label for numeric', () => {
    expect(getMeasurementTypeLabel('numeric')).toBe('Custom value')
  })

  it('should return unknown type as-is', () => {
    expect(getMeasurementTypeLabel('unknown')).toBe('unknown')
  })
})

// ---- Period labels ----

describe('Period labels', () => {
  it('should return Morning for morning', () => {
    expect(getPeriodLabel('morning')).toBe('Morning')
  })

  it('should return Afternoon for afternoon', () => {
    expect(getPeriodLabel('afternoon')).toBe('Afternoon')
  })

  it('should return Evening for evening', () => {
    expect(getPeriodLabel('evening')).toBe('Evening')
  })

  it('should return period as-is for unknown value', () => {
    expect(getPeriodLabel('unknown')).toBe('unknown')
  })

  it('should return empty string as-is', () => {
    expect(getPeriodLabel('')).toBe('')
  })
})

// ---- Difficulty labels ----

describe('Difficulty labels', () => {
  it('should return Easy for easy', () => {
    expect(getDifficultyLabel('easy')).toBe('Easy')
  })

  it('should return Medium for medium', () => {
    expect(getDifficultyLabel('medium')).toBe('Medium')
  })

  it('should return Hard for hard', () => {
    expect(getDifficultyLabel('hard')).toBe('Hard')
  })

  it('should return Very hard for very_hard', () => {
    expect(getDifficultyLabel('very_hard')).toBe('Very hard')
  })

  it('should return difficulty as-is for unknown value', () => {
    expect(getDifficultyLabel('unknown')).toBe('unknown')
  })
})

// ---- Measurement type label completeness ----

describe('MEASUREMENT_TYPE_LABELS completeness', () => {
  it('should have all required types', () => {
    const keys = Object.keys(MEASUREMENT_TYPE_LABELS)
    expect(keys).toContain('boolean')
    expect(keys).toContain('count')
    expect(keys).toContain('duration')
    expect(keys).toContain('minutes')
    expect(keys).toContain('hours')
    expect(keys).toContain('numeric')
  })

  it('should have no duplicate labels among minutes/duration', () => {
    // duration and minutes both map to minutes — this is intentional for backward compat
    expect(MEASUREMENT_TYPE_LABELS['duration']).toBe(MEASUREMENT_TYPE_LABELS['minutes'])
  })

  it('should have distinct labels for distinct types', () => {
    const uniqueLabels = new Set(Object.values(MEASUREMENT_TYPE_LABELS))
    // boolean, count, duration/minutes (shared), hours, numeric → 5 unique labels
    expect(uniqueLabels.size).toBe(5)
  })
})
