"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Contract, EnhanceContractResponse } from "@/types/contracts"
import { ArrowLeft, Sparkles } from "lucide-react"

interface ContractEnhanceViewProps {
  contract: Contract
  enhancedText: string
  enhancementType: "enhance" 
  setEnhancementType: (type: "enhance" ) => void
  onEnhance: (id: number, type: "enhance" ) => Promise<EnhanceContractResponse | null> // Corrected return type
  loading: boolean
  onBack: () => void
}

export function ContractEnhanceView({
  contract,
  enhancedText,
  enhancementType,
  setEnhancementType,
  onEnhance,
  loading,
  onBack,
}: ContractEnhanceViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تحسين العقد #{contract.id}</h1>
            <p className="text-muted-foreground">قم بتحسين نص العقد باستخدام الذكاء الاصطناعي.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            خيارات التحسين
          </CardTitle>
          <CardDescription className="text-slate-600">
            اختر نوع التحسين الذي ترغب في تطبيقه على نص العقد.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enhancement_type">نوع التحسين</Label>
            <Select value={enhancementType} onValueChange={setEnhancementType}>
              <SelectTrigger id="enhancement_type">
                <SelectValue placeholder="اختر نوع التحسين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enhance">تحسين الصياغة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => onEnhance(contract.id, enhancementType)}
            disabled={loading || !contract.full_text}
            className="w-full"
          >
            {loading ? "جاري المعالجة..." : "تطبيق التحسين"}
          </Button>
          {enhancedText && (
            <div className="space-y-2">
              <Label>النص المحسن:</Label>
              <Textarea value={enhancedText} readOnly className="min-h-[200px]" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
