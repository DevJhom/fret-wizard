import { beforeEach, describe, expect, it } from 'vitest'
import { Setup } from '@data/constants'
import { getStackView, setStackView } from '@/lib/stackView'

describe('stack view', () => {
  beforeEach(() => localStorage.clear())

  it('is off until turned on', () => {
    expect(getStackView(Setup.Scale)).toBe(false)
    expect(getStackView(Setup.Chord)).toBe(false)
  })

  it('is remembered per page', () => {
    setStackView(Setup.Scale, true)
    expect(getStackView(Setup.Scale)).toBe(true)
    expect(getStackView(Setup.Chord)).toBe(false)
    setStackView(Setup.Scale, false)
    expect(getStackView(Setup.Scale)).toBe(false)
  })

  it('uses its own key for each page', () => {
    setStackView(Setup.Scale, true)
    setStackView(Setup.Chord, true)
    expect(localStorage.getItem('scaleStackView')).toBe('true')
    expect(localStorage.getItem('chordStackView')).toBe('true')
  })
})
