import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    color?: "blue" | "green" | "purple" | "orange";
    className?: string;
}

const colorMap = {
    blue: "bg-blue-50 text-blue-600 hover:border-blue-200",
    green: "bg-green-50 text-green-600 hover:border-green-200",
    purple: "bg-purple-50 text-purple-600 hover:border-purple-200",
    orange: "bg-orange-50 text-orange-600 hover:border-orange-200",
};

const iconColorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
};

export function ProfileCard({
    title,
    description,
    icon: Icon,
    onClick,
    color = "blue",
    className
}: ProfileCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-300 border-2 border-transparent hover:shadow-lg h-full",
                    colorMap[color],
                    className
                )}
                onClick={onClick}
            >
                <CardHeader>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm", iconColorMap[color])}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-gray-600 text-base mb-4">
                        {description}
                    </CardDescription>
                    <div className={cn("flex items-center font-medium text-sm", iconColorMap[color])}>
                        En savoir plus <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
