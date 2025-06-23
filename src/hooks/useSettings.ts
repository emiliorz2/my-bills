'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface Setting {
  id: number
  userId: number
  preferredCurrency: string
  exchangeRate: number | null
  monthlyBudget: number
}

export default function useSettings() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings', fetcher)

  const saveSettings = async (settings: Partial<Setting>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (!res.ok) throw new Error('Failed to save settings')
    mutate()
  }

  return {
    settings: data?.data as Setting | null,
    error,
    isLoading,
    saveSettings,
    mutate,
  }
}
