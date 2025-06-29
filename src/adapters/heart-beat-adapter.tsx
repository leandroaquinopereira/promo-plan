'use client'

import type { ReactNode } from 'react'

type HeartBeatAdapterProps = {
  children: ReactNode | ReactNode[]
}

export function HeartBeatAdapter({ children }: HeartBeatAdapterProps) {
  return children
}
