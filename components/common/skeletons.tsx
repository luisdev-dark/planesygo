import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ItinerarySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((day) => (
        <Card key={day} className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((activity) => (
              <div key={activity} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex gap-4 p-4 rounded-xl border">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function MapSkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
