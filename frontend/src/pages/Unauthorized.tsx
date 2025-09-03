import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertTriangle, ArrowLeft, Home, Shield } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            غير مصرح لك بالوصول
          </CardTitle>
          <CardDescription className="text-gray-600">
            عذراً، ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للصفحة السابقة
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              العودة للرئيسية
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>رمز الخطأ: 403 - Forbidden</p>
            <p>يرجى التأكد من صلاحياتك أو التواصل مع الدعم الفني</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
