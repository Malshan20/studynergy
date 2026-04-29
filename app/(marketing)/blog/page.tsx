import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })

  const categories = [...new Set(posts?.map(p => p.category) || [])]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Studynergy <span className="text-primary">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Study tips, learning strategies, and the latest updates from Studynergy
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No blog posts yet. Check back soon!</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              >
                {post.cover_image && (
                  <div className="aspect-video bg-secondary overflow-hidden">
                    <img
                      src={post.cover_image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
