export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: February 2026
      </p>

      {/* 1. Introduction */}
      <h2 className="text-2xl font-bold mt-10 mb-4">1. Introduction</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        At Reelytics, we are committed to protecting your privacy and ensuring
        the security of your personal information. This Privacy Policy explains
        how we collect, use, disclose, and safeguard your information when you
        use our analytics platform (&quot;the Service&quot;). By using the
        Service, you consent to the practices described in this policy.
      </p>

      {/* 2. Information We Collect */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        2. Information We Collect
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We collect the following types of information to provide and improve the
        Service:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          <span className="font-medium text-foreground">Account information:</span>{" "}
          Your name, email address, and password when you create an account.
        </li>
        <li>
          <span className="font-medium text-foreground">Usage data:</span>{" "}
          Information about how you interact with the Service, including pages
          visited, features used, and session duration.
        </li>
        <li>
          <span className="font-medium text-foreground">Series metrics:</span>{" "}
          Performance data you submit about your short-form series, including
          episode views, retention rates, paywall conversion data, and revenue
          figures.
        </li>
        <li>
          <span className="font-medium text-foreground">Device information:</span>{" "}
          Browser type, operating system, and IP address for security and
          analytics purposes.
        </li>
      </ul>

      {/* 3. How We Use Information */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        3. How We Use Information
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We use the information we collect for the following purposes:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          To provide, operate, and maintain the Service and your account.
        </li>
        <li>
          To generate analytics, insights, and recommendations based on your
          series data.
        </li>
        <li>
          To communicate with you about your account, including service updates,
          security alerts, and support messages.
        </li>
        <li>
          To improve and develop new features for the Service.
        </li>
        <li>
          To detect, prevent, and address technical issues and security threats.
        </li>
      </ul>

      {/* 4. Third-Party Services */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        4. Third-Party Services
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We use the following trusted third-party services to operate the
        platform. Each provider has their own privacy policy governing the data
        they process:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          <span className="font-medium text-foreground">Supabase</span> —
          Database hosting and user authentication.
        </li>
        <li>
          <span className="font-medium text-foreground">Stripe</span> — Payment
          processing and subscription management.
        </li>
        <li>
          <span className="font-medium text-foreground">Vercel</span> —
          Application hosting and deployment.
        </li>
      </ul>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We only share the minimum information necessary for these services to
        perform their functions. We do not sell your personal information to
        third parties.
      </p>

      {/* 5. Cookies */}
      <h2 className="text-2xl font-bold mt-10 mb-4">5. Cookies</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We use session cookies that are essential for authentication and
        maintaining your logged-in state. These cookies are strictly necessary
        for the Service to function and do not track your activity across other
        websites. We do not use advertising or tracking cookies.
      </p>

      {/* 6. Data Security */}
      <h2 className="text-2xl font-bold mt-10 mb-4">6. Data Security</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We take the security of your data seriously and employ
        industry-standard practices to protect it. All data is encrypted in
        transit using TLS/SSL and at rest using AES-256 encryption. We regularly
        review our security practices and update them as needed to address
        emerging threats.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        While we strive to protect your personal information, no method of
        electronic transmission or storage is 100% secure. We cannot guarantee
        absolute security but are committed to maintaining the highest
        reasonable standard of protection.
      </p>

      {/* 7. Data Retention & Deletion */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        7. Data Retention &amp; Deletion
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We retain your personal information and series data for as long as your
        account remains active and as needed to provide the Service. If you
        choose to close your account, you may request deletion of your data by
        contacting us. Upon receiving a deletion request, we will remove your
        data from our active systems within 30 days. Some data may be retained
        in backups for a limited period as required by law or for legitimate
        business purposes.
      </p>

      {/* 8. Your Rights */}
      <h2 className="text-2xl font-bold mt-10 mb-4">8. Your Rights</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        You have the following rights regarding your personal data:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>
          <span className="font-medium text-foreground">Access:</span> Request a
          copy of the personal data we hold about you.
        </li>
        <li>
          <span className="font-medium text-foreground">Correction:</span>{" "}
          Request correction of any inaccurate or incomplete data.
        </li>
        <li>
          <span className="font-medium text-foreground">Deletion:</span> Request
          deletion of your personal data and account.
        </li>
        <li>
          <span className="font-medium text-foreground">Data export:</span>{" "}
          Request a machine-readable export of your data.
        </li>
      </ul>
      <p className="text-muted-foreground leading-relaxed mb-4">
        To exercise any of these rights, please contact us at the email address
        listed below. We will respond to your request within 30 days.
      </p>

      {/* 9. Children's Privacy */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        9. Children&apos;s Privacy
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The Service is not directed at children under the age of 13. We do not
        knowingly collect personal information from children under 13. If we
        discover that a child under 13 has provided us with personal
        information, we will promptly delete it. If you believe a child under 13
        may have provided us with personal information, please contact us
        immediately.
      </p>

      {/* 10. Changes to This Policy */}
      <h2 className="text-2xl font-bold mt-10 mb-4">
        10. Changes to This Policy
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or for legal, operational, or regulatory reasons. For
        material changes, we will notify you via the email address associated
        with your account before the changes take effect. We encourage you to
        review this policy periodically. Your continued use of the Service after
        changes are posted constitutes your acceptance of the updated policy.
      </p>

      {/* 11. Contact Us */}
      <h2 className="text-2xl font-bold mt-10 mb-4">11. Contact Us</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If you have any questions or concerns about this Privacy Policy or our
        data practices, please contact us at{" "}
        <a
          href="mailto:privacy@reelytics.io"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          privacy@reelytics.io
        </a>
        .
      </p>
    </>
  );
}
