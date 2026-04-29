import { Loader2 } from "lucide-react"

export default function SuccessLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Processing Your Payment
        </h1>
        <p className="text-muted-foreground">
          Please wait while we activate your Energy+ plan...
        </p>
      </div>
    </div>
  )
}
