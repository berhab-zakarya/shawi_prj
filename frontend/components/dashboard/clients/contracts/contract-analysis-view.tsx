"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Contract } from "@/types/contracts"
import { ArrowLeft, Brain } from "lucide-react"

interface ContractAnalysisViewProps {
  contract: Contract
  analysisResult: string
  loading: boolean
  onBack: () => void
}

export function ContractAnalysisView({ contract, analysisResult, loading, onBack }: ContractAnalysisViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تحليل العقد #{contract.id}</h1>
            <p className="text-muted-foreground">تحليل شامل للعقد مع اقتراحات للتحسين وتحديد المخاطر المحتملة</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 " />
            </div>
            نتائج التحليل بالذكاء الاصطناعي
          </CardTitle>
          <CardDescription className="text-slate-600">
            تحليل شامل للعقد مع اقتراحات للتحسين وتحديد المخاطر المحتملة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-slate-700 font-semibold">نتائج التحليل:</Label>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 font-medium">جاري تحليل العقد...</p>
              </div>
            </div>
          ) : (
            <Textarea
              value={analysisResult}
              readOnly
              className="min-h-[300px] border-slate-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl bg-slate-50"
              placeholder="سيظهر تحليل العقد هنا..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
