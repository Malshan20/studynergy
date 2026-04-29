export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 7, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using Studynergy, you agree to be bound by these Terms of Service and
              all applicable laws and regulations. If you do not agree with any of these terms, you
              are prohibited from using this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Use License</h2>
            <p>
              We grant you a personal, non-exclusive, non-transferable, limited license to use
              Studynergy for your educational purposes. This license does not include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modifying or copying the platform materials</li>
              <li>Using the materials for commercial purposes</li>
              <li>Attempting to reverse engineer any software on Studynergy</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Transferring the materials to another person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current
              information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">User Content</h2>
            <p>
              You retain ownership of all documents and materials you upload to Studynergy. By
              uploading content, you grant us a license to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your content to generate study materials</li>
              <li>Store your content securely on our servers</li>
              <li>Use anonymized, aggregated data to improve our AI models</li>
            </ul>
            <p className="mt-4">
              You are responsible for ensuring you have the right to upload any content to our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">AI-Generated Content</h2>
            <p>
              Studynergy uses AI to generate study materials. While we strive for accuracy, AI-generated
              content may contain errors or inaccuracies. You should:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review all AI-generated content for accuracy</li>
              <li>Use generated materials as study aids, not sole sources of information</li>
              <li>Verify important information with authoritative sources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Prohibited Uses</h2>
            <p>You may not use Studynergy to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload copyrighted materials without permission</li>
              <li>Engage in any illegal activity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems (bots) to access the platform</li>
              <li>Share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
            <p>
              Studynergy is provided "as is" and "as available." We do not guarantee uninterrupted
              access and may suspend or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p>
              Studynergy and its affiliates shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use or inability to use the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, if you
              breach these Terms of Service. Upon termination, your right to use the platform will
              immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any
              material changes by email or through the platform. Continued use after changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to{" "}
              <a href="mailto:legal@studynergy.com" className="text-primary hover:underline">
                legal@studynergy.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
