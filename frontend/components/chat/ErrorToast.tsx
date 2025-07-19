'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertCircle, Wifi, Shield, Search, Server, Zap } from 'lucide-react';

interface ErrorState {
  message: string;
  type: 'network' | 'validation' | 'authentication' | 'not_found' | 'server' | 'websocket' | 'duplicate_reaction' | null;
}

interface ErrorToastProps {
  error: ErrorState;
  resetError: () => void;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case 'network':
      return <Wifi className="w-4 h-4" />;
    case 'authentication':
      return <Shield className="w-4 h-4" />;
    case 'not_found':
      return <Search className="w-4 h-4" />;
    case 'server':
      return <Server className="w-4 h-4" />;
    case 'websocket':
      return <Zap className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getErrorTitle = (type: string) => {
  switch (type) {
    case 'network':
      return 'خطأ في الشبكة';
    case 'authentication':
      return 'خطأ في المصادقة';
    case 'not_found':
      return 'غير موجود';
    case 'validation':
      return 'خطأ في البيانات';
    case 'server':
      return 'خطأ في الخادم';
    case 'websocket':
      return 'خطأ في الاتصال المباشر';
    default:
      return 'خطأ';
  }
};

const getErrorMessage = (type: string, message: string) => {
  if (message) return message;
  
  switch (type) {
    case 'network':
      return 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى';
    case 'authentication':
      return 'يرجى تسجيل الدخول مرة أخرى';
    case 'not_found':
      return 'الموارد المطلوبة غير موجودة';
    case 'validation':
      return 'يرجى التحقق من البيانات المدخلة';
    case 'server':
      return 'حدث خطأ في الخادم، حاول مرة أخرى لاحقاً';
    case 'websocket':
      return 'فشل الاتصال بالدردشة في الوقت الحقيقي';
    default:
      return 'حدث خطأ غير متوقع';
  }
};

export default function ErrorToast({ error, resetError }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error.message && error.type) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [error]);

  const handleClose = () => {
    setIsVisible(false);
    resetError();
  };

  const handleRedirect = () => {
    if (error.type === 'authentication') {
      window.location.href = '/login';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center" dir="rtl">
      <Alert className="max-w-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="text-red-600 dark:text-red-400 mt-0.5">
            {getErrorIcon(error.type || 'default')}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
              {getErrorTitle(error.type || 'default')}
            </h4>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {getErrorMessage(error.type || 'default', error.message)}
            </AlertDescription>
            
            {error.type === 'authentication' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedirect}
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
