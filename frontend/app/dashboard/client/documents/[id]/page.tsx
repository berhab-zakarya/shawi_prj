'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  ExternalLink,
  Brain,
  BarChart3,
  Clock,
  Hash,
  Eye,
  Sparkles,
  TrendingUp,
  FileCheck,
  Activity,
  Zap,
  Target,
  Info
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useDocumentsAPI } from '@/hooks/useDocumentsAPI'
import type { Document, AnalysisResult } from "@/types/documents"

const DocumentViewPage = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { 
    loading, 
        loadingAnalyze:isAnalyzing,
    errorGlobal, 
    getDocument, 
    analyzeDocument,
  } = useDocumentsAPI()
  
  const [document, setDocument] = useState<Document | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null)
  
  const documentId = Number(pathname.split('/').pop())

  useEffect(() => {
    const fetchDocument = async () => {
      if (documentId) {
        const doc = await getDocument(documentId)
        if (doc) {
          setDocument(doc)
          // Reverse the order of analyses - newest first
          setAnalyses((doc.analyses || []).reverse())
        }
      }
    }
    
    fetchDocument()
  }, [documentId, getDocument])

  const handleDownload = async () => {
    if (!document) return
    
    setIsDownloading(true)
    try {
      if (document.file) {
        window.open(document.file, '_blank')
      } else {
        console.log('Download document:', document.file)
      }
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!document) return
    
    try {
      const newAnalysis = await analyzeDocument(document.id)
      if (newAnalysis) {
        // Add new analysis at the beginning (newest first)
        setAnalyses(prev => [newAnalysis, ...prev])
        setExpandedAnalysis(newAnalysis.id)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    } 
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄'
      case 'DOCX': return '📝'
      case 'TXT': return '📃'
      default: return '📄'
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'PDF': return 'مستند PDF'
      case 'DOCX': return 'مستند Word'
      case 'TXT': return 'ملف نصي'
      default: return 'مستند'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600'
    if (score >= 0.6) return 'text-amber-600'
    return 'text-red-500'
  }

  const getConfidenceBg = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-50 border-emerald-200'
    if (score >= 0.6) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'عالية'
    if (score >= 0.6) return 'متوسطة'
    return 'منخفضة'
  }

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500'
    if (score >= 0.6) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'اليوم'
    if (diffDays === 2) return 'أمس'
    if (diffDays <= 7) return `منذ ${diffDays} أيام`
    return date.toLocaleDateString('ar-SA')
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-12 w-96" />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </CardHeader>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorGlobal) {
    return (
      <div className="min-h-screen  py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/client/documents')}
            className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى الوثائق
          </Button>
          
          <Alert className="border-red-200 bg-red-50 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 text-base">
              {errorGlobal.detail || errorGlobal.error || 'حدث خطأ في تحميل الوثيقة'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen  py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/client/documents')}
            className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى الوثائق
          </Button>
          
          <Alert className="shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              لم يتم العثور على الوثيقة المطلوبة
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/client/documents')}
            className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة إلى الوثائق
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                عرض الوثيقة
              </h1>
              <p className="text-slate-600 text-lg">
                استعراض وتحليل محتوى الوثيقة
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-md"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent ml-2"></div>
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 ml-2" />
                    تحليل ذكي
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-primary shadow-md transition-all duration-200"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 ml-2" />
                    تحميل الوثيقة
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Enhanced Document Header Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2  rounded-lg">
                        <FileText className="w-6 h-6 " />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-slate-900 mb-1">
                          {document.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>رفع بواسطة: {document.uploaded_by}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(document.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="   px-3 py-1">
                    <span className="ml-2 text-lg">{getDocumentTypeIcon(document.document_type)}</span>
                    {getDocumentTypeName(document.document_type)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Enhanced Document File Info */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  معلومات الملف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600 font-medium">اسم الملف:</span>
                      <span className="text-sm font-semibold text-slate-900">{document.file}</span>
                    </div>
                    
                    {document.file_path && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600 font-medium">مسار الملف:</span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">
                          {document.file_path}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {document.file_url && (
                    <div className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <Button 
                        variant="ghost" 
                        onClick={() => window.open(document.file_url!, '_blank')}
                        className="transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض الملف الأصلي
                        <ExternalLink className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Analyses Section */}
            {analyses.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    نتائج التحليل الذكي
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                      {analyses.length} تحليل
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyses.map((analysis, index) => (
                      <div 
                        key={analysis.id} 
                        className={`border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-md ${
                          expandedAnalysis === analysis.id ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Badge className="bg-emerald-500 text-white px-2 py-1 text-xs">
                                  الأحدث
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                                {analysis.analysis_type}
                              </Badge>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getConfidenceBg(analysis.confidence_score)}`}>
                              <Target className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                الثقة: 
                                <span className={`ml-1 ${getConfidenceColor(analysis.confidence_score)}`}>
                                  {getConfidenceText(analysis.confidence_score)} 
                                  ({Math.round(analysis.confidence_score * 100)}%)
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {formatDate(analysis.created_at)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedAnalysis(
                                expandedAnalysis === analysis.id ? null : analysis.id
                              )}
                              className="text-purple-600 hover:bg-purple-100"
                            >
                              {expandedAnalysis === analysis.id ? 'إخفاء' : 'عرض'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">مستوى الثقة</span>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={analysis.confidence_score * 100} 
                              className="h-3 bg-slate-200"
                            />
                            <div 
                              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(analysis.confidence_score)}`}
                              style={{ width: `${analysis.confidence_score * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        {(expandedAnalysis === analysis.id || index === 0) && (
                          <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold text-slate-900 mb-3 mt-4 first:mt-0 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-purple-600" />
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-semibold text-slate-900 mb-2 mt-3 first:mt-0 flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-purple-500" />
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-medium text-slate-900 mb-2 mt-2 first:mt-0">{children}</h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-sm text-slate-700 mb-3 last:mb-0 leading-relaxed">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="text-sm text-slate-700 mb-3 pr-4 list-disc space-y-1 bg-slate-50 p-3 rounded-lg">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="text-sm text-slate-700 mb-3 pr-4 list-decimal space-y-1 bg-slate-50 p-3 rounded-lg">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm text-slate-700">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-slate-900 bg-yellow-100 px-1 rounded">{children}</strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-slate-800">{children}</em>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">{children}</code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-slate-100 p-4 rounded-lg text-xs font-mono text-slate-800 overflow-x-auto mb-3 border border-slate-200">{children}</pre>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-r-4 border-blue-300 pr-4 py-2 bg-blue-50 text-sm text-slate-700 italic mb-3 rounded-lg">{children}</blockquote>
                                ),
                                hr: () => (
                                  <hr className="border-slate-200 my-4" />
                                ),
                                a: ({ href, children }) => (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {analysis.analysis_text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No analyses message */}
            {analyses.length === 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
                    <Brain className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد تحليلات بعد</h3>
                  <p className="text-slate-600 mb-6">ابدأ بتحليل هذه الوثيقة للحصول على رؤى ذكية حول محتواها</p>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700 shadow-md"
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    بدء التحليل الذكي
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Document Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <div className="p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  إحصائيات الوثيقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600 font-medium">معرف الوثيقة</span>
                    </div>
                    <Badge variant="outline" className="font-mono">#{document.id}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600 font-medium">عدد التحليلات</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                      {analyses.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600 font-medium">تاريخ الرفع</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {formatDate(document.uploaded_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  الإجراءات السريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    {isAnalyzing ? 'جاري التحليل...' : 'تحليل ذكي جديد'}
                  </Button>
                  
                  <Button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full shadow-md transition-all duration-200"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    {isDownloading ? 'جاري التحميل...' : 'تحميل الملف'}
                  </Button>
                  
                  {document.file_url && (
                    <Button 
                      onClick={() => window.open(document.file_url!, '_blank')}
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض الملف الأصلي
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Summary */}
            {analyses.length > 0 && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    ملخص التحليل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {Math.round((analyses.reduce((sum, a) => sum + a.confidence_score, 0) / analyses.length) * 100)}%
                      </div>
                      <div className="text-sm text-slate-600">متوسط الثقة العام</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">تحليلات عالية الثقة</span>
                        <span className="font-medium text-emerald-600">
                          {analyses.filter(a => a.confidence_score >= 0.8).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">تحليلات متوسطة الثقة</span>
                        <span className="font-medium text-amber-600">
                          {analyses.filter(a => a.confidence_score >= 0.6 && a.confidence_score < 0.8).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">تحليلات منخفضة الثقة</span>
                        <span className="font-medium text-red-500">
                          {analyses.filter(a => a.confidence_score < 0.6).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Info Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <div className="p-2-100 rounded-lg">
                    <Info className="w-5 h-5 " />
                  </div>
                  نصائح مفيدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2  rounded-full mt-2 flex-shrink-0"></div>
                    <span>يمكنك إجراء تحليلات متعددة لنفس الوثيقة للحصول على رؤى أعمق</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2  rounded-full mt-2 flex-shrink-0"></div>
                    <span>التحليلات الأحدث تظهر في الأعلى لسهولة الوصول</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2  rounded-full mt-2 flex-shrink-0"></div>
                    <span>انقر على عرض لتوسيع نتائج التحليل والاطلاع على التفاصيل</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewPage