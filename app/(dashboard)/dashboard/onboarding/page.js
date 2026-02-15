import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";

export const metadata = {
  title: "Welcome",
  robots: { index: false },
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
