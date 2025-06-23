'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'monthlyBudget'

export default function useBudget() {
  const [budget, setBudgetState] = useState<number>(250000)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const value = parseInt(stored, 10)
      if (!isNaN(value)) {
        setBudgetState(value)
      }
    }
  }, [])

  const setBudget = (value: number) => {
    setBudgetState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value.toString())
    }
  }

  return { budget, setBudget }
}
