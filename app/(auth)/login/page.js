import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Welcome to <span className="text-primary">Reelytics</span>
        </CardTitle>
        <CardDescription>
          Sign in to access your analytics dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <OAuthButton />
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
