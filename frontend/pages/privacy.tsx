import PublicPage from "components/PublicPage";
import Heading from "components/Heading";
import { Card } from "components/ui/card";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <PublicPage documentTitle="Privacy Policy | BirdPlan.app">
      <div className="max-w-3xl mx-auto py-12">
        <Heading title="Privacy Policy" className="mb-2" />
        <p className="text-muted-foreground mb-8">Last updated: July 12, 2026</p>

        <Card className="rounded-2xl p-8">
          <div className="prose prose-gray max-w-none">
            <p>
              BirdPlan.app (&quot;we&quot;, &quot;us&quot;) is a free tool for planning birding trips. This policy
              explains what information we collect, how we use it, and the choices you have. We keep data collection to
              the minimum needed to run the service, and we never sell your personal information.
            </p>

            <h2>Information we collect</h2>
            <ul>
              <li>
                <strong>Account information</strong> — your name and email address. We use passwordless sign-in, so we
                never store a password.
              </li>
              <li>
                <strong>Content you create</strong> — the trips, itineraries, life lists, notes, and custom map
                locations you build in the app, and the email addresses of people you invite to a trip.
              </li>
              <li>
                <strong>Messages you send us</strong> — the contents of contact or support requests, along with basic
                technical details (such as browser type and screen size) to help us reproduce issues.
              </li>
              <li>
                <strong>Basic technical data</strong> — standard server logs and information your browser sends when you
                use the app.
              </li>
            </ul>

            <h2>How we use it</h2>
            <p>
              We use the information we collect to provide, maintain, and secure BirdPlan.app. This includes signing you
              in and sending login links to your email, saving and syncing the content you create, delivering
              invitations to people you invite to a trip, responding to your inquiries, and protecting the service
              against abuse.
            </p>

            <h2>Service providers</h2>
            <p>
              We use trusted third-party providers to support certain functions of the app, and share data with them
              only as needed for those functions. These include hosting and database providers, file storage, email
              delivery, and services for maps, bird data, and translation. These providers process data on our behalf
              under their own privacy and security terms.
            </p>

            <h2>Cookies and local storage</h2>
            <p>
              We use your browser&apos;s local storage to keep you signed in and to store app data on your device. We do
              not use advertising or third-party tracking cookies.
            </p>

            <h2>Data retention and your choices</h2>
            <p>
              We keep your information for as long as you have an account. You can edit or delete your content at any
              time, and you can permanently delete your account and all associated data from your{" "}
              <Link to="/account" className="text-link font-medium">
                account settings
              </Link>
              . If you have any questions or need help, please{" "}
              <Link to="/contact" className="text-link font-medium">
                contact us
              </Link>
              .
            </p>

            <h2>Children</h2>
            <p>BirdPlan.app is not directed to children under 13, and we do not knowingly collect their information.</p>

            <h2>Changes to this policy</h2>
            <p>
              We may update this policy from time to time. When we do, we&apos;ll revise the &quot;Last updated&quot;
              date above.
            </p>

            <h2>Contact</h2>
            <p>
              If you have any questions about this policy or your data, please{" "}
              <Link to="/contact" className="text-link font-medium">
                get in touch
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    </PublicPage>
  );
}
