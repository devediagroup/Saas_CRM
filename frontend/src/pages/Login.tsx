import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Building2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import echoopsLogo from "@/assets/logo.svg";

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login(formData);

      // Store token and user data
      localStorage.setItem('token', response.data.access_token);

      if (response.data.refresh_token) {
        localStorage.setItem('refreshToken', response.data.refresh_token);
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      toast({
        title: t('success.saved'),
        description: t('auth.login.welcome'),
      });

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: t('auth.login.error.invalid'),
        description: error.response?.data?.message || t('auth.login.error.required'),
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
            {t('auth.login.title')}
          </h1>
          <p className="text-muted-foreground mt-2 arabic-text">
            {t('auth.login.welcome')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="crm-card border-0 shadow-medium">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold arabic-text">
              {t('auth.login.title')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder={t('auth.login.email')}
                  className="arabic-text text-right"
                  dir="rtl"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    placeholder={t('auth.login.password')}
                    className="arabic-text text-right pl-10"
                    dir="rtl"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-white font-semibold py-3 text-base arabic-text"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.login.loginButton')}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground arabic-text">
                {t('auth.login.noAccount')}{" "}
                <a
                  href="/register"
                  className="text-accent hover:underline font-medium"
                >
                  {t('auth.login.createAccount')}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground arabic-text">
            © 2024 EchoOps. {t('common.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;