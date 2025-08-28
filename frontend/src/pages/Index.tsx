import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Users, Handshake, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import echoopsLogo from "@/assets/logo.svg";

const Index = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Auto-redirect to login after 3 seconds if not authenticated
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Users,
      title: t('dashboard.quickActions.addLead'),
      description: t('dashboard.quickActions.addLead')
    },
    {
      icon: Building2,
      title: t('dashboard.quickActions.addProperty'), 
      description: t('dashboard.quickActions.addProperty')
    },
    {
      icon: Handshake,
      title: t('dashboard.quickActions.createDeal'),
      description: t('dashboard.quickActions.createDeal')
    },
    {
      icon: TrendingUp,
      title: t('nav.analytics'),
      description: t('nav.analytics')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10" dir="rtl">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Logo and Title */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <img 
                src={echoopsLogo} 
                alt="EchoOps Logo" 
                className="h-24 w-auto drop-shadow-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent arabic-text">
                EchoOps Real Estate CRM
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground arabic-text max-w-2xl mx-auto leading-relaxed">
                {t('dashboard.overview')}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="crm-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg arabic-text">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm arabic-text leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button 
              size="lg"
              className="gradient-primary text-white px-8 py-3 text-lg font-semibold arabic-text shadow-medium hover:shadow-strong transition-all"
              asChild
            >
              <a href="/login">
                {t('auth.login.loginButton')}
                <ArrowRight className="mr-2 h-5 w-5" />
              </a>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg font-semibold arabic-text border-2"
              asChild
            >
              <a href="/register">
                {t('auth.register.registerButton')}
              </a>
            </Button>
          </div>

          {/* Auto-redirect Notice */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground arabic-text">
              {t('hardcoded.loadingText')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-border bg-card/50">
        <p className="text-sm text-muted-foreground arabic-text">
          © 2024 EchoOps Real Estate CRM. {t('hardcoded.allRightsReserved')}
        </p>
      </footer>
    </div>
  );
};

export default Index;
