import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, UserCheck, Mail, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { Contract,  AssignReview } from "@/types/contracts";
import { AdminUser } from '@/types/admin';

interface AssignLawyerProps {
  contract: Contract;
  users: AdminUser[];
  onAssign: (contractId: number, lawyerId: number) => Promise<AssignReview | null>;
  onBack: () => void;
  loading: boolean;
  onGetUsers: () => Promise<void>;
}

export const AssignLawyer: React.FC<AssignLawyerProps> = ({
  contract,
  users,
  onAssign,
  onBack,
  loading,
  onGetUsers
}) => {
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>("");
  const [assignmentResult, setAssignmentResult] = useState<AssignReview | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter users to show only lawyers (assuming lawyers have role 'lawyer' or similar)
  const lawyers = users.filter(user => 
    user.is_active && 
    user.email_verified &&
    (user.role === 'Lawyer' || user.role === 'Admin') // Adjust role filtering as needed
  );

  useEffect(() => {
    // Fetch users when component mounts
    onGetUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedLawyerId) return;

    setIsAssigning(true);
    try {
      const result = await onAssign(contract.id, parseInt(selectedLawyerId));
      if (result) {
        setAssignmentResult(result);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const getSelectedLawyer = () => {
    return lawyers.find(lawyer => lawyer.id.toString() === selectedLawyerId);
  };

  const getRoleBadge = (role: string | null) => {
    if (role === 'lawyer') {
      return <Badge variant="default" className="bg-blue-100 text-blue-700">محامي</Badge>;
    }
    if (role === 'admin') {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-700">مدير</Badge>;
    }
    return <Badge variant="outline">غير محدد</Badge>;
  };

  if (assignmentResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تم تعيين المحامي بنجاح</h1>
              <p className="text-gray-600">للعقد #{contract.id}</p>
            </div>
          </div>
        </div>

        {/* Success Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              تم التعيين بنجاح
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">المحامي المعين:</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{assignmentResult.lawyer.first_name} {assignmentResult.lawyer.last_name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">البريد الإلكتروني:</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{assignmentResult.lawyer.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">حالة المراجعة:</p>
                <Badge variant="outline">{assignmentResult.status}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">تاريخ التعيين:</p>
                <span className="text-sm">{new Date(assignmentResult.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تعيين محامي للمراجعة</h1>
            <p className="text-gray-600">للعقد #{contract.id}</p>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات العقد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">نوع العقد:</p>
              <p className="font-medium">{contract.contract_type || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">الحالة الحالية:</p>
              <Badge variant="outline">{contract.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ الإنشاء:</p>
              <p className="text-sm">{new Date(contract.created_at).toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lawyer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            اختيار المحامي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="mr-2">جاري تحميل قائمة المحامين...</span>
            </div>
          )}

          {!loading && lawyers.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا يوجد محامين متاحين حالياً. يرجى المحاولة مرة أخرى لاحقاً.
              </AlertDescription>
            </Alert>
          )}

          {!loading && lawyers.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر المحامي:</label>
                <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر محامي للمراجعة" />
                  </SelectTrigger>
                  <SelectContent>
                    {lawyers.map((lawyer) => (
                      <SelectItem key={lawyer.id} value={lawyer.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lawyer.full_name}</span>
                            {getRoleBadge(lawyer.role)}
                          </div>
                          <span className="text-sm text-gray-500">{lawyer.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLawyerId && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900">المحامي المختار:</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{getSelectedLawyer()?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{getSelectedLawyer()?.email}</span>
                        </div>
                        {getRoleBadge(getSelectedLawyer()?.role || null)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={isAssigning}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedLawyerId || isAssigning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAssigning && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                  تعيين المحامي
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};