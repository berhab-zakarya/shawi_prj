"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
  Contract,
  CreateContractRequest,
  NDAContractData,
  EnhanceContractResponse,
  ContractSignature,
} from "@/types/contracts"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Building,
  Clock,
  Shield,
  CheckCircle,
  Info,
  Sparkles,
  PenTool,
  Download,
} from "lucide-react"

interface CreateContractPageProps {
  onBack: () => void
  onSubmit: (data: CreateContractRequest) => Promise<Contract | null>
  onGenerateText: (id: number) => Promise<{ full_text: string; text_version: string } | null>
  onEnhance: (id: number, type: "enhance" | "correct" | "translate") => Promise<EnhanceContractResponse | null>
  onSign: (id: number) => Promise<boolean> // ✅ تم تعديل نوع الإرجاع إلى boolean
  onExport: (id: number, format: "pdf" | "docx") => Promise<boolean>
  loading: boolean
}

type Step = "create" | "generate" | "enhance" | "sign" | "export" | "completed"

export function CreateContractPage({
  onBack,
  onSubmit,
  onGenerateText,
  onEnhance,
  onSign,
  onExport,
  loading,
}: CreateContractPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>("create")
  const [formData, setFormData] = useState<NDAContractData>({
    effective_date: "",
    disclosing_party: "",
    disclosing_party_address: "",
    receiving_party: "",
    receiving_party_address: "",
    purpose: "",
    confidential_info: "",
    term: "",
    governing_law: "",
    signature_date: "",
  })
  const [needsReview, setNeedsReview] = useState(true)
  const [createdContract, setCreatedContract] = useState<Contract | null>(null)
  const [generatedText, setGeneratedText] = useState<string>("")
  const [enhancedText, setEnhancedText] = useState<string>("")
  type EnhancementType = "enhance" | "correct" | "translate"
const [enhancementType, setEnhancementType] = useState<EnhancementType>("enhance")

  const [stepLoading, setStepLoading] = useState(false) // Local loading for specific step actions

  const { toast } = useToast()

  const updateFormData = (key: keyof NDAContractData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    return (
      formData.effective_date &&
      formData.disclosing_party &&
      formData.receiving_party &&
      formData.purpose &&
      formData.confidential_info &&
      formData.term &&
      formData.governing_law
    )
  }

  const handleCreateSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "خطأ في الإدخال",
        description: "الرجاء ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      })
      return
    }

    const contractData: CreateContractRequest = {
      contract_type: "NDA",
      data: formData,
      needs_review: needsReview,
    }

    setStepLoading(true)
    try {
      const newContract = await onSubmit(contractData)
      if (newContract) {
        setCreatedContract(newContract)
        toast({
          title: "تم إنشاء العقد بنجاح",
          description: `تم إنشاء العقد رقم ${newContract.id}`,
        })
        setCurrentStep("generate")
      }
    } catch (error) {
      toast({
        title: "خطأ في إنشاء العقد",
        description: "حدث خطأ أثناء إنشاء العقد" + error,
        variant: "destructive",
      })
    } finally {
      setStepLoading(false)
    }
  }

  const handleGenerateContractText = async () => {
    if (!createdContract) return

    setStepLoading(true)
    try {
      const result = await onGenerateText(createdContract.id) // Now expects an object
      if (result && result.full_text) {
        setGeneratedText(result.full_text)
        setEnhancedText(result.full_text) // Initialize enhanced text with generated text
        toast({
          title: "تم توليد نص العقد",
          description: "تم توليد نص العقد بنجاح.",
        })
        setCurrentStep("enhance")
      } else {
        toast({
          title: "خطأ في توليد النص",
          description: "فشل توليد نص العقد أو النص فارغ.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في توليد النص",
        description: "حدث خطأ أثناء توليد نص العقد." + error, 
        variant: "destructive",
      })
    } finally {
      setStepLoading(false)
    }
  }

  const handleEnhanceContract = async () => {
    if (!createdContract || !generatedText) return

    setStepLoading(true)
    try {
      const result = await onEnhance(createdContract.id, enhancementType)
      if (result) {
        setEnhancedText(result.full_text)
        toast({
          title: "تم تحسين العقد",
          description: `تم ${enhancementType === "enhance" ? "تحسين" : enhancementType === "correct" ? "تصحيح" : "ترجمة"} نص العقد بنجاح.`,
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في التحسين",
        description: "حدث خطأ أثناء تحسين العقد." + error,
        variant: "destructive",
      })
    } finally {
      setStepLoading(false)
    }
  }

  const handleSignContract = async () => {
    if (!createdContract) return

    setStepLoading(true)
    try {
      const result = await onSign(createdContract.id) // Now expects ContractSignature | null
      if (result) {
        // Check if result is not null
        toast({
          title: "تم توقيع العقد",
          description: "تم توقيع العقد بنجاح.",
        })
        setCurrentStep("export")
      } else {
        toast({
          title: "خطأ في التوقيع",
          description: "فشل توقيع العقد.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في التوقيع",
        description: "حدث خطأ أثناء توقيع العقد." + error,
        variant: "destructive",
      })
    } finally {
      setStepLoading(false)
    }
  }

  const handleExportContract = async (format: "pdf" | "docx") => {
    if (!createdContract) return

    setStepLoading(true)
    try {
      const success = await onExport(createdContract.id, format)
      if (success) {
        toast({
          title: "تم تحميل العقد",
          description: `تم تحميل العقد بصيغة ${format.toUpperCase()}.`,
        })
        setCurrentStep("completed")
      }
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير العقد." + error,
        variant: "destructive",
      })
    } finally {
      setStepLoading(false)
    }
  }

  const renderContent = () => {
    switch (currentStep) {
      case "create":
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  تفاصيل اتفاقية عدم الإفشاء
                </CardTitle>
                <CardDescription>أدخل جميع التفاصيل المطلوبة لاتفاقية عدم الإفشاء</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="effective_date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاريخ السريان *
                    </Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => updateFormData("effective_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disclosing_party" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      الطرف المفصح *
                    </Label>
                    <Input
                      id="disclosing_party"
                      value={formData.disclosing_party}
                      onChange={(e) => updateFormData("disclosing_party", e.target.value)}
                      placeholder="أدخل اسم الطرف المفصح"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disclosing_party_address" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    عنوان الطرف المفصح
                  </Label>
                  <Input
                    id="disclosing_party_address"
                    value={formData.disclosing_party_address}
                    onChange={(e) => updateFormData("disclosing_party_address", e.target.value)}
                    placeholder="أدخل عنوان الطرف المفصح"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="receiving_party" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      الطرف المستلم *
                    </Label>
                    <Input
                      id="receiving_party"
                      value={formData.receiving_party}
                      onChange={(e) => updateFormData("receiving_party", e.target.value)}
                      placeholder="أدخل اسم الطرف المستلم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiving_party_address" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      عنوان الطرف المستلم
                    </Label>
                    <Input
                      id="receiving_party_address"
                      value={formData.receiving_party_address}
                      onChange={(e) => updateFormData("receiving_party_address", e.target.value)}
                      placeholder="أدخل عنوان الطرف المستلم"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    الغرض *
                  </Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => updateFormData("purpose", e.target.value)}
                    placeholder="أدخل الغرض من اتفاقية عدم الإفشاء"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidential_info" className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    المعلومات السرية *
                  </Label>
                  <Textarea
                    id="confidential_info"
                    value={formData.confidential_info}
                    onChange={(e) => updateFormData("confidential_info", e.target.value)}
                    placeholder="صف المعلومات السرية التي سيتم الكشف عنها"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="term" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      مدة الاتفاقية (بالسنوات أو الوصف) *
                    </Label>
                    <Input
                      id="term"
                      value={formData.term}
                      onChange={(e) => updateFormData("term", e.target.value)}
                      placeholder="أدخل المدة (مثال: 5 سنوات، حتى انتهاء المشروع)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="governing_law" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      القانون الحاكم *
                    </Label>
                    <Input
                      id="governing_law"
                      value={formData.governing_law}
                      onChange={(e) => updateFormData("governing_law", e.target.value)}
                      placeholder="أدخل القانون الحاكم (مثال: قوانين المملكة العربية السعودية)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ التوقيع
                  </Label>
                  <Input
                    id="signature_date"
                    type="date"
                    value={formData.signature_date}
                    onChange={(e) => updateFormData("signature_date", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  إعدادات المراجعة
                </CardTitle>
                <CardDescription>حدد ما إذا كانت الاتفاقية تحتاج إلى مراجعة قانونية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_review"
                    checked={needsReview}
                    onCheckedChange={(checked) => setNeedsReview(checked as boolean)}
                  />
                  <Label
                    htmlFor="needs_review"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    تحتاج مراجعة من محامي
                  </Label>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {needsReview
                      ? "سيتم إرسال الاتفاقية للمراجعة القانونية قبل التوقيع النهائي"
                      : "سيتم إنشاء الاتفاقية مباشرة بدون مراجعة قانونية"}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  ملخص الاتفاقية
                </CardTitle>
                <CardDescription>مراجعة تفاصيل الاتفاقية قبل الإنشاء</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">نوع العقد:</span>
                  <Badge variant="outline">اتفاقية عدم إفشاء</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">تفاصيل الاتفاقية:</h4>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    {Object.entries(formData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-medium">تحتاج مراجعة:</span>
                  <Badge variant={needsReview ? "default" : "secondary"}>{needsReview ? "نعم" : "لا"}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleCreateSubmit} disabled={stepLoading || !validateForm()}>
                {stepLoading ? "جاري الإنشاء..." : "إنشاء الاتفاقية"}
              </Button>
            </div>
          </>
        )
      case "generate":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                توليد نص العقد
              </CardTitle>
              <CardDescription>قم بتوليد نص اتفاقية عدم الإفشاء بناءً على التفاصيل المدخلة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stepLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">جاري توليد النص...</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground">اضغط على الزر أدناه لتوليد نص اتفاقية عدم الإفشاء.</p>
                  <Button onClick={handleGenerateContractText} disabled={stepLoading || !createdContract}>
                    توليد نص العقد
                  </Button>
                  {generatedText && (
                    <div className="space-y-2">
                      <Label>النص المولد:</Label>
                      <Textarea value={generatedText} readOnly className="min-h-[200px]" />
                    </div>
                  )}
                </>
              )}
              {generatedText && (
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep("enhance")}>التالي: تحسين النص</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      case "enhance":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                تحسين/تصحيح/ترجمة العقد
              </CardTitle>
              <CardDescription>قم بتحسين، تصحيح، أو ترجمة نص العقد باستخدام الذكاء الاصطناعي.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enhancement_type">نوع التحسين</Label>
                <Select value={enhancementType}
                 onValueChange={(value: string) => setEnhancementType(value as EnhancementType)}
                 >
                  <SelectTrigger id="enhancement_type">
                    <SelectValue placeholder="اختر نوع التحسين" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhance">تحسين الصياغة</SelectItem>
                    <SelectItem value="correct">تصحيح الأخطاء</SelectItem>
                    <SelectItem value="translate">ترجمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleEnhanceContract}
                disabled={stepLoading || !createdContract || !generatedText}
                className="w-full"
              >
                {stepLoading ? "جاري المعالجة..." : "تطبيق التحسين"}
              </Button>
              {enhancedText && (
                <div className="space-y-2">
                  <Label>النص المحسن:</Label>
                  <Textarea value={enhancedText} readOnly className="min-h-[200px]" />
                </div>
              )}
              <div className="flex justify-between mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep("generate")}>
                  السابق
                </Button>
                <Button onClick={() => setCurrentStep("sign")} disabled={!enhancedText}>
                  التالي: توقيع العقد
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case "sign":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                توقيع العقد
              </CardTitle>
              <CardDescription>راجع النص النهائي للعقد وقم بتوقيعه.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نص العقد النهائي:</Label>
                <Textarea value={enhancedText || generatedText} readOnly className="min-h-[300px]" />
              </div>
              <Button onClick={handleSignContract} disabled={stepLoading || !createdContract}>
                {stepLoading ? "جاري التوقيع..." : "توقيع العقد"}
              </Button>
              <div className="flex justify-between mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep("enhance")}>
                  السابق
                </Button>
                <Button onClick={() => setCurrentStep("export")} disabled={!createdContract?.is_locked}>
                  التالي: تصدير العقد
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case "export":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                تصدير العقد
              </CardTitle>
              <CardDescription>اختر الصيغة التي ترغب في تصدير العقد بها.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handleExportContract("pdf")} disabled={stepLoading || !createdContract}>
                  {stepLoading ? "جاري التصدير..." : "تصدير PDF"}
                </Button>
                <Button onClick={() => handleExportContract("docx")} disabled={stepLoading || !createdContract}>
                  {stepLoading ? "جاري التصدير..." : "تصدير Word"}
                </Button>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="secondary" onClick={() => setCurrentStep("sign")}>
                  السابق
                </Button>
                <Button onClick={() => onBack()}>العودة إلى قائمة العقود</Button>
              </div>
            </CardContent>
          </Card>
        )
      case "completed":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                تم إكمال العقد بنجاح!
              </CardTitle>
              <CardDescription>لقد أكملت جميع خطوات إنشاء العقد وتصديره.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>يمكنك الآن العودة إلى قائمة العقود أو إنشاء عقد جديد.</p>
              <div className="flex gap-2">
                <Button onClick={() => onBack()}>العودة إلى قائمة العقود</Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">إنشاء اتفاقية عدم إفشاء جديدة</h1>
            <p className="text-muted-foreground">
              {currentStep === "create" && "قم بإنشاء اتفاقية عدم إفشاء ذكية بتفاصيل شاملة"}
              {currentStep === "generate" && "توليد نص العقد"}
              {currentStep === "enhance" && "تحسين وتصحيح وترجمة نص العقد"}
              {currentStep === "sign" && "توقيع العقد إلكترونياً"}
              {currentStep === "export" && "تصدير العقد بصيغ مختلفة"}
              {currentStep === "completed" && "تم الانتهاء من العقد"}
            </p>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  )
}
