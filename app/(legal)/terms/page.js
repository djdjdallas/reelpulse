export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: February 2026
      </p>

      {/* 1. Acceptance of Terms */}
      <h2 className="text-2xl font-bold mt-10 mb-4">1. Acceptance of Terms</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        By accessing or using ReelPulse (&quot;the Service&quot;), you agree to
        be bound by these Terms of Service (&quot;Terms&quot;). If you do not
        agree to all of these Terms, you may not access or use the Service.
        These Terms constitute a legally binding agreement between you and
        ReelPulse.
      </p>

      {/* 2. Description of Service */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        2. Description of Service
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        ReelPulse is an analytics platform designed for short-form series
        creators. The Service provides tools for tracking episode performance,
        audience retention, paywall optimization, and revenue analytics across
        platforms such as ReelShort, DramaBox, ShortTV, and others. Features and
        functionality may change over time as we continue to develop and improve
        the platform.
      </p>

      {/* 3. User Accounts */}
      <h2 className="text-2xl font-bold mt-10 mb-4">3. User Accounts</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        To access certain features of the Service, you must create an account.
        You are responsible for maintaining the confidentiality of your account
        credentials, including your password, and for all activity that occurs
        under your account. Each person may maintain only one account. You agree
        to notify us immediately of any unauthorized use of your account.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        You must provide accurate and complete information when creating your
        account and keep this information up to date. We reserve the right to
        suspend or terminate accounts that contain false or misleading
        information.
      </p>

      {/* 4. Subscription & Billing */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        4. Subscription &amp; Billing
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        ReelPulse offers subscription-based plans with recurring billing.
        Payments are processed securely through Stripe. By subscribing to a paid
        plan, you authorize us to charge your payment method on a recurring
        basis at the then-current subscription rate.
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          Billing cycles are monthly or annual, depending on your selected plan.
        </li>
        <li>
          You may cancel your subscription at any time from your account
          settings.
        </li>
        <li>
          Cancellations take effect at the end of the current billing period. No
          partial refunds are provided for unused time.
        </li>
        <li>
          We reserve the right to change pricing with 30 days&apos; notice to
          existing subscribers.
        </li>
      </ul>

      {/* 5. User Content & Data */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        5. User Content &amp; Data
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        You retain full ownership of all data and content you submit to the
        Service (&quot;User Content&quot;). By using the Service, you grant
        ReelPulse a limited, non-exclusive license to use, process, and display
        your User Content solely for the purpose of operating and providing the
        Service to you.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We will not sell, share, or distribute your User Content to third
        parties except as necessary to provide the Service or as required by
        law.
      </p>

      {/* 6. Acceptable Use */}
      <h2 className="text-2xl font-bold mt-10 mb-4">6. Acceptable Use</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        You agree not to use the Service for any unlawful purpose or in
        violation of these Terms. Specifically, you agree not to:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          Engage in any illegal activity or use the Service to facilitate illegal
          actions.
        </li>
        <li>
          Reverse engineer, decompile, or disassemble any part of the Service.
        </li>
        <li>
          Attempt to gain unauthorized access to the Service or its related
          systems.
        </li>
        <li>
          Abuse, harass, or threaten other users of the Service.
        </li>
        <li>
          Use automated tools to scrape, crawl, or extract data from the
          Service without written permission.
        </li>
        <li>
          Interfere with or disrupt the integrity or performance of the Service.
        </li>
      </ul>

      {/* 7. Intellectual Property */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        7. Intellectual Property
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The Service, including its original content, features, functionality,
        design, and branding, is and will remain the exclusive property of
        ReelPulse. The Service is protected by copyright, trademark, and other
        applicable laws. Our trademarks and trade dress may not be used in
        connection with any product or service without prior written consent.
      </p>

      {/* 8. Termination */}
      <h2 className="text-2xl font-bold mt-10 mb-4">8. Termination</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Either party may terminate this agreement at any time. You may cancel
        your account through your account settings or by contacting us. We may
        suspend or terminate your access to the Service at our sole discretion
        if we believe you have violated these Terms.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Upon termination, you may request an export of your data within 30 days.
        After this period, we reserve the right to delete your data from our
        systems in accordance with our data retention policies.
      </p>

      {/* 9. Disclaimers & Limitation of Liability */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        9. Disclaimers &amp; Limitation of Liability
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The Service is provided on an &quot;as is&quot; and &quot;as
        available&quot; basis without warranties of any kind, whether express or
        implied, including but not limited to implied warranties of
        merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        In no event shall ReelPulse, its directors, employees, partners, or
        affiliates be liable for any indirect, incidental, special,
        consequential, or punitive damages, including without limitation loss of
        profits, data, or use. Our total aggregate liability shall not exceed
        the amount you have paid to ReelPulse in the twelve (12) months
        preceding the claim.
      </p>

      {/* 10. Changes to Terms */}
      <h2 className="text-2xl font-bold mt-10 mb-4">10. Changes to Terms</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We reserve the right to modify or replace these Terms at any time. For
        material changes, we will provide at least 30 days&apos; notice before
        the new terms take effect. Notice may be provided via email or through a
        prominent notice within the Service. Your continued use of the Service
        after such changes constitutes acceptance of the updated Terms.
      </p>

      {/* 11. Governing Law */}
      <h2 className="text-2xl font-bold mt-10 mb-4">11. Governing Law</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        These Terms shall be governed by and construed in accordance with the
        laws of the State of Delaware, United States, without regard to its
        conflict of law provisions. Any legal action or proceeding arising under
        these Terms shall be brought exclusively in the courts located in the
        State of Delaware.
      </p>

      {/* 12. Contact */}
      <h2 className="text-2xl font-bold mt-10 mb-4">12. Contact</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If you have any questions about these Terms of Service, please contact
        us at{" "}
        <a
          href="mailto:legal@reelpulse.com"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          legal@reelpulse.com
        </a>
        .
      </p>
    </>
  );
}
