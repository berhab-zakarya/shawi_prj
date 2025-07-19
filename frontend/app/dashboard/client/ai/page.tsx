/* eslint-disable */

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Scale,
  User,
  FileText,
  MessageSquare,
  Download,
  AlertCircle,
  BookOpen,
  Copy,
  Share,
  Loader2,
  Sparkles,
} from "lucide-react"
import { useAIAssistant } from "@/hooks/useAIAssistant"
import { MarkdownContent } from "@/components/markdown-content"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Document {
  id: number
  title: string
}


interface ConversationItem {
  id: string
  type: "question" | "answer"
  content: string
  timestamp: string
  responseId?: number
  contextDocuments?: Document[]
  rating?: number
  pdfExport?: string
}

// Streaming text component with markdown support
const StreamingMarkdown = ({ text, isComplete = false }: { text: string; isComplete?: boolean }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (isComplete) {
      setDisplayedText(text)
      setCurrentIndex(text.length)
      return
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 15)

      return () => clearTimeout(timer)
    }
  }, [text, currentIndex, isComplete])

  return (
    <div className="relative max-w-full overflow-hidden" dir="rtl">
      <div className="prose prose-sm max-w-none prose-headings:text-right prose-p:text-right prose-li:text-right">
        <MarkdownContent content={displayedText} />
      </div>
      {!isComplete && currentIndex < text.length && (
        <span className="inline-block w-2 h-5 bg-primary animate-pulse mr-1" />
      )}
    </div>
  )
}

// Enhanced message bubble component
const MessageBubble = ({
  item,
  isStreaming = false,
}: {
  item: ConversationItem
  isStreaming?: boolean
}) => {
  const [copied, setCopied] = useState(false)
  const isUser = item.type === "question"

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group flex gap-4 mb-8", isUser ? "flex-row-reverse" : "flex-row")} dir="rtl">
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 max-w-[85%]">
        {/* Message Header */}
        <div className={cn("flex items-center gap-2 mb-2", isUser ? "justify-end" : "justify-start")}>
          <span className="text-sm font-medium text-muted-foreground">{isUser ? "أنت" : "المساعد القانوني"}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.timestamp), "HH:mm", { locale: ar })}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-sm border",
            isUser ? "bg-primary text-primary-foreground border-primary/20" : "bg-card border-border/50",
          )}
        >
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-right" dir="rtl">
                {item.content}
              </p>
            ) : (
              <div className="space-y-3" dir="rtl">
                <StreamingMarkdown text={item.content} isComplete={!isStreaming} />

                {/* Context Documents */}
                {item.contextDocuments && item.contextDocuments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="text-xs font-medium text-muted-foreground">المراجع القانونية</span>
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {item.contextDocuments.map((doc) => (
                        <Badge key={doc.id} variant="secondary" className="text-xs">
                          <span>{doc.title}</span>
                          <FileText className="w-3 h-3 mr-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!isUser && item.responseId && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content)} className="h-7 px-2 text-xs">
                  <span className="mr-1">{copied ? "تم النسخ" : "نسخ"}</span>
                  <Copy className="w-3 h-3" />
                </Button>

                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <span className="mr-1">مشاركة</span>
                  <Share className="w-3 h-3" />
                </Button>

                {item.pdfExport && (
                  <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                    <a href={item.pdfExport} download>
                      <span className="mr-1">تحميل</span>
                      <Download className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Rating */}
              
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Processing indicator component
const ProcessingIndicator = ({ status }: { status: string }) => {
  return (
    <div className="flex items-center gap-4 mb-8" dir="rtl">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <Scale className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 justify-start">
          <span className="text-sm font-medium text-muted-foreground">المساعد القانوني</span>
          <span className="text-xs text-muted-foreground">الآن</span>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3 justify-end">
            <span className="text-sm text-muted-foreground">{status}</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  const [question, setQuestion] = useState("")
  const [useContext, setUseContext] = useState(true)
  const [documentId, setDocumentId] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProcessingStatus, setCurrentProcessingStatus] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const questionInputRef = useRef<HTMLTextAreaElement>(null)
  const processedResponseIds = useRef<Set<number>>(new Set())

  const {
    responses,
    currentResponse,
    loading,
    error,
    processingStatus,
    contextDocuments,
    askQuestion: submitQuestion,
    analyzeDocument,
    connectWebSocket,
    disconnectWebSocket,
    clearError,
  } = useAIAssistant()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isProcessing])

  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [connectWebSocket, disconnectWebSocket])

  // Handle processing status - FIXED
  useEffect(() => {
    if (processingStatus && processingStatus.trim() !== "") {
      setIsProcessing(true)
      setCurrentProcessingStatus(processingStatus)
    } else {
      // Clear processing when no status or empty status
      setIsProcessing(false)
      setCurrentProcessingStatus("")
    }
  }, [processingStatus])

  // Handle current response completion - FIXED
  useEffect(() => {
    if (currentResponse && !loading) {
      // Response is complete, clear processing
      setIsProcessing(false)
      setCurrentProcessingStatus("")
    }
  }, [currentResponse, loading])

  // Handle responses and avoid duplicates
  useEffect(() => {
    const newConversationItems: ConversationItem[] = []

    // Process historical responses
    responses.forEach((response) => {
      if (!processedResponseIds.current.has(response.id)) {
        processedResponseIds.current.add(response.id)

        // Add question
        newConversationItems.push({
          id: `q-${response.id}`,
          type: "question",
          content: response.question,
          timestamp: response.created_at,
        })

        // Add answer
        newConversationItems.push({
          id: `a-${response.id}`,
          type: "answer",
          content: response.answer,
          timestamp: response.created_at,
          responseId: response.id,
          contextDocuments: response.context_documents,
          rating: response.rating,
          pdfExport: response.pdf_export,
        })
      }
    })

    // Process current response
    if (currentResponse && !processedResponseIds.current.has(currentResponse.id)) {
      processedResponseIds.current.add(currentResponse.id)

      // Add question
      newConversationItems.push({
        id: `q-${currentResponse.id}`,
        type: "question",
        content: currentResponse.question,
        timestamp: currentResponse.created_at,
      })

      // Add answer
      newConversationItems.push({
        id: `a-${currentResponse.id}`,
        type: "answer",
        content: currentResponse.answer,
        timestamp: currentResponse.created_at,
        responseId: currentResponse.id,
        contextDocuments: currentResponse.context_documents,
        rating: currentResponse.rating,
        pdfExport: currentResponse.pdf_export,
      })
    }

    if (newConversationItems.length > 0) {
      setConversation((prev) => {
        // Sort by timestamp to maintain order
        const combined = [...prev, ...newConversationItems]
        return combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      })
    }
  }, [responses, currentResponse])

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    // Clear any existing processing state
    setIsProcessing(false)
    setCurrentProcessingStatus("")

    await submitQuestion(question, useContext)
    setQuestion("")
    questionInputRef.current?.focus()
  }

  const handleDocumentAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentId.trim() || loading) return

    const id = Number.parseInt(documentId)
    if (isNaN(id)) return

    // Clear any existing processing state
    setIsProcessing(false)
    setCurrentProcessingStatus("")

    await analyzeDocument(id)
    setDocumentId("")
  }

 

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleQuestionSubmit(e)
    }
  }

