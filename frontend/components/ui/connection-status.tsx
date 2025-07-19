import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  className?: string
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      text: 'متصل'
    },
    connecting: {
      icon: Wifi,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      text: 'جاري الاتصال...'
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      text: 'غير متصل'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      text: 'خطأ في الاتصال'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('w-2 h-2 rounded-full', config.bgColor)} />
      <Icon className={cn('w-4 h-4', config.color)} />
      <span className={cn('text-sm', config.color)}>{config.text}</span>
    </div>
  )
}
