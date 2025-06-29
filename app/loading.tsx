import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  )
}
