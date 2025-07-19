
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { Contract, CreateContractRequest, ContractSignature } from "@/types/contracts"
import {
  Plus,
  Search,
  FileText,
  Eye,
  Download,
  PenTool,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Sparkles,
  TrendingUp,
  Shield,
  UserCheck,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useContracts } from "@/hooks/useContracts"
import { ContractDetailsView } from "@/components/dashboard/clients/contracts/contract-details-view"
import { CreateContractPage } from "@/components/dashboard/clients/contracts/create-contract-page"
import { ContractEnhanceView } from "@/components/dashboard/clients/contracts/contract-enhance-view"
import { ContractAnalyticsView } from "@/components/dashboard/clients/contracts/contract-analytics-view"
import { SignatureVerificationView } from "@/components/dashboard/clients/contracts/signature-verification-view"
import { AssignLawyer } from "@/components/dashboard/lawyer/contracts/AssignLawyer"

type ViewMode = "list" | "create" | "details" | "enhance" | "analytics" | "verify" | "assign"

export default function ClientContracts() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [contractSignatures, setContractSignatures] = useState<ContractSignature[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  // const [analysisResult, setAnalysisResult] = useState<string>("")
  const [enhancedContractText, setEnhancedContractText] = useState("")
  const [enhancementType, setEnhancementType] = useState<"enhance">("enhance")

  const { toast } = useToast()

  const handleViewContract = (
    contract: Contract,
    setViewMode: (mode: "list" | "create" | "details" | "enhance" | "analytics" | "verify") => void,
    setSelectedContract: (contract: Contract | null) => void,
  ) => {
    setSelectedContract(contract)
    setViewMode("details")
  }

  const {
    contracts,
    analytics,
    loading,
    errorMessage,
          users,  
      getUsers,     
assignLawyer,
    createContract,
    getContractDetails,
    generateContractText,
    enhanceContract,
    signContract,
    verifySignature,
    verifySignatureLocally,
    getContractSignatures,
    exportContract,
    getContractAnalytics,

  } = useContracts()


  // Display toast notification when errorMessage changes
  useEffect(() => {
    if (errorMessage) {
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [errorMessage,toast])

  const handleAssignLawyer = async (contractId: number, lawyerId: number) => {
  try {
    const result = await assignLawyer(contractId, lawyerId)
    if (result) {
      // Refresh contract details
      const details = await getContractDetails(contractId)
      if (details) {
        setSelectedContract(details)
      }
      return result
    }
    toast({
      title: "فشل التعيين",
      description: "لم يتم تعيين المحامي. يرجى المحاولة مرة أخرى.",
      variant: "destructive",
    })
    return null
  } catch (error) {
    toast({
      title: "خطأ",
      description: "حدث خطأ أثناء تعيين المحامي: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
      variant: "destructive",
    })
    return null
  }
}

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contract_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateContract = async (data: CreateContractRequest): Promise<Contract | null> => {
    try {
      const result = await createContract(data)
      if (result) {
        return result
      }
      toast({
        title: "فشل إنشاء العقد",
        description: "لم يتم إنشاء العقد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
      return null
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء العقد: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return null
    }
  }

  const handleGenerateText = async (id: number): Promise<{ full_text: string; text_version: string } | null> => {
    try {
      const result = await generateContractText(id)
      if (result) {
        const details = await getContractDetails(id)
        if (details) {
          setSelectedContract(details)
        }
        return result
      }
      toast({
        title: "فشل توليد النص",
        description: "لم يتم توليد نص العقد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
      return null
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توليد النص: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return null
    }
  }

  const handleEnhanceContract = async (id: number, type: "enhance" | "correct" | "translate") => {
    try {
      const result = await enhanceContract(id, type)
      if (result) {
        setEnhancedContractText(result.full_text)
        const details = await getContractDetails(id)
        if (details) {
          setSelectedContract(details)
        }
        return result
      }
      toast({
        title: "فشل تحسين العقد",
        description: "لم يتم تحسين العقد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
      return null
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحسين العقد: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return null
    }
  }

  const handleSignContract = async (id: number) => {
    try {
      const result = await signContract(id)
      if (result) {
        const details = await getContractDetails(id)
        if (details) {
          setSelectedContract(details)
        }
        return true
      }
      toast({
        title: "فشل التوقيع",
        description: "لم يتم توقيع العقد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
      return false
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توقيع العقد: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return false
    }
  }

  const handleExportContract = async (id: number, format: "pdf" | "docx") => {
    try {
      const success = await exportContract(id, format)
      if (success) {
        const details = await getContractDetails(id)
        if (details) {
          setSelectedContract(details)
        }
      } else {
        toast({
          title: "فشل التصدير",
          description: `لم يتم تصدير العقد بصيغة ${format.toUpperCase()}. يرجى المحاولة مرة أخرى.`,
          variant: "destructive",
        })
      }
      return success
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير العقد: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return false
    }
  }

  const handleGetContractAnalytics = async (exportCsv = false) => {
    try {
      const result = await getContractAnalytics(exportCsv)
      if (result === true) {
        toast({
          title: "تم تصدير التحليلات",
          description: "تم تصدير بيانات التحليلات كملف CSV.",
        })
      } else if (result) {
        setViewMode("analytics")
      } else {
        toast({
          title: "فشل جلب التحليلات",
          description: "لم يتم جلب بيانات التحليلات. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        })
      }
      return result
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التحليلات: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
      return null
    }
  }

  const handleVerifySignatures = async (contract: Contract) => {
    try {
      const signatures = await getContractSignatures(contract.id)
      setContractSignatures(signatures)
      setSelectedContract(contract)
      setViewMode("verify")
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التوقيعات: " + (error instanceof Error ? error.message : "خطأ غير معروف"),
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (contract: Contract) => {
    const statusConfig = {
      DRAFT: {
        label: "مسودة",
        variant: "secondary" as const,
        icon: FileText,
        color: "bg-slate-100 text-slate-700 border-slate-200",
      },
      UNDER_REVIEW: {
        label: "قيد المراجعة",
        variant: "outline" as const,
        icon: Clock,
        color: "bg-amber-100 text-amber-700 border-amber-200",
      },
      APPROVED: {
        label: "موافق عليه",
        variant: "default" as const,
        icon: CheckCircle,
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      },
      REJECTED: {
        label: "مرفوض",
        variant: "destructive" as const,
        icon: XCircle,
        color: "bg-red-100 text-red-700 border-red-200",
      },
      SIGNED_BY_CLIENT: {
        label: "موقع من العميل",
        variant: "secondary" as const,
        icon: PenTool,
        color: "bg-blue-100 text-blue-700 border-blue-200",
      },
      SIGNED_BY_LAWYER: {
        label: "موقع من المحامي",
        variant: "outline" as const,
        icon: PenTool,
        color: "bg-purple-100 text-purple-700 border-purple-200",
      },
      COMPLETED: {
        label: "مكتمل",
        variant: "default" as const,
        icon: FileCheck,
        color: "bg-green-100 text-green-700 border-green-200",
      },
      EXPORTED: {
        label: "تم التصدير",
        variant: "secondary" as const,
        icon: Download,
        color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      },
    }

    const config = statusConfig[contract.status] || statusConfig.DRAFT
    const Icon = config.icon

    return (
      <Badge className={`flex items-center gap-1 ${config.color} hover:opacity-80 transition-opacity`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getContractTypeLabel = (type: string | null) => {
    const typeMap: Record<string, string> = {
      NDA: "اتفاقية عدم إفشاء",
    }
    return typeMap[type || ""] || type || "غير محدد"
  }

  const getContractsByStatus = () => {
    return {
      draft: contracts.filter((c) => c.status === "DRAFT"),
      underReview: contracts.filter((c) => c.status === "UNDER_REVIEW"),
      approved: contracts.filter((c) => c.status === "APPROVED"),
      rejected: contracts.filter((c) => c.status === "REJECTED"),
      signedByClient: contracts.filter((c) => c.status === "SIGNED_BY_CLIENT"),
      signedByLawyer: contracts.filter((c) => c.status === "SIGNED_BY_LAWYER"),
      completed: contracts.filter((c) => c.status === "COMPLETED"),
      exported: contracts.filter((c) => c.status === "EXPORTED"),
    }
  }

  const contractsByStatus = getContractsByStatus()

  const canSign = (contract: Contract) => {
    return (
      !contract.is_locked &&
      contract.full_text &&
      !["REJECTED", "SIGNED_BY_CLIENT", "COMPLETED"].includes(contract.status)
    )
  }

  const canExport = (contract: Contract) => {
    return contract.full_text
  }

  const canVerifySignatures = (contract: Contract) => {
    return ["SIGNED_BY_CLIENT", "SIGNED_BY_LAWYER", "COMPLETED"].includes(contract.status)
  }

  const getAvailableActions = (contract: Contract) => {
    const actions = []
 actions.push({
    label: "تعيين محامي",
    icon: UserCheck, // You'll need to import UserCheck from lucide-react
    action: () => {
      setSelectedContract(contract)
      setViewMode("assign")
    },
    variant: "outline" as const,
    color: "border-green-500 text-green-600 hover:bg-green-50",
  })
    if (!contract.full_text) {
      actions.push({
        label: "توليد النص",
        icon: FileText,
        action: () => handleGenerateText(contract.id),
        variant: "default" as const,
        color: "bg-blue-600 hover:bg-blue-700 text-white",
      })
    }

    if (canSign(contract)) {
      actions.push({
        label: "توقيع",
        icon: PenTool,
        action: () => handleSignContract(contract.id),
        variant: "outline" as const,
        color: " text-white ",
      })
    }

    if (contract.full_text) {
      actions.push({
        label: "تحسين/تصحيح",
        icon: Sparkles,
        action: () => {
          setSelectedContract(contract)
          setEnhancedContractText(contract.full_text)
          setViewMode("enhance")
        },
        variant: "outline" as const,
        color: "border-blue-500 text-blue-600 hover:bg-blue-50",
      })
    }

    if (canVerifySignatures(contract)) {
      actions.push({
        label: "التحقق من التوقيعات",
        icon: Shield,
        action: () => handleVerifySignatures(contract),
        variant: "outline" as const,
        color: "border-purple-500 text-purple-600 hover:bg-purple-50",
      })
    }

    if (canExport(contract)) {
      actions.push({
        label: "تصدير PDF",
        icon: Download,
        action: () => handleExportContract(contract.id, "pdf"),
        variant: "outline" as const,
        color: "border-orange-500 text-orange-600 hover:bg-orange-50",
      })
    }
// Add this after the other actions in getAvailableActions function
// if (contract.status === "UNDER_REVIEW" || contract.status === "DRAFT") {
 

    return actions
  }

  const renderContent = () => {
    switch (viewMode) {
      case "assign":
  return (
    selectedContract && (
      <AssignLawyer
        contract={selectedContract}
        users={users}
        onAssign={handleAssignLawyer}
        onBack={() => setViewMode("list")}
        loading={loading}
        onGetUsers={getUsers}
      />
    )
  )
      case "list":
        return (
          <div className="flex flex-col gap-12">
            {/* Header */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div>
                <h1 className="text-4xl bg-clip-text">عقودي الذكاء</h1>
                <p className="text-slate-600 mt-2 text-lg">إدارة وعرض جميع العقود بتقنية الذكاء الاصطناعي</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleGetContractAnalytics()}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  <TrendingUp className="w-5 h-5 ml-2" />
                  عرض التحليلات
                </Button>
                <Button
                  onClick={() => setViewMode("create")}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إنشاء عقد جديد
                </Button>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">إجمالي العقود</CardTitle>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{contracts.length}</div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    جميع العقود المنشأة
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-700">قيد المراجعة</CardTitle>
                  <div className="p-2 bg-amber-200 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-800">{contractsByStatus.underReview.length}</div>
                  <p className="text-xs text-amber-600 flex items-center mt-1">
                    <Sparkles className="w-3 h-3 ml-1" />
                    تحتاج مراجعة قانونية
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">جاهزة للتوقيع</CardTitle>
                  <div className="p-2 bg-emerald-200 rounded-lg">
                    <PenTool className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-800">
                    {contractsByStatus.approved.length + contractsByStatus.signedByLawyer.length}
                  </div>
                  <p className="text-xs text-emerald-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    موافق عليها ومعدة للتوقيع
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">مكتملة</CardTitle>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <FileCheck className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">{contractsByStatus.completed.length}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    موقعة ومكتملة
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            {/* {errorMessage && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
              </Alert>
            )} */}

            {/* Enhanced Search and Filters */}
            <Card className="bg-white shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="البحث في العقود..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Filter className="h-4 w-4 text-slate-600" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="DRAFT">مسودة</option>
                      <option value="UNDER_REVIEW">قيد المراجعة</option>
                      <option value="APPROVED">موافق عليه</option>
                      <option value="REJECTED">مرفوض</option>
                      <option value="SIGNED_BY_CLIENT">موقع من العميل</option>
                      <option value="SIGNED_BY_LAWYER">موقع من المحامي</option>
                      <option value="COMPLETED">مكتمل</option>
                      <option value="EXPORTED">تم التصدير</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contracts Table */}
            <Card className="bg-white shadow-sm border-slate-200 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl">
                <CardTitle className="text-slate-800">جميع العقود</CardTitle>
                <CardDescription className="text-slate-600">قائمة شاملة بجميع العقود</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                      <p className="mt-4 text-slate-600 font-medium">جاري التحميل...</p>
                    </div>
                  </div>
                ) : filteredContracts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد عقود</h3>
                    <p className="text-slate-500">ابدأ بإنشاء عقد جديد</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="text-right font-semibold text-slate-700">رقم العقد</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">النوع</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">الحالة</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">تاريخ الإنشاء</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">آخر تحديث</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContracts.map((contract, index) => (
                          <TableRow
                            key={contract.id}
                            className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
                          >
                            <TableCell className="font-medium text-blue-600">#{contract.id}</TableCell>
                            <TableCell className="text-slate-700">
                              {getContractTypeLabel(contract.contract_type)}
                            </TableCell>
                            <TableCell>{getStatusBadge(contract)}</TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(contract.created_at).toLocaleDateString("ar-SA")}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(contract.updated_at).toLocaleDateString("ar-SA")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewContract(contract, setViewMode, setSelectedContract)}
                                  className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                  <Eye className="w-4 h-4 ml-2" />
                                  عرض
                                </Button>
                                {getAvailableActions(contract)
                                  .slice(0, 2)
                                  .map((action, index) => (
                                    <Button
                                      key={index}
                                      size="sm"
                                      onClick={action.action}
                                      disabled={loading}
                                      className={`${action.color} rounded-lg transition-all duration-200`}
                                    >
                                      <action.icon className="w-4 h-4 ml-2" />
                                      {action.label}
                                    </Button>
                                  ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      case "create":
        return (
          <CreateContractPage
            onBack={() => setViewMode("list")}
            onSubmit={handleCreateContract}
            onGenerateText={handleGenerateText}
            onEnhance={handleEnhanceContract}
            onSign={handleSignContract}
            onExport={handleExportContract}
            loading={loading}
          />
        )
      case "details":
        return (
          selectedContract && (
            <ContractDetailsView
              contract={selectedContract}
              onBack={() => setViewMode("list")}
              onGenerateText={handleGenerateText}
              onSign={handleSignContract}
              onExport={handleExportContract}
              loading={loading}
            />
          )
        )
      case "enhance":
        return (
          selectedContract && (
            <ContractEnhanceView
              contract={selectedContract}
              enhancedText={enhancedContractText}
              enhancementType={enhancementType}
              setEnhancementType={setEnhancementType}
              onEnhance={handleEnhanceContract}
              loading={loading}
              onBack={() => setViewMode("list")}
            />
          )
        )
      case "analytics":
        return (
          analytics && (
            <ContractAnalyticsView
              analyticsData={analytics}
              loading={loading}
              onExportCsv={handleGetContractAnalytics}
              onBack={() => setViewMode("list")}
            />
          )
        )
      case "verify":
        return (
          selectedContract && (
            <SignatureVerificationView
              contract={selectedContract}
              signatures={contractSignatures}
              onBack={() => setViewMode("list")}
              onVerifySignature={verifySignature}
              onVerifyLocally={verifySignatureLocally}
              loading={loading}
            />
          )
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {renderContent()}
    </div>
  )
}