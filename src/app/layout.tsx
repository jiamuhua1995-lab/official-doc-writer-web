import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '公文写作助手',
  description: '在线公文写作工具，AI 辅助生成符合国标的公文',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
