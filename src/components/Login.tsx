import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Phone, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginProps {
  onLogin: (rationNumber: string, mobile: string) => void;
}

const demoAccounts = [
  { rationCard: "123456789012", mobile: "9876543210", familyCount: 2 },
  { rationCard: "234567890123", mobile: "9876543211", familyCount: 3 },
  { rationCard: "345678901234", mobile: "9876543212", familyCount: 4 },
  { rationCard: "456789012345", mobile: "9876543213", familyCount: 5 },
];

const Login = ({ onLogin }: LoginProps) => {
  const { t } = useLanguage();
  const [rationNumber, setRationNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(rationNumber, mobileNumber);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("login.title")}</h1>
          <h2 className="text-2xl font-semibold text-primary mb-1">{t("login.subtitle")}</h2>
          <p className="text-muted-foreground">{t("login.tagline")}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">{t("login.heading")}</CardTitle>
            <CardDescription className="text-center">
              {t("login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ration-number" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("login.rationCard")}
                </Label>
                <Input
                  id="ration-number"
                  type="text"
                  placeholder={t("login.rationCardPlaceholder")}
                  value={rationNumber}
                  onChange={e => setRationNumber(e.target.value)}
                  required
                  maxLength={12}
                  className="text-center text-lg tracking-wider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-number" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t("login.mobile")}
                </Label>
                <Input
                  id="mobile-number"
                  type="tel"
                  placeholder={t("login.mobilePlaceholder")}
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  required
                  maxLength={10}
                  className="text-center text-lg tracking-wider"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                disabled={isLoading || rationNumber.length !== 12 || mobileNumber.length !== 10}
              >
                {isLoading ? t("login.verifying") : t("login.button")}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>{t("login.security")}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Shield className="w-3 h-3" />
                  <span>{t("login.encrypted")}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t("login.help")}</p>
          <p className="mt-1">{t("login.helpline")}</p>
          <div className="mt-4 p-3 bg-card rounded-lg border">
            <p className="font-semibold text-foreground mb-2">{t("login.demoAccounts")}</p>
            {demoAccounts.map((account, idx) => (
              <p key={idx} className="text-xs">
                Ration: {account.rationCard} | Mobile: {account.mobile} ({account.familyCount} {t("login.members")})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;