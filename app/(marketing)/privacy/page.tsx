export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 7, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p>
              At Studynergy, we take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our AI-powered
              study platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address and name (when you create an account)</li>
              <li>Study materials and documents you upload</li>
              <li>Generated study content (flashcards, quizzes, summaries, exams)</li>
              <li>Game scores, achievements, and leaderboard data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>How you interact with our platform</li>
              <li>Study session data and progress tracking</li>
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To generate personalized study materials using AI</li>
              <li>To track your progress and achievements</li>
              <li>To improve our platform and develop new features</li>
              <li>To communicate with you about updates and support</li>
              <li>To ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information.
              Your data is encrypted in transit and at rest. However, no method of transmission over
              the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Supabase for authentication and database hosting</li>
              <li>Groq for AI-powered content generation</li>
              <li>Vercel for hosting and deployment</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies and may collect information as described
              in their respective policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <p>
              Studynergy is intended for students of all ages. If you are under 13 years old, please
              have a parent or guardian review this Privacy Policy and create your account with their
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
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
