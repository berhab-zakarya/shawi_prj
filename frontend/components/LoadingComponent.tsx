import { LoadingSpinner } from "./ui/loading";
import { cn } from "@/lib/utils";

interface LoadingComponentProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  className,
  size = 'md',
}) => (
  <div className={cn("flex items-center justify-center py-8", className)}>
    <LoadingSpinner size={size} />
  </div>
);

export default LoadingComponent;