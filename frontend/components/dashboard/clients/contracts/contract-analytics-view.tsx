"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { ContractAnalytics } from "@/types/contracts"
import { ArrowLeft, Download, TrendingUp } from "lucide-react"

interface ContractAnalyticsViewProps {
  analyticsData: ContractAnalytics | null
  loading: boolean
  onExportCsv: (exportCsv: boolean) => Promise<boolean | null | ContractAnalytics>
  onBack: () => void
}

export function ContractAnalyticsView({ analyticsData, loading, onExportCsv, onBack }: ContractAnalyticsViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تحليلات العقود</h1>
            <p className="text-muted-foreground">نظرة عامة على إحصائيات العقود وأنواعها وحالاتها.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            إحصائيات العقود
          </CardTitle>
          <CardDescription className="text-slate-600">
            رسوم بيانية توضيحية لتوزيع العقود ومتوسط وقت المراجعة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 font-medium">جاري تحميل التحليلات...</p>
              </div>
            </div>
          ) : analyticsData ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع أنواع العقود</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={analyticsData.type_counts.reduce(
                        (acc, item, index) => ({
                          ...acc,
                          [`type${index}`]: {
                            label: item.contract_type,
                            color: `hsl(var(--chart-${index + 1}))`,
                          },
                        }),
                        {},
                      )}
                      className="aspect-video h-[200px]"
                    >
                      <BarChart data={analyticsData.type_counts}>
                        <XAxis dataKey="contract_type" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {analyticsData.type_counts.map((item, index) => (
                          <Bar
                            key={item.contract_type}
                            dataKey="count"
                            fill={`hsl(var(--chart-${index + 1}))`}
                            radius={8}
                          />
                        ))}
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع حالات العقود</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={analyticsData.status_counts.reduce(
                        (acc, item, index) => ({
                          ...acc,
                          [`status${index}`]: { label: item.status, color: `hsl(var(--chart-${index + 1}))` },
                        }),
                        {},
                      )}
                      className="aspect-video h-[200px]"
                    >
                      <BarChart data={analyticsData.status_counts}>
                        <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {analyticsData.status_counts.map((item, index) => (
                          <Bar key={item.status} dataKey="count" fill={`hsl(var(--chart-${index + 1}))`} radius={8} />
                        ))}
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>متوسط وقت المراجعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-center text-blue-700">
                    {analyticsData.average_review_time_days?.toFixed(2) || "N/A"} أيام
                  </p>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={() => onExportCsv(true)} disabled={loading}>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير كـ CSV
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">لا توجد بيانات تحليلات متاحة.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
