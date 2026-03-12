'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TabsContextType {
  active: string
  setActive: (value: string) => void
}

const TabsContext = createContext<TabsContextType>({ active: '', setActive: () => {} })

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { active, setActive } = useContext(TabsContext)
  const isActive = active === value
  return (
    <button
      onClick={() => setActive(value)}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
        isActive
          ? 'bg-white text-brand-orange shadow-sm'
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return <div className="mt-4">{children}</div>
}
