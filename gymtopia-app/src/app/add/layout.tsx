export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export default function AddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}