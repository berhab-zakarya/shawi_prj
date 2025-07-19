"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Contract, ContractSignature, SignatureVerification } from "@/types/contracts"
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Key, FileText, Clock, User } from "lucide-react"

interface SignatureVerificationViewProps {
  contract: Contract
  signatures: ContractSignature[]
  onBack: () => void
  onVerifySignature: (signatureId: number, contractContent?: string) => Promise<SignatureVerification | null>
  onVerifyLocally: (
    contractId: number,
    contractContent: string,
  ) => Promise<{ isValid: boolean; details: string } | null>
  loading: boolean
}

export function SignatureVerificationView({
  contract,
  signatures,
  onBack,
  onVerifySignature,
  onVerifyLocally,
  loading,
}: SignatureVerificationViewProps) {
  const [selectedSignature, setSelectedSignature] = useState<ContractSignature | null>(null)
  const [verificationResult, setVerificationResult] = useState<SignatureVerification | null>(null)
  const [localVerificationResult, setLocalVerificationResult] = useState<{ isValid: boolean; details: string } | null>(
    null,
  )
  const [verifying, setVerifying] = useState(false)

  const handleVerifySignature = async (signature: ContractSignature) => {
    setVerifying(true)
    setSelectedSignature(signature)

    try {
      // Server-side verification
      const serverResult = await onVerifySignature(signature.id, contract.full_text)
      setVerificationResult(serverResult)

      // Local verification
      const localResult = await onVerifyLocally(contract.id, contract.full_text)
      setLocalVerificationResult(localResult)
    } catch (error) {
      console.error("Verification failed:", error)
    } finally {
      setVerifying(false)
    }
  }

  const getVerificationStatusBadge = (status: "valid" | "invalid" | "pending" | undefined) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            صالح
          </Badge>
        )
      case "invalid":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            غير صالح
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            قيد التحقق
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            غير محقق
          </Badge>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">التحقق من التوقيعات - العقد #{contract.id}</h1>
            <p className="text-muted-foreground">التحقق من صحة التوقيعات الرقمية للعقد</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          {signatures.length} توقيع
        </Badge>
      </div>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            معلومات العقد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">نوع العقد</Label>
              <p className="font-semibold">{contract.contract_type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">حالة العقد</Label>
              <p className="font-semibold">{contract.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
              <p className="font-semibold">{new Date(contract.created_at).toLocaleDateString("ar-SA")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">آخر تحديث</Label>
              <p className="font-semibold">{new Date(contract.updated_at).toLocaleDateString("ar-SA")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            قائمة التوقيعات
          </CardTitle>
          <CardDescription>جميع التوقيعات المرتبطة بهذا العقد</CardDescription>
        </CardHeader>
        <CardContent>
          {signatures.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد توقيعات لهذا العقد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signatures.map((signature) => (
                <Card key={signature.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">توقيع #{signature.id}</h3>
                          <p className="text-sm text-gray-600">
                            المستخدم: {signature.user} | IP: {signature.ip_address}
                          </p>
                          <p className="text-xs text-gray-500">
                            تاريخ التوقيع: {new Date(signature.signed_at).toLocaleString("ar-SA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getVerificationStatusBadge(signature.verification_status)}
                        <Button
                          onClick={() => handleVerifySignature(signature)}
                          disabled={verifying || loading}
                          size="sm"
                        >
                          {verifying && selectedSignature?.id === signature.id ? "جاري التحقق..." : "تحقق من التوقيع"}
                        </Button>
                      </div>
                    </div>

                    {/* Signature Details */}
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <Label className="font-medium text-gray-600">هاش التوقيع:</Label>
                        <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {signature.signature_hash}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">المفتاح العام:</Label>
                        <Textarea value={signature.public_key} readOnly className="font-mono text-xs mt-1 h-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Results */}
      {(verificationResult || localVerificationResult) && selectedSignature && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              نتائج التحقق - التوقيع #{selectedSignature.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Server Verification */}
            {verificationResult && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  التحقق من الخادم
                </h3>
                <Alert
                  className={
                    verificationResult.status === "valid" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>الحالة:</strong>
                        {verificationResult.status === "valid" ? (
                          <Badge className="bg-green-100 text-green-700">صالح</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">غير صالح</Badge>
                        )}
                      </div>
                      <div>
                        <strong>الرسالة:</strong> {verificationResult.message}
                      </div>
                      <div>
                        <strong>الموقع بواسطة:</strong> {verificationResult.signed_by}
                      </div>
                      <div>
                        <strong>تاريخ التوقيع:</strong> {new Date(verificationResult.signed_at).toLocaleString("ar-SA")}
                      </div>

                      {verificationResult.verification_details && (
                        <div className="mt-4">
                          <strong>تفاصيل التحقق:</strong>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex items-center gap-2">
                              {verificationResult.verification_details.public_key_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              المفتاح العام صالح
                            </div>
                            <div className="flex items-center gap-2">
                              {verificationResult.verification_details.signature_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              التوقيع صالح
                            </div>
                            <div className="flex items-center gap-2">
                              {verificationResult.verification_details.content_hash_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              هاش المحتوى صالح
                            </div>
                            <div className="flex items-center gap-2">
                              {verificationResult.verification_details.timestamp_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              الطابع الزمني صالح
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Local Verification */}
            {localVerificationResult && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  التحقق المحلي
                </h3>
                <Alert
                  className={
                    localVerificationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>النتيجة:</strong>
                        {localVerificationResult.isValid ? (
                          <Badge className="bg-green-100 text-green-700">صالح محلياً</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">غير صالح محلياً</Badge>
                        )}
                      </div>
                      <div>
                        <strong>التفاصيل:</strong> {localVerificationResult.details}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <Separator />

            {/* Security Notice */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>ملاحظة أمنية:</strong> يتم التحقق من التوقيعات باستخدام خوارزمية RSA-PSS مع SHA-256. التحقق من
                الخادم يوفر مصادقة إضافية، بينما التحقق المحلي يستخدم البيانات المحفوظة في المتصفح.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
