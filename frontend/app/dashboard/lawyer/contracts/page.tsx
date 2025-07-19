"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Contract, ContractSignature, SignatureVerification } from "@/types/contracts"
import {
  Search,
  FileText,
  Eye,
  AlertCircle,
  Download,
  PenTool,
  Brain,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Scale,
  Shield,
  ShieldCheck,
  Server,
  Verified,
  Copy,
  RefreshCw,
  MoreVertical,
  Star,
  Calendar,
  User,
  Building,
  ChevronRight,
  Activity,
  Target,
  Briefcase,
  Globe,
  FilePenLine,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useContracts } from "@/hooks/useContracts"

export default function EnhancedLawyerDashboard() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showSignatures, setShowSignatures] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED" | "PENDING">("PENDING")
  const [reviewNotes, setReviewNotes] = useState("")
  const [contractSignatures, setContractSignatures] = useState<ContractSignature[]>([])
  const [verificationResult, setVerificationResult] = useState<SignatureVerification  | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  const {
    contracts,
    analytics,
    loading,
    errorMessage,
    getContractDetails,
    signContract,
    exportContract,
    analyzeContract,
    getContractAnalytics,
    reviewContract,
    verifySignature,
    verifySignatureLocally,
    getContractSignatures,
  } = useContracts()

  useEffect(() => {
    getContractAnalytics()
  }, [])

  const assignedContracts = contracts.filter((contract) =>
    ["UNDER_REVIEW", "APPROVED", "REJECTED", "SIGNED_BY_CLIENT", "SIGNED_BY_LAWYER", "COMPLETED"].includes(
      contract.status,
    ),
  )

  const filteredContracts = assignedContracts.filter((contract) => {
    const matchesSearch =
      contract.contract_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const uniqueContracts = Array.from(
  new Map(filteredContracts.map((contract) => [contract.id, contract])).values()
);

  const handleContractClick = async (contract: Contract) => {
    const details = await getContractDetails(contract.id)
    if (details) {
      setSelectedContract(details)
      setShowDetails(true)
    }
  }

  const handleQuickAction = async (action: string, contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation()
    
    switch (action) {
      case "review":
        setSelectedContract(contract)
        setShowReviewModal(true)
        break
      case "sign":
        await handleSignContract(contract.id)
        break
      case "signatures":
        await handleViewSignatures(contract.id)
        break
     
      case "verify":
        await handleVerifySignatureLocal(contract.id)
        break
      case "export-pdf":
        await handleExportContract(contract.id, "pdf")
        break
      case "export-docx":
        await handleExportContract(contract.id, "docx")
        break
    }
  }

  const handleReviewContract = async (id: number) => {
    if (!selectedContract || !reviewStatus || !reviewNotes.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    const result = await reviewContract(id, reviewStatus, reviewNotes)
    if (result) {
      toast({
        title: reviewStatus === "APPROVED" ? "تم قبول العقد" : reviewStatus === "REJECTED" ? "تم رفض العقد" : "تم تحديث المراجعة",
        description: `تم ${reviewStatus === "APPROVED" ? "قبول" : reviewStatus === "REJECTED" ? "رفض" : "تسجيل"} العقد رقم ${selectedContract.id}`,
      })
      setShowReviewModal(false)
      setReviewNotes("")
      setReviewStatus("PENDING")
    }
  }

  const handleSignContract = async (id: number) => {
    const result = await signContract(id)
    if (result) {
      toast({
        title: "تم توقيع العقد",
        description: "تم توقيع العقد بنجاح",
      })
      const details = await getContractDetails(id)
      if (details) {
        setSelectedContract(details)
      }
    }
  }

  const handleExportContract = async (id: number, format: "pdf" | "docx") => {
    const success = await exportContract(id, format)
    if (success) {
      toast({
        title: "تم تحميل العقد",
        description: `تم تحميل العقد بصيغة ${format.toUpperCase()}`,
      })
    }
  }

  // const handleAnalyzeContract = async (id: number) => {
  //   setAnalysisLoading(true)
  //   const result = await analyzeContract(id)
  //   if (result) {
  //     setAnalysisResult(result.analysis)
  //     setShowAnalysis(true)
  //   }
  //   setAnalysisLoading(false)
  // }

  const handleViewSignatures = async (contractId: number) => {
    const signatures = await getContractSignatures(contractId)
    setContractSignatures(signatures)
    setShowSignatures(true)
  }

  const handleVerifySignatureServer = async (signatureId: number) => {
    setVerifyLoading(true)
    const result = await verifySignature(signatureId)
    if (result) {
      setVerificationResult(result)
      toast({
        title: "تم التحقق من التوقيع",
        description: `حالة التوقيع: ${result.status === "valid" ? "صالح" : "غير صالح"}`,
        variant: result.status === "valid" ? "default" : "destructive",
      })
    }
    setVerifyLoading(false)
  }

  const handleVerifySignatureLocal = async (contractId: number) => {
    if (!selectedContract) return

    const result = await verifySignatureLocally(contractId, selectedContract.full_text || selectedContract.text_version)
    if (result) {
      toast({
        title: "التحقق المحلي من التوقيع",
        description: result.details,
        variant: result.isValid ? "default" : "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة",
    })
  }

  const getStatusBadge = (contract: Contract) => {
    const statusConfig = {
      DRAFT: { label: "مسودة", variant: "secondary" as const, color: "bg-slate-100 text-slate-700" },
      UNDER_REVIEW: { label: "قيد المراجعة", variant: "outline" as const, color: "bg-amber-100 text-amber-700" },
      APPROVED: { label: "موافق عليه", variant: "default" as const, color: "bg-emerald-100 text-emerald-700" },
      REJECTED: { label: "مرفوض", variant: "destructive" as const, color: "bg-red-100 text-red-700" },
      SIGNED_BY_CLIENT: { label: "موقع من العميل", variant: "secondary" as const, color: "bg-blue-100 text-blue-700" },
      SIGNED_BY_LAWYER: { label: "موقع من المحامي", variant: "outline" as const, color: "bg-purple-100 text-purple-700" },
      COMPLETED: { label: "مكتمل", variant: "default" as const, color: "bg-green-100 text-green-700" },
      EXPORTED: { label: "تم التصدير", variant: "secondary" as const, color: "bg-indigo-100 text-indigo-700" },
    }

    const config = statusConfig[contract.status] || statusConfig.DRAFT
    return (
      <Badge className={`${config.color} border-0 font-medium`}>
        {config.label}
      </Badge>
    )
  }

  const getContractTypeLabel = (type: string | null) => {
    const typeMap: Record<string, string> = {
      EMPLOYMENT: "عقد عمل",
      NDA: "اتفاقية عدم إفشاء",
      SERVICE_AGREEMENT: "اتفاقية خدمة",
      CONSULTING: "عقد استشارة",
    }
    return typeMap[type || ""] || type || "غير محدد"
  }

  const getContractsByStatus = () => {
    return {
      underReview: assignedContracts.filter((c) => c.status === "UNDER_REVIEW"),
      approved: assignedContracts.filter((c) => c.status === "APPROVED"),
      rejected: assignedContracts.filter((c) => c.status === "REJECTED"),
      signedByClient: assignedContracts.filter((c) => c.status === "SIGNED_BY_CLIENT"),
      signedByLawyer: assignedContracts.filter((c) => c.status === "SIGNED_BY_LAWYER"),
      completed: assignedContracts.filter((c) => c.status === "COMPLETED"),
    }
  }

  const contractsByStatus = getContractsByStatus()

  const getPriorityLevel = (contract: Contract) => {
    if (contract.status === "UNDER_REVIEW") return "high"
    if (contract.status === "SIGNED_BY_CLIENT") return "medium"
    return "low"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "border-r-red-400 bg-red-50",
      medium: "border-r-amber-400 bg-amber-50",
      low: "border-r-green-400 bg-green-50",
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getActionButtons = (contract: Contract) => {
    const actions = []

    if (contract.status === "UNDER_REVIEW") {
      actions.push({ key: "review", label: "مراجعة", icon: MessageSquare, color: "bg-emerald-500 hover:bg-emerald-600" })
    }

    if (["APPROVED", "SIGNED_BY_CLIENT"].includes(contract.status) && !contract.is_locked) {
      actions.push({ key: "sign", label: "توقيع", icon: PenTool, color: "bg-blue-500 hover:bg-blue-600" })
    }

    // actions.push({ key: "signatures", label: "التوقيعات", icon: Signature, color: "bg-purple-500 hover:bg-purple-600" })
    // actions.push({ key: "analyze", label: "تحليل", icon: Brain, color: "bg-indigo-500 hover:bg-indigo-600" })

    return actions
  }

  const ContractCard = ({ contract }: { contract: Contract }) => {
    const priority = getPriorityLevel(contract)
    const actions = getActionButtons(contract)

    return (
      <Card 
        className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-r-4 ${getPriorityColor(priority)} bg-white`}
        onClick={() => handleContractClick(contract)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-lg">عقد #{contract.id}</h3>
                  {priority === "high" && <Star className="w-4 h-4 text-red-500 fill-current" />}
                </div>
                <p className="text-slate-600 font-medium">{getContractTypeLabel(contract.contract_type)}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(contract.created_at).toLocaleDateString("ar-SA")}
                  </div>
                  {contract.data.disclosing_party && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {contract.data.disclosing_party}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              {getStatusBadge(contract)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={(e) => handleQuickAction("export-pdf", contract, e)}>
                    <Download className="w-4 h-4 ml-2" />
                    تحميل PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleQuickAction("export-docx", contract, e)}>
                    <Download className="w-4 h-4 ml-2" />
                    تحميل Word
                  </DropdownMenuItem>
            
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {actions.slice(0, 2).map((action) => (
                <Button
                  key={action.key}
                  size="sm"
                  onClick={(e) => handleQuickAction(action.key, contract, e)}
                  className={`${action.color} text-white rounded-lg transition-all duration-200`}
                >
                  <action.icon className="w-4 h-4 ml-2" />
                  {action.label}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen " dir="rtl">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-amber-400  rounded-3xl p-8  shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">لوحة المحامي</h1>
              <p className="text-white text-xl flex items-center gap-2">
                <Scale className="w-6 h-6" />
                إدارة ومراجعة العقود القانونية
              </p>
              <div className="flex items-center gap-6 mt-4 text-white">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>{assignedContracts.length} عقد مخصص</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{contractsByStatus.underReview.length} يحتاج مراجعة</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Button
                onClick={() => getContractAnalytics(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-xl px-6 py-3"
              >
                <Download className="w-5 h-5 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{contractsByStatus.underReview.length}</div>
                  <p className="text-red-100 text-sm">تحتاج مراجعة</p>
                </div>
              </div>
              <Progress value={(contractsByStatus.underReview.length / assignedContracts.length) * 100} className="bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <PenTool className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{contractsByStatus.signedByClient.length}</div>
                  <p className="text-blue-100 text-sm">للتوقيع</p>
                </div>
              </div>
              <Progress value={(contractsByStatus.signedByClient.length / assignedContracts.length) * 100} className="bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{contractsByStatus.completed.length}</div>
                  <p className="text-green-100 text-sm">مكتملة</p>
                </div>
              </div>
              <Progress value={(contractsByStatus.completed.length / assignedContracts.length) * 100} className="bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{analytics?.average_review_time_days?.toFixed(1) || "0"}</div>
                  <p className="text-purple-100 text-sm">متوسط المراجعة (يوم)</p>
                </div>
              </div>
              <div className="text-xs text-purple-100">معدل الأداء ممتاز</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="البحث في العقود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl">
                  <Filter className="h-5 w-5 text-slate-600" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm min-w-[150px]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="UNDER_REVIEW">قيد المراجعة</option>
                  <option value="APPROVED">موافق عليه</option>
                  <option value="REJECTED">مرفوض</option>
                  <option value="SIGNED_BY_CLIENT">موقع من العميل</option>
                  <option value="SIGNED_BY_LAWYER">موقع من المحامي</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-0 h-14">
            <TabsTrigger
              value="dashboard"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              <Briefcase className="w-4 h-4 ml-2" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              <AlertTriangle className="w-4 h-4 ml-2" />
              للمراجعة ({contractsByStatus.underReview.length})
            </TabsTrigger>
            <TabsTrigger
              value="signing"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              <PenTool className="w-4 h-4 ml-2" />
              للتوقيع ({contractsByStatus.signedByClient.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              <FileCheck className="w-4 h-4 ml-2" />
              مكتملة ({contractsByStatus.completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <div className="grid gap-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Globe className="w-6 h-6 text-blue-600" />
                    نظرة عامة على العقود
                  </CardTitle>
                  <CardDescription>جميع العقود المخصصة لك مع إمكانية الوصول السريع</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600 font-medium">جاري التحميل...</p>
                      </div>
                    </div>
                  ) : uniqueContracts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                        <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد عقود</h3>
                      <p className="text-slate-500">لم يتم العثور على عقود تطابق معايير البحث</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {uniqueContracts.map((contract) => (
                        <ContractCard key={contract.id} contract={contract} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="review" className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  العقود التي تحتاج مراجعة
                </CardTitle>
                <CardDescription className="text-slate-600">
                  العقود المخصصة لك والتي تحتاج إلى مراجعة قانونية فورية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {contractsByStatus.underReview.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">ممتاز! لا توجد عقود للمراجعة</h3>
                    <p className="text-slate-500">جميع العقود المخصصة تمت مراجعتها</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contractsByStatus.underReview.map((contract) => (
                      <ContractCard key={contract.id} contract={contract} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signing" className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                  <PenTool className="w-6 h-6 text-blue-600" />
                  العقود في انتظار التوقيع
                </CardTitle>
                <CardDescription className="text-slate-600">
                  العقود الموقعة من العميل والتي تحتاج توقيعك لإتمام العملية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {contractsByStatus.signedByClient.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                      <FileCheck className="mx-auto h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد عقود للتوقيع</h3>
                    <p className="text-slate-500">لا توجد عقود في انتظار توقيعك حالياً</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contractsByStatus.signedByClient.map((contract) => (
                      <ContractCard key={contract.id} contract={contract} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                  <FileCheck className="w-6 h-6 text-green-600" />
                  العقود المكتملة
                </CardTitle>
                <CardDescription className="text-slate-600">العقود التي تم توقيعها من الطرفين وإتمامها بنجاح</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {contractsByStatus.completed.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                      <FileCheck className="mx-auto h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد عقود مكتملة</h3>
                    <p className="text-slate-500">لم يتم إكمال أي عقود بعد</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contractsByStatus.completed.map((contract) => (
                      <ContractCard key={contract.id} contract={contract} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Contract Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center justify-between text-2xl font-bold text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div>تفاصيل العقد #{selectedContract?.id}</div>
                    <div className="text-sm font-normal text-slate-500 mt-1">
                      {getContractTypeLabel(selectedContract?.contract_type || "")}
                    </div>
                  </div>
                </div>
                {selectedContract && getStatusBadge(selectedContract)}
              </DialogTitle>
              <DialogDescription className="text-slate-600 flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تم الإنشاء في {selectedContract && new Date(selectedContract.created_at).toLocaleDateString("ar-SA")}
                </div>
                {selectedContract?.data.disclosing_party && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {selectedContract.data.disclosing_party}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedContract && (
              <div className="space-y-6 py-6">
                {/* Contract Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 rounded-xl">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        معلومات العقد
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">النوع:</span>
                          <span className="font-medium">{getContractTypeLabel(selectedContract.contract_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">الحالة:</span>
                          <span className="font-medium">{selectedContract.is_locked ? "مقفل" : "نشط"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">يحتاج مراجعة:</span>
                          <span className="font-medium">{selectedContract.needs_review ? "نعم" : "لا"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 rounded-xl">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        أطراف العقد
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600 block">الطرف المفصح:</span>
                          <span className="font-medium">{selectedContract.data.disclosing_party}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block">الطرف المستقبل:</span>
                          <span className="font-medium">{selectedContract.data.receiving_party}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contract Data */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 rounded-xl">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      بيانات العقد التفصيلية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedContract.data).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="text-sm text-slate-600 mb-1">{key}:</div>
                          <div className="font-medium text-slate-800">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Text */}
                {selectedContract.full_text && (
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 rounded-xl">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
                        <FilePenLine className="w-5 h-5" />
                        نص العقد
                      </h4>
                      <ScrollArea className="h-60 w-full">
                        <div
                          className="bg-white p-4 rounded-lg border border-purple-200 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedContract.full_text }}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                  {selectedContract.status === "UNDER_REVIEW" && (
                    <Button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-6 py-3"
                    >
                      <MessageSquare className="w-4 h-4 ml-2" />
                      مراجعة العقد
                    </Button>
                  )}

                  {["APPROVED", "SIGNED_BY_CLIENT"].includes(selectedContract.status) && !selectedContract.is_locked && (
                    <Button
                      onClick={() => handleSignContract(selectedContract.id)}
                      className="bg-gradient-to-r from-primary to-primary hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-3"
                    >
                      <PenTool className="w-4 h-4 ml-2" />
                      توقيع العقد
                    </Button>
                  )}

                  {/* <Button
                    onClick={() => handleViewSignatures(selectedContract.id)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-6 py-3"
                  >
                    <Signature className="w-4 h-4 ml-2" />
                    عرض التوقيعات
                  </Button> */}
{/* 
                  <Button
                    onClick={() => handleAnalyzeContract(selectedContract.id)}
                    disabled={analysisLoading}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
                  >
                    {analysisLoading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 ml-2" />
                    )}
                    تحليل العقد
                  </Button> */}

                  {/* <Button
                    onClick={() => handleVerifySignatureLocal(selectedContract.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-6 py-3"
                  >
                    <Shield className="w-4 h-4 ml-2" />
                    التحقق المحلي
                  </Button> */}

                  {selectedContract.full_text && (
                    <>
                      <Button
                        onClick={() => handleExportContract(selectedContract.id, "pdf")}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-3"
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تحميل PDF
                      </Button>
                      <Button
                        onClick={() => handleExportContract(selectedContract.id, "docx")}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl px-6 py-3"
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تحميل Word
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-3xl bg-white rounded-3xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                </div>
                مراجعة العقد #{selectedContract?.id}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                قم بمراجعة العقد بعناية وتحديد قرارك مع إضافة ملاحظاتك التفصيلية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div>
                <Label className="text-lg font-semibold text-slate-700 mb-4 block">قرار المراجعة</Label>
                <RadioGroup
                  value={reviewStatus}
                  onValueChange={(value) => setReviewStatus(value as "APPROVED" | "REJECTED" | "PENDING")}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors">
                    <RadioGroupItem value="APPROVED" id="approved" className="text-green-600" />
                    <Label htmlFor="approved" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-green-700 font-semibold">موافقة على العقد</div>
                        <div className="text-green-600 text-sm">العقد مطابق للمعايير القانونية</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors">
                    <RadioGroupItem value="REJECTED" id="rejected" className="text-red-600" />
                    <Label htmlFor="rejected" className="flex items-center gap-3 cursor-pointer flex-1">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="text-red-700 font-semibold">رفض العقد</div>
                        <div className="text-red-600 text-sm">العقد يحتاج تعديلات جوهرية</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors">
                    <RadioGroupItem value="PENDING" id="pending" className="text-amber-600" />
                    <Label htmlFor="pending" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-amber-700 font-semibold">يحتاج مراجعة إضافية</div>
                        <div className="text-amber-600 text-sm">العقد يحتاج توضيحات أو تعديلات طفيفة</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="review-notes" className="text-lg font-semibold text-slate-700 mb-2 block">
                  ملاحظات المراجعة *
                </Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك التفصيلية حول العقد، التعديلات المطلوبة، أو أسباب الرفض..."
                  rows={6}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl resize-none"
                />
                <div className="text-sm text-slate-500 mt-2">
                  {reviewNotes.length}/500 حرف
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl px-6 py-3"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => handleReviewContract(selectedContract?.id || 0)}
                disabled={!reviewNotes.trim() || loading}
                className={`rounded-xl px-6 py-3 text-white font-semibold ${
                  reviewStatus === "APPROVED"
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : reviewStatus === "REJECTED"
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : reviewStatus === "APPROVED" ? (
                  <CheckCircle className="w-4 h-4 ml-2" />
                ) : reviewStatus === "REJECTED" ? (
                  <XCircle className="w-4 h-4 ml-2" />
                ) : (
                  <Clock className="w-4 h-4 ml-2" />
                )}
                {reviewStatus === "APPROVED"
                  ? "موافقة على العقد"
                  : reviewStatus === "REJECTED"
                    ? "رفض العقد"
                    : "حفظ المراجعة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced AI Analysis Modal */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="max-w-5xl max-h-[90vh] bg-white rounded-3xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                تحليل العقد بالذكاء الاصطناعي
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                تحليل شامل ومتقدم للعقد مع اقتراحات للتحسين وتحديد المخاطر المحتملة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-slate-700">نتائج التحليل:</Label>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(analysisResult)}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ التحليل
                </Button>
              </div>
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 rounded-xl">
                <CardContent className="p-6">
                  <ScrollArea className="h-[500px] w-full">
                    <div className="prose prose-slate max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
                        {analysisResult || "سيظهر تحليل العقد هنا..."}
                      </pre>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Signatures Modal */}
        <Dialog open={showSignatures} onOpenChange={setShowSignatures}>
          <DialogContent className="max-w-5xl max-h-[90vh] bg-white rounded-3xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <FilePenLine className="w-6 h-6 text-purple-600" />
                </div>
                توقيعات العقد #{selectedContract?.id}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                جميع التوقيعات المرتبطة بهذا العقد مع إمكانية التحقق من صحتها
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {contractSignatures.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                    <FilePenLine className="mx-auto h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد توقيعات</h3>
                  <p className="text-slate-500">لم يتم توقيع هذا العقد بعد</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {contractSignatures.map((signature) => (
                    <Card key={signature.id} className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 rounded-xl hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                              <Verified className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg">توقيع #{signature.id}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  المستخدم: {signature.user}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Globe className="w-4 h-4" />
                                  IP: {signature.ip_address}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className={`px-3 py-1 ${
                            signature.verification_status === "valid"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : signature.verification_status === "invalid"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}>
                            {signature.verification_status === "valid"
                              ? "✓ صالح"
                              : signature.verification_status === "invalid"
                                ? "✗ غير صالح"
                                : "⏳ في الانتظار"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <Label className="text-sm font-semibold text-slate-700 mb-2 block">تاريخ التوقيع</Label>
                            <p className="text-slate-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(signature.signed_at).toLocaleString("ar-SA")}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <Label className="text-sm font-semibold text-slate-700 mb-2 block">هاش التوقيع</Label>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-600 font-mono text-xs truncate flex-1">
                                {signature.signature_hash.substring(0, 30)}...
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(signature.signature_hash)}
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
                          <Label className="text-sm font-semibold text-slate-700 mb-2 block">المفتاح العام</Label>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-600 font-mono text-xs truncate flex-1">
                              {signature.public_key.substring(0, 80)}...
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(signature.public_key)}
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {signature.barcode_svg && (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
                            <Label className="text-sm font-semibold text-slate-700 mb-3 block">رمز التحقق</Label>
                            <div
                              className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit"
                              dangerouslySetInnerHTML={{ __html: signature.barcode_svg }}
                            />
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleVerifySignatureServer(signature.id)}
                            disabled={verifyLoading}
                            className="bg-gradient-to-r from-primary to-primary hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                          >
                            {verifyLoading ? (
                              <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            ) : (
                              <Server className="w-4 h-4 ml-2" />
                            )}
                            التحقق من الخادم
                          </Button>
                         
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Verification Results */}
              {verificationResult && (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 rounded-xl">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-4 text-slate-800 flex items-center gap-2 text-lg">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      نتيجة التحقق التفصيلية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-slate-700">الحالة العامة:</span>
                          <Badge
                            className={`px-3 py-1 ${
                              verificationResult.status === "valid"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {verificationResult.status === "valid" ? "✓ صالح" : "✗ غير صالح"}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">الرسالة:</span>
                            <span className="font-medium">{verificationResult.message}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">موقع من:</span>
                            <span className="font-medium">{verificationResult.signed_by}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-200">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">تاريخ التوقيع:</span>
                            <span className="font-medium">
                              {new Date(verificationResult.signed_at).toLocaleString("ar-SA")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">رقم العقد:</span>
                            <span className="font-medium">#{verificationResult.contract_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">رقم التوقيع:</span>
                            <span className="font-medium">#{verificationResult.signature_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {verificationResult.verification_details && (
                      <div className="mt-4 bg-white p-4 rounded-xl border border-blue-200">
                        <h5 className="font-semibold text-slate-700 mb-3">تفاصيل التحقق الفنية:</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>صحة المفتاح العام:</span>
                            <span
                              className={
                                verificationResult.verification_details.public_key_valid
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {verificationResult.verification_details.public_key_valid ? "✓ صالح" : "✗ غير صالح"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>صحة التوقيع:</span>
                            <span
                              className={
                                verificationResult.verification_details.signature_valid
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {verificationResult.verification_details.signature_valid ? "✓ صالح" : "✗ غير صالح"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>صحة هاش المحتوى:</span>
                            <span
                              className={
                                verificationResult.verification_details.content_hash_valid
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {verificationResult.verification_details.content_hash_valid ? "✓ صالح" : "✗ غير صالح"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>صحة الطابع الزمني:</span>
                            <span
                              className={
                                verificationResult.verification_details.timestamp_valid
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {verificationResult.verification_details.timestamp_valid ? "✓ صالح" : "✗ غير صالح"}
                            </span>
                          </div>
                        </div>
                        </div>
                      
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Verify Modal */}
        <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
          <DialogContent className="max-w-3xl bg-white rounded-3xl border-0 shadow-2xl" dir="rtl">
            <DialogHeader className="pb-6 border-b border-slate-200">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                أداة التحقق المتقدمة
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                أدوات متقدمة وشاملة للتحقق من صحة التوقيعات الرقمية
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="text-center py-8">
                <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-fit mx-auto mb-6">
                  <Shield className="mx-auto h-12 w-12 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-3 text-xl">التحقق من التوقيعات</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  اختر عقداً من القائمة الرئيسية واضغط على "عرض التوقيعات" للوصول إلى أدوات التحقق المتقدمة
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowVerifyModal(false)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-6 py-3"
                  >
                    <ChevronRight className="w-4 h-4 ml-2" />
                    العودة للقائمة الرئيسية
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
