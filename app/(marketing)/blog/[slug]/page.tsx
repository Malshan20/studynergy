import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()

  if (!post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("blog_posts")
    .update({ views: (post.views || 0) + 1 })
    .eq("id", post.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 mb-8 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <article>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.read_time}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar || "/placeholder.svg"}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <div className="font-medium">{post.author_name}</div>
                <div className="text-xs text-muted-foreground">{post.views || 0} views</div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-secondary">
              <img
                src={post.cover_image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Study Game?</h3>
          <p className="text-muted-foreground mb-6">
            Start using Studynergy today and experience AI-powered learning.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
