import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

interface LanguageSwitcherProps {
  collapsed?: boolean
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
  }

  return (
    <Button 
      variant="ghost" 
      className={`h-9 font-medium rounded-full flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 ${collapsed ? 'w-9 justify-center px-0' : 'px-3'}`}
      onClick={toggleLanguage}
    >
      <Globe className="w-4 h-4" />
      {!collapsed && <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>}
    </Button>
  )
}
