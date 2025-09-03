import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import echoopsLogo from "@/assets/logo.svg";

const Register = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: ""
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error(t('register.passwordMismatch'));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: t('register.successTitle'),
        description: t('register.successDescription'),
      });

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: t('register.errorTitle'),
        description: error.response?.data?.message || error.message || t('errors.generic'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={echoopsLogo}
              alt="EchoOps Logo"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary arabic-text">
            {t('register.title')}
          </h1>
          <p className="text-muted-foreground mt-2 arabic-text">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Register Form */}
        <Card className="crm-card border-0 shadow-medium">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold arabic-text">
              {t('register.formTitle')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium arabic-text flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t('register.username')}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('register.usernamePlaceholder')}
                  className="arabic-text text-right"
                  dir="rtl"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium arabic-text flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {t('auth.login.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  className="arabic-text text-right"
                  dir="rtl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium arabic-text flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {t('auth.login.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('register.passwordPlaceholder')}
                    className="arabic-text text-right pl-10"
                    dir="rtl"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium arabic-text flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {t('register.confirmPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    className="arabic-text text-right pl-10"
                    dir="rtl"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-white font-semibold py-3 text-base arabic-text"
                disabled={isLoading}
              >
                <UserPlus className="ml-2 h-5 w-5 rtl:ml-0 rtl:mr-2" />
                {isLoading ? t('register.registering') : t('register.registerButton')}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground arabic-text">
                {t('register.hasAccount')}{" "}
                <a
                  href="/login"
                  className="text-accent hover:underline font-medium"
                >
                  {t('register.loginLink')}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground arabic-text">
            {t('register.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;