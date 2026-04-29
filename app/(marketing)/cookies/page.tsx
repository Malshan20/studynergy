export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 7, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              websites remember your preferences, improve your experience, and provide analytics
              about how the site is used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p>Studynergy uses cookies for the following purposes:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Essential Cookies</h3>
            <p>These cookies are necessary for the platform to function properly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authentication and account security</li>
              <li>Session management</li>
              <li>Platform functionality and features</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Preference Cookies</h3>
            <p>These cookies remember your settings and preferences:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Theme preferences (light/dark mode)</li>
              <li>Language settings</li>
              <li>Study preferences and customizations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Analytics Cookies</h3>
            <p>These cookies help us understand how you use Studynergy:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Page views and navigation patterns</li>
              <li>Feature usage statistics</li>
              <li>Performance monitoring</li>
              <li>Error tracking and debugging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Local Storage</h2>
            <p>
              In addition to cookies, Studynergy uses browser local storage to temporarily cache:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Game progress and XP data (synced with server)</li>
              <li>Study session state</li>
              <li>UI preferences</li>
              <li>Offline functionality data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <p>
              Some cookies are set by third-party services we use to provide Studynergy's
              functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase:</strong> Authentication and database services
              </li>
              <li>
                <strong>Vercel:</strong> Hosting and analytics
              </li>
            </ul>
            <p className="mt-4">
              These services have their own cookie policies. We recommend reviewing their policies to
              understand how they use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p>You can control and manage cookies in several ways:</p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Browser Settings</h3>
            <p>
              Most browsers allow you to control cookies through their settings. You can typically:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View which cookies are stored</li>
              <li>Delete existing cookies</li>
              <li>Block all cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close the browser</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Impact of Blocking Cookies</h3>
            <p>
              Please note that blocking or deleting cookies may impact your experience on Studynergy:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may need to log in more frequently</li>
              <li>Some features may not work properly</li>
              <li>Your preferences may not be saved</li>
              <li>Game progress may not sync correctly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cookie Duration</h2>
            <p>Studynergy uses both session and persistent cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain on your device for a set period (typically
                30-365 days) or until you delete them
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices
              or legal requirements. We will notify you of any material changes by updating the "Last
              updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Questions</h2>
            <p>
              If you have questions about our use of cookies, please contact us at{" "}
              <a href="mailto:privacy@studynergy.com" className="text-primary hover:underline">
                privacy@studynergy.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
