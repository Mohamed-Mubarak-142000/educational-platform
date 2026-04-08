import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AvatarUploadProps {
  preview?: string;
  name?: string;
  onChange: (file: File, previewUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-36 h-36',
};

export default function AvatarUpload({ preview, name, onChange, size = 'md' }: AvatarUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeClass = sizeMap[size];

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be picked again
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`relative ${sizeClass} rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
        aria-label={t('uploadAvatarAriaLabel')}
      >
        {preview ? (
          <img
            src={preview}
            alt={t('avatarPreviewAlt')}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-300">
            {initials}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </button>
      <span className="text-xs text-slate-500 dark:text-slate-400">{t('clickToUploadPhoto')}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
