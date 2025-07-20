"use client"

import { JSX, useState } from "react"
import { useAdminContracts } from "@/hooks/useAdminContracts"
import { useAdminManagement } from "@/hooks/useAdminManagement"
import type { Contract } from "@/types/contracts-admin"
import type { AdminUser } from "@/types/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import {
  Search,
  Filter,
  Download,
  Trash2,
  UserPlus,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
  Eye,
  Users,
  FileSignature,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

type ViewMode = "list" | "view" | "assign-lawyer" | "change-status" | "force-sign"

export default function ContractsAdminPage() {
  const {
    contracts,
    loading: contractsLoading,
    errorMessage: contractsError,
    getContracts,
    deleteContract,
    assignLawyer,
    changeStatus,
    forceSign,
    exportAllContracts,
  } = useAdminContracts()

  const { users, loading: usersLoading, errorMessage: usersError } = useAdminManagement()

  // View state management
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")

  // Form states
  const [lawyerId, setLawyerId] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [forceSignUserId, setForceSignUserId] = useState("")
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx">("pdf")

  const loading = contractsLoading || usersLoading
  const errorMessage = contractsError || usersError

  const handleFilter = async () => {
    const filters: { status?: string; contract_type?: string; client_email?: string } = {}
    if (statusFilter) filters.status = statusFilter
    if (typeFilter) filters.contract_type = typeFilter
    if (emailFilter) filters.client_email = emailFilter

    try {
      await getContracts(filters)
      toast({
        title: "تم تطبيق المرشحات",
        description: "تم تحديث قائمة العقود بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التصفية",
        description:` حدث خطأ أثناء تطبيق المرشحات ${error}`,
        
        variant: "destructive",
      })
    }
  }

  const handleClearFilters = async () => {
    setStatusFilter("")
    setTypeFilter("")
    setEmailFilter("")
    try {
      await getContracts()
      toast({
        title: "تم مسح المرشحات",
        description: "تم عرض جميع العقود",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث القائمة" + error,
        variant: "destructive",
      })
    }
  }

  const handleDeleteContract = async (id: number) => {
    try {
      await deleteContract(id)
      toast({
        title: "تم حذف العقد",
        description: "تم حذف العقد بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف العقد" + error,
        variant: "destructive",
      })
    }
  }

  const handleAssignLawyer = async () => {
    if (!selectedContract || !lawyerId) return

    try {
      await assignLawyer(selectedContract.id, { lawyer_id: Number.parseInt(lawyerId) })
      setCurrentView("list")
      setSelectedContract(null)
      setLawyerId("")
      toast({
        title: "تم تعيين المحامي",
        description: "تم تعيين المحامي للعقد بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التعيين",
        description: "حدث خطأ أثناء تعيين المحامي" + error,
        variant: "destructive",
      })
    }
  }

  const handleChangeStatus = async () => {
    if (!selectedContract || !newStatus) return

    try {
      await changeStatus(selectedContract.id, { status: newStatus })
      setCurrentView("list")
      setSelectedContract(null)
      setNewStatus("")
      toast({
        title: "تم تغيير الحالة",
        description: "تم تحديث حالة العقد بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في تغيير الحالة",
        description: "حدث خطأ أثناء تحديث حالة العقد" + error,
        variant: "destructive",
      })
    }
  }

  const handleForceSign = async () => {
    if (!selectedContract || !forceSignUserId) return

    try {
      await forceSign(selectedContract.id, { user_id: Number.parseInt(forceSignUserId) })
      setCurrentView("list")
      setSelectedContract(null)
      setForceSignUserId("")
      toast({
        title: "تم فرض التوقيع",
        description: "تم فرض توقيع العقد بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في فرض التوقيع",
        description: "حدث خطأ أثناء فرض توقيع العقد" + error,
        variant: "destructive",
      })
    }
  }

  const handleExportAll = async () => {
    try {
      const blob = await exportAllContracts({ format: exportFormat })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `contracts.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast({
        title: "تم تصدير العقود",
        description: "تم تحميل ملف العقود بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير العقود" + error,
        variant: "destructive",
      })
    }
  }

  const openContractInNewTab = (contract: Contract) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>عقد #${contract.id} - ${contract.contract_type}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 40px;
              background-color: #f9fafb;
              color: #1f2937;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .contract-info {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 30px;
            }
            .content {
              line-height: 1.8;
            }
            h1 { color: #1f2937; margin-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; margin-bottom: 15px; }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .label { font-weight: 600; color: #6b7280; }
            .value { color: #1f2937; }
            @media print {
              body { margin: 0; background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>عقد #${contract.id}</h1>
              <p>${contract.contract_type}</p>
            </div>
            
            <div class="contract-info">
              <h2>معلومات العقد</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">العميل:</span>
                  <span class="value">${contract.client ? `${contract.client.first_name} ${contract.client.last_name} (${contract.client.email})` : "غير محدد"}</span>
                </div>
                <div class="info-item">
                  <span class="label">الحالة:</span>
                  <span class="value">${contract.status}</span>
                </div>
                <div class="info-item">
                  <span class="label">نسخة النص:</span>
                  <span class="value">${contract.text_version}</span>
                </div>
                <div class="info-item">
                  <span class="label">تاريخ الإنشاء:</span>
                  <span class="value">${new Date(contract.created_at).toLocaleDateString("ar-SA")}</span>
                </div>
                <div class="info-item">
                  <span class="label">آخر تحديث:</span>
                  <span class="value">${new Date(contract.updated_at).toLocaleDateString("ar-SA")}</span>
                </div>
                <div class="info-item">
                  <span class="label">عدد المراجعات:</span>
                  <span class="value">${contract.reviews.length}</span>
                </div>
                <div class="info-item">
                  <span class="label">عدد التوقيعات:</span>
                  <span class="value">${contract.signatures.length}</span>
                </div>
              </div>
            </div>

            <div class="content">
              <h2>نص العقد</h2>
              ${contract.full_text}
            </div>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      DRAFT: { label: "مسودة", variant: "outline" },
      UNDER_REVIEW: { label: "قيد المراجعة", variant: "outline" },
      APPROVED: { label: "موافق عليه", variant: "default" },
      SIGNED_BY_CLIENT: { label: "موقع من العميل", variant: "secondary" },
      SIGNED_BY_LAWYER: { label: "موقع من المحامي", variant: "secondary" },
      COMPLETED: { label: "مكتمل", variant: "default" },
      CANCELLED: { label: "ملغي", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getStatusIcon = (contract: Contract) => {
    if (contract.is_locked) return <Lock className="h-4 w-4 text-red-500" />
    if (contract.needs_review) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    if (contract.status === "COMPLETED") return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Clock className="h-4 w-4 text-blue-500" />
  }

  const lawyers = users.filter((user) => user.role === "Lawyer")

  // Render different views based on currentView state
  const renderContent = () => {
    switch (currentView) {
      case "view":
        return (
          <ContractDetailView
            contract={selectedContract}
            onBack={() => setCurrentView("list")}
            onOpenInTab={openContractInNewTab}
          />
        )

      case "assign-lawyer":
        return (
          <AssignLawyerView
            contract={selectedContract}
            lawyers={lawyers}
            lawyerId={lawyerId}
            setLawyerId={setLawyerId}
            onAssign={handleAssignLawyer}
            onBack={() => setCurrentView("list")}
            loading={loading}
          />
        )

      case "change-status":
        return (
          <ChangeStatusView
            contract={selectedContract}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            onChangeStatus={handleChangeStatus}
            onBack={() => setCurrentView("list")}
            loading={loading}
          />
        )

      case "force-sign":
        return (
          <ForceSignView
            contract={selectedContract}
            users={users}
            forceSignUserId={forceSignUserId}
            setForceSignUserId={setForceSignUserId}
            onForceSign={handleForceSign}
            onBack={() => setCurrentView("list")}
            loading={loading}
          />
        )

      default:
        return (
          <ContractsListView
            contracts={contracts}
            loading={loading}
            errorMessage={errorMessage}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            emailFilter={emailFilter}
            setEmailFilter={setEmailFilter}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            onFilter={handleFilter}
            onClearFilters={handleClearFilters}
            onExportAll={handleExportAll}
            onViewContract={(contract) => {
              setSelectedContract(contract)
              setCurrentView("view")
            }}
            onAssignLawyer={(contract) => {
              setSelectedContract(contract)
              setCurrentView("assign-lawyer")
            }}
            onChangeStatus={(contract) => {
              setSelectedContract(contract)
              setCurrentView("change-status")
            }}
            onForceSign={(contract) => {
              setSelectedContract(contract)
              setCurrentView("force-sign")
            }}
            onDeleteContract={handleDeleteContract}
            getStatusBadge={getStatusBadge}
            getStatusIcon={getStatusIcon}
          />
        )
    }
  }

  return (
    <div className="min-h-screen   p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">{renderContent()}</div>
    </div>
  )
}

// Component for contracts list view
function ContractsListView({
  contracts,
  loading,
  errorMessage,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  emailFilter,
  setEmailFilter,
  exportFormat,
  setExportFormat,
  onFilter,
  onClearFilters,
  onExportAll,
  onViewContract,
  onAssignLawyer,
  onChangeStatus,
  onForceSign,
  onDeleteContract,
  getStatusBadge,
  getStatusIcon,
}: {
  contracts: Contract[]
  loading: boolean
  errorMessage: string
  statusFilter: string
  setStatusFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  emailFilter: string
  setEmailFilter: (value: string) => void
  exportFormat: "pdf" | "docx"
  setExportFormat: (value: "pdf" | "docx") => void
  onFilter: () => void
  onClearFilters: () => void
  onExportAll: () => void
  onViewContract: (contract: Contract) => void
  onAssignLawyer: (contract: Contract) => void
  onChangeStatus: (contract: Contract) => void
  onForceSign: (contract: Contract) => void
  onDeleteContract: (id: number) => void
  getStatusBadge: (status: string) => JSX.Element
  getStatusIcon: (contract: Contract) => JSX.Element
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة العقود</h1>
          <p className="text-slate-600 mt-1">لوحة تحكم مشرف العقود</p>
        </div>

        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onExportAll} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 ml-2" />
            تصدير الكل
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            تصفية العقود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">مسودة</SelectItem>
                  <SelectItem value="UNDER_REVIEW">قيد المراجعة</SelectItem>
                  <SelectItem value="APPROVED">موافق عليه</SelectItem>
                  <SelectItem value="SIGNED_BY_CLIENT">موقع من العميل</SelectItem>
                  <SelectItem value="SIGNED_BY_LAWYER">موقع من المحامي</SelectItem>
                  <SelectItem value="COMPLETED">مكتمل</SelectItem>
                  <SelectItem value="CANCELLED">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter">نوع العقد</Label>
              <Input
                id="type-filter"
                placeholder="نوع العقد"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email-filter">بريد العميل</Label>
              <Input
                id="email-filter"
                placeholder="البريد الإلكتروني"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={onFilter} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 ml-2" />
                بحث
              </Button>
              <Button onClick={onClearFilters} variant="outline" disabled={loading}>
                مسح
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          : contracts.map((contract: Contract) => (
              <Card key={contract.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(contract)}
                        عقد #{contract.id}
                      </CardTitle>
                      <CardDescription className="mt-1">{contract.contract_type}</CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">العميل:</span>
                      <span className="font-medium">
                        {contract.client ? `${contract.client.first_name} ${contract.client.last_name}` : "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">تاريخ الإنشاء:</span>
                      <span>{new Date(contract.created_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">المراجعات:</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {contract.reviews.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">التوقيعات:</span>
                      <span className="flex items-center gap-1">
                        <FileSignature className="h-3 w-3" />
                        {contract.signatures.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contract.needs_review && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        يحتاج مراجعة
                      </Badge>
                    )}
                    {contract.is_locked && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        مقفل
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => onViewContract(contract)}>
                      <Eye className="h-3 w-3 ml-1" />
                      عرض
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => onAssignLawyer(contract)}>
                      <UserPlus className="h-3 w-3 ml-1" />
                      تعيين محامي
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => onChangeStatus(contract)}>
                      <FileText className="h-3 w-3 ml-1" />
                      تغيير الحالة
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => onForceSign(contract)}>
                      <CheckCircle className="h-3 w-3 ml-1" />
                      فرض التوقيع
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3 ml-1" />
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف العقد #{contract.id} نهائياً ولا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteContract(contract.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Empty State */}
      {!loading && contracts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد عقود</h3>
            <p className="text-slate-600">لم يتم العثور على أي عقود تطابق المعايير المحددة.</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// Component for contract detail view
function ContractDetailView({
  contract,
  onBack,
  onOpenInTab,
}: {
  contract: Contract | null
  onBack: () => void
  onOpenInTab: (contract: Contract) => void
}) {
  if (!contract) return null

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }
    > = {
      DRAFT: { label: "مسودة", variant: "outline", color: "text-gray-600 bg-gray-50 border-gray-200" },
      UNDER_REVIEW: {
        label: "قيد المراجعة",
        variant: "outline",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      },
      APPROVED: { label: "موافق عليه", variant: "default", color: "text-green-600 bg-green-50 border-green-200" },
      SIGNED_BY_CLIENT: {
        label: "موقع من العميل",
        variant: "secondary",
        color: "text-blue-600 bg-blue-50 border-blue-200",
      },
      SIGNED_BY_LAWYER: {
        label: "موقع من المحامي",
        variant: "secondary",
        color: "text-purple-600 bg-purple-50 border-purple-200",
      },
      COMPLETED: { label: "مكتمل", variant: "default", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
      CANCELLED: { label: "ملغي", variant: "destructive", color: "text-red-600 bg-red-50 border-red-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline" as const,
      color: "text-gray-600 bg-gray-50 border-gray-200",
    }
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </div>
    )
  }

  return (
    <>
      {/* Enhanced Header */}
      <div className=" rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="hover:bg-slate-50 bg-transparent">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للقائمة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">تفاصيل العقد #{contract.id}</h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(contract.status)}
                <span className="text-slate-500 text-sm">•</span>
                <span className="text-slate-600 text-sm">{contract.contract_type}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => onOpenInTab(contract)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <ExternalLink className="h-4 w-4 ml-2" />
            فتح في تبويب جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Contract Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contract Information Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="h-5 w-5 text-blue-600" />
                معلومات العقد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <Label className="text-sm font-semibold text-slate-700">نوع العقد</Label>
                  <p className="text-sm text-slate-900 font-medium text-left">{contract.contract_type}</p>
                </div>

                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <Label className="text-sm font-semibold text-slate-700">العميل</Label>
                  <div className="text-left">
                    {contract.client ? (
                      <>
                        <p className="text-sm text-slate-900 font-medium">
                          {contract.client.first_name} {contract.client.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{contract.client.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">غير محدد</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <Label className="text-sm font-semibold text-slate-700">نسخة النص</Label>
                  <p className="text-sm text-slate-900 font-medium text-left">{contract.text_version}</p>
                </div>

                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <Label className="text-sm font-semibold text-slate-700">تاريخ الإنشاء</Label>
                  <div className="text-left">
                    <p className="text-sm text-slate-900 font-medium">
                      {new Date(contract.created_at).toLocaleDateString("ar-SA")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(contract.created_at).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between py-3">
                  <Label className="text-sm font-semibold text-slate-700">آخر تحديث</Label>
                  <div className="text-left">
                    <p className="text-sm text-slate-900 font-medium">
                      {new Date(contract.updated_at).toLocaleDateString("ar-SA")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(contract.updated_at).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-blue-900">{contract.reviews.length}</p>
                    <p className="text-xs text-blue-600">مراجعة</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <FileSignature className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-green-900">{contract.signatures.length}</p>
                    <p className="text-xs text-green-600">توقيع</p>
                  </div>
                </div>
              </div>

              {/* Contract Flags */}
              {(contract.needs_review || contract.is_locked) && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {contract.needs_review && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800 font-medium">يحتاج مراجعة</span>
                    </div>
                  )}
                  {contract.is_locked && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <Lock className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800 font-medium">مقفل</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Reviews Section */}
          {contract.reviews.length > 0 && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-blue-600" />
                  المراجعات ({contract.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {contract.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {review.lawyer.first_name.charAt(0)}
                              {review.lawyer.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {review.lawyer.first_name} {review.lawyer.last_name}
                            </p>
                            <p className="text-sm text-slate-500">{review.lawyer.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            review.status === "APPROVED"
                              ? "default"
                              : review.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                          }
                          className="shadow-sm"
                        >
                          {review.status === "APPROVED"
                            ? "موافق"
                            : review.status === "REJECTED"
                              ? "مرفوض"
                              : "في الانتظار"}
                        </Badge>
                      </div>

                      {review.review_notes && (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-3">
                          <p className="text-sm text-slate-700 leading-relaxed">{review.review_notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(review.created_at).toLocaleDateString("ar-SA")}</span>
                        <span>•</span>
                        <span>
                          {new Date(review.created_at).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Signatures Section */}
          {contract.signatures.length > 0 && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileSignature className="h-5 w-5 text-green-600" />
                  التوقيعات ({contract.signatures.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {contract.signatures.map((signature) => (
                    <div
                      key={signature.id}
                      className="border border-slate-200 rounded-xl p-4 bg-gradient-to-r from-green-50 to-transparent hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {signature.user.first_name} {signature.user.last_name}
                            </p>
                            <p className="text-sm text-slate-500">{signature.user.email}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {signature.user.role === "Lawyer" ? "محامي" : "عميل"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-900">
                            {new Date(signature.signed_at).toLocaleDateString("ar-SA")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(signature.signed_at).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">IP: {signature.ip_address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Contract Content */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-slate-200 h-fit">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FileText className="h-5 w-5 text-slate-600" />
                    نص العقد
                  </CardTitle>
                  <CardDescription className="mt-1">النص الكامل للعقد (HTML)</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => onOpenInTab(contract)} className="hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  فتح منفصل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <div
                  className="prose prose-sm max-w-none bg-white p-6 rounded-b-lg min-h-[500px] max-h-[700px] overflow-y-auto border-t border-slate-100"
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    lineHeight: "1.7",
                    color: "#1f2937",
                  }}
                  dangerouslySetInnerHTML={{ __html: contract.full_text }}
                />
                <div className="absolute top-2 left-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                  HTML Content
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// Component for assigning lawyer
function AssignLawyerView({
  contract,
  lawyers,
  lawyerId,
  setLawyerId,
  onAssign,
  onBack,
  loading,
}: {
  contract: Contract | null
  lawyers: AdminUser[]
  lawyerId: string
  setLawyerId: (value: string) => void
  onAssign: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">تعيين محامي للعقد #{contract?.id}</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>اختيار المحامي</CardTitle>
          <CardDescription>اختر المحامي المراد تعيينه لمراجعة هذا العقد</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lawyer-select">المحامي</Label>
            <Select value={lawyerId} onValueChange={setLawyerId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المحامي" />
              </SelectTrigger>
              <SelectContent>
                {lawyers.map((lawyer) => (
                  <SelectItem key={lawyer.id} value={lawyer.id.toString()}>
                    {lawyer.first_name} {lawyer.last_name} ({lawyer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onAssign} disabled={loading || !lawyerId} className="bg-blue-600 hover:bg-blue-700">
              تعيين المحامي
            </Button>
            <Button variant="outline" onClick={onBack}>
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// Component for changing status
function ChangeStatusView({
  contract,
  newStatus,
  setNewStatus,
  onChangeStatus,
  onBack,
  loading,
}: {
  contract: Contract | null
  newStatus: string
  setNewStatus: (value: string) => void
  onChangeStatus: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">تغيير حالة العقد #{contract?.id}</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>تحديث الحالة</CardTitle>
          <CardDescription>اختر الحالة الجديدة للعقد</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status-select">الحالة الجديدة</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">مسودة</SelectItem>
                <SelectItem value="UNDER_REVIEW">قيد المراجعة</SelectItem>
                <SelectItem value="APPROVED">موافق عليه</SelectItem>
                <SelectItem value="SIGNED_BY_CLIENT">موقع من العميل</SelectItem>
                <SelectItem value="SIGNED_BY_LAWYER">موقع من المحامي</SelectItem>
                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onChangeStatus} disabled={loading || !newStatus} className="bg-blue-600 hover:bg-blue-700">
              تحديث الحالة
            </Button>
            <Button variant="outline" onClick={onBack}>
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// Component for force signing
function ForceSignView({
  contract,
  users,
  forceSignUserId,
  setForceSignUserId,
  onForceSign,
  onBack,
  loading,
}: {
  contract: Contract | null
  users: AdminUser[]
  forceSignUserId: string
  setForceSignUserId: (value: string) => void
  onForceSign: () => void
  onBack: () => void
  loading: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">فرض توقيع العقد #{contract?.id}</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>فرض التوقيع</CardTitle>
          <CardDescription>اختر المستخدم المراد فرض توقيعه على العقد</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-select">المستخدم</Label>
            <Select value={forceSignUserId} onValueChange={setForceSignUserId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المستخدم" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.first_name} {user.last_name} ({user.email}) - {user.role || "عميل"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onForceSign}
              disabled={loading || !forceSignUserId || contract?.is_locked}
              className="bg-red-600 hover:bg-red-700"
            >
              فرض التوقيع
            </Button>
            <Button variant="outline" onClick={onBack}>
              إلغاء
            </Button>
          </div>
          {contract?.is_locked && (
          <p className="text-sm text-red-600 mt-2">
            العقد مقفل ولا يمكن فرض التوقيع عليه. يرجى تغيير الحالة أولاً.
          </p>
            )
          }
        </CardContent>
      </Card>
    </>
  )
}