//  const handleRating = async (responseId: number, rating: number) => {
//     await rateResponse(responseId, rating)

//     // Update conversation item rating
//     setConversation((prev) => prev.map((item) => (item.responseId === responseId ? { ...item, rating } : item)))
//   }
//   const handleRefreshData = useCallback(async () => {
//     // Clear processed IDs to allow fresh data
//     processedResponseIds.current.clear()
//     setConversation([])
//     setIsProcessing(false)
//     setCurrentProcessingStatus("")
//     await getHistory()
//   }, [getHistory])

//   const filteredResponses = responses.filter(
//     (response) =>
//       searchQuery === "" ||
//       response.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       response.answer.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 justify-start">
          <div>
            <h1 className="text-3xl font-bold text-right">
              المساعد القانوني الذكي
            </h1>
            <p className="-foreground text-right">احصل على استشارات قانونية فورية ودقيقة</p>
          </div>
          <div className="p-2 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6" variant="destructive" dir="rtl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between text-right">
            <Button variant="ghost" size="sm" onClick={clearError}>
              إغلاق
            </Button>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-1 bg-white">
          <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-background">
            <span>المحادثة</span>
            <MessageSquare className="w-4 h-4" />
          </TabsTrigger>
          {/* <TabsTrigger value="analyze" className="flex items-center gap-2 data-[state=active]:bg-background">
            <span>تحليل المستندات</span>
            <FileText className="w-4 h-4" />
          </TabsTrigger>
       */}
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="w-full gap-6">
            {/* Main Chat Area */}
            <div className="w-full">
              <Card className="h-[700px] flex flex-col shadow-lg border-0 bg-gradient-to-b from-background to-muted/20">
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-1">
                      {/* Welcome Message */}
                      {conversation.length === 0 && !isProcessing && (
                        <div className="text-center py-12" dir="rtl">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">مرحباً بك في المساعد القانوني</h3>
                          <p className="text-muted-foreground max-w-md mx-auto text-center">
                            اسأل أي سؤال قانوني وسأقوم بتقديم إجابة شاملة ودقيقة بناءً على القوانين والأنظمة المعمول بها
                          </p>
                        </div>
                      )}

                      {/* Conversation */}
                      {conversation.map((item) => (
                        <MessageBubble
                          key={item.id}
                          item={item}
                          isStreaming={
                            item.type === "answer" && loading && item.id === conversation[conversation.length - 1]?.id
                          }
                        />
                      ))}

                      {/* Processing Status - Only show when actually processing */}
                      {isProcessing && currentProcessingStatus && (
                        <ProcessingIndicator status={currentProcessingStatus} />
                      )}

                      {/* Context Documents Preview */}
                      {contextDocuments.length > 0 && (
                        <div className="flex items-center gap-4 mb-8" dir="rtl">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              <Scale className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3">
                              <div className="flex items-center gap-2 mb-2 justify-end">
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  تم العثور على مراجع قانونية ذات صلة
                                </span>
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {contextDocuments.map((doc) => (
                                  <Badge
                                    key={doc.id}
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                  >
                                    <span>{doc.title}</span>
                                    <FileText className="w-3 h-3 mr-1" />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <Separator />

                  {/* Input Area */}
                  <div className="p-6 bg-background/80 backdrop-blur-sm">
                    <form onSubmit={handleQuestionSubmit} className="space-y-4">
                      {/* Context Toggle */}
                    
                      {/* Input Field */}
                      <div className="relative">
                        <Textarea
                          ref={questionInputRef}
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="اكتب سؤالك القانوني هنا... (اضغط Enter للإرسال، Shift+Enter لسطر جديد)"
                          disabled={loading}
                          className="min-h-[60px] max-h-[120px] resize-none pl-12 text-sm leading-relaxed text-right"
                          dir="rtl"
                        />
                        <Button
                          type="submit"
                          disabled={loading || !question.trim()}
                          size="sm"
                          className="absolute left-2 bottom-4 h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

      
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-right">تحليل المستندات القانونية</CardTitle>
                <p className="text-muted-foreground text-right">احصل على تحليل شامل ومفصل لأي مستند قانوني</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleDocumentAnalysis} className="space-y-4">
                  <div>
                    <Label htmlFor="document-id" className="text-base font-medium text-right block">
                      معرف المستند
                    </Label>
                    <Input
                      id="document-id"
                      type="number"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="أدخل معرف المستند المراد تحليله"
                      disabled={loading}
                      className="mt-2 h-12 text-right"
                      dir="rtl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !documentId.trim()}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">جاري التحليل...</span>
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span className="mr-2">بدء التحليل</span>
                        <FileText className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-right">ما يمكن للمساعد تحليله:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-right">
                    <li>• العقود والاتفاقيات</li>
                    <li>• القرارات القضائية</li>
                    <li>• اللوائح والأنظمة</li>
                    <li>• المذكرات القانونية</li>
                    <li>• الوثائق الرسمية</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
{/* 
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefreshData} disabled={loading}>
                <span className="mr-2">تحديث</span>
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
              <div className="relative">
                <Input
                  placeholder="البحث في السجل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 text-right"
                  dir="rtl"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-right">سجل الاستشارات القانونية</h2>
          </div>

          <div className="grid gap-6">
            {filteredResponses.map((response) => (
              <Card key={response.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(response.answer)}>
                          <span className="mr-2">نسخ الإجابة</span>
                          <Copy className="w-4 h-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="mr-2">مشاركة</span>
                          <Share className="w-4 h-4" />
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="mr-2">حفظ</span>
                          <Bookmark className="w-4 h-4" />
                        </DropdownMenuItem>
                        {response.pdf_export && (
                          <DropdownMenuItem asChild>
                            <a href={response.pdf_export} download>
                              <span className="mr-2">تحميل PDF</span>
                              <Download className="w-4 h-4" />
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex-1 text-right">
                      <h3 className="font-semibold text-lg mb-2 leading-relaxed">{response.question}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground justify-end">
                        {response.context_documents.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{response.context_documents.length} مرجع</span>
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>{format(new Date(response.created_at), "PPp", { locale: ar })}</span>
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    <div className="prose prose-sm max-w-none prose-headings:text-right prose-p:text-right prose-li:text-right">
                      <MarkdownContent content={response.answer} />
                    </div>
                  </div>

                  {response.context_documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-right">المراجع القانونية:</p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {response.context_documents.map((doc) => (
                          <Badge key={doc.id} variant="outline" className="text-xs">
                            <span>{doc.title}</span>
                            <FileText className="w-3 h-3 mr-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                    </div>

                   
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredResponses.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد استشارات سابقة"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "جرب البحث بكلمات مختلفة" : "ابدأ بطرح سؤال قانوني في تبويب المحادثة"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
