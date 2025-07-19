"use client"

import { useState } from "react"
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import { CreateRoomRequest, User } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateRoomDialogProps {
isOpen: boolean
onClose: () => void
onCreate: (roomData: CreateRoomRequest) => void
allUsers: User[] // List of all possible users to add to a room
isLoading: boolean
}

export function CreateRoomDialog({
isOpen,
onClose,
onCreate,
allUsers,
isLoading,
}: CreateRoomDialogProps) {
const [roomName, setRoomName] = useState("")
const [roomType, setRoomType] = useState<
  "ONE_TO_ONE" | "GROUP" | "SUPPORT"
>("GROUP")
const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]) // Emails of selected users

const handleSubmit = () => {
  onCreate({
    name: roomName,
    room_type: roomType,
    participants: selectedParticipants,
  })
  setRoomName("")
  setRoomType("GROUP")
  setSelectedParticipants([])
  onClose()
}

const userOptions = allUsers.map((user) => ({
  label: user.fullname || user.email,
  value: user.email,
}))

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px] rtl">
      <DialogHeader className="text-right">
        <DialogTitle>إنشاء غرفة محادثة جديدة</DialogTitle>
        <DialogDescription>
          املأ التفاصيل لإنشاء غرفة محادثة جديدة.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            اسم الغرفة
          </Label>
          <Input
            id="name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="col-span-3 text-right"
            placeholder="اسم الغرفة"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            نوع الغرفة
          </Label>
          <Select
            value={roomType}
            onValueChange={(value: "ONE_TO_ONE" | "GROUP" | "SUPPORT") =>
              setRoomType(value)
            }
          >
            <SelectTrigger className="col-span-3 text-right">
              <SelectValue placeholder="اختر نوع الغرفة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="ONE_TO_ONE">محادثة فردية</SelectItem>
              <SelectItem value="GROUP">مجموعة</SelectItem>
              <SelectItem value="SUPPORT">دعم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="participants" className="text-right">
            المشاركون
          </Label>
          {/* Assuming MultiSelect is a component you have or need to create */}
          {/* For simplicity, I'll use a basic select for now, but MultiSelect is ideal */}
          <Select
            onValueChange={(value) =>
              setSelectedParticipants((prev) =>
                prev.includes(value)
                  ? prev.filter((p) => p !== value)
                  : [...prev, value]
              )
            }
          >
            <SelectTrigger className="col-span-3 text-right">
              <SelectValue placeholder="اختر المشاركين" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <ScrollArea className="h-[200px]">
                {userOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          {/* Display selected participants */}
          <div className="col-span-4 text-right text-sm text-muted-foreground">
            المشاركون المختارون: {selectedParticipants.join(", ")}
          </div>
        </div>
      </div>
      <DialogFooter className="flex-row-reverse">
        <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "جاري الإنشاء..." : "إنشاء الغرفة"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          إلغاء
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
}
