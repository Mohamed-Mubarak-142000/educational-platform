import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformConfig } from '@/context/PlatformConfigContext';
import type {
  PlatformConfig,
  LandingSection,
  NavItem,
  StatItem,
  TestimonialItem,
  FaqItem,
  SectionBlock,
  BlockType,
  BlockStyle,
} from '@/api/platformConfigApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, LoadingState } from '@/components/shared';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { spacing } from '@/lib/constants';
import {
  Settings,
  Navigation,
  Image,
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  Globe,
  Eye,
  EyeOff,
  AlertTriangle,
  Type,
  AlignLeft,
  Film,
  GripVertical,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Tab = 'platform' | 'navbar' | 'hero' | 'sections' | 'settings';

const TABS: { id: Tab; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'platform', labelKey: 'pcTabPlatform', icon: Globe },
  { id: 'navbar', labelKey: 'pcTabNavbar', icon: Navigation },
  { id: 'hero', labelKey: 'pcTabHero', icon: Image },
  { id: 'sections', labelKey: 'pcTabSections', icon: Layers },
  { id: 'settings', labelKey: 'pcTabSettings', icon: Settings },
];

// ─── Reusable sub-components ─────────────────────────────────────────────────

function BilingualInput({
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  multiline = false,
}: {
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{labelEn}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">عربي</span>
          {multiline ? (
            <textarea
              value={valueAr}
              onChange={(e) => onChangeAr(e.target.value)}
              rows={3}
              dir="rtl"
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          ) : (
            <Input value={valueAr} onChange={(e) => onChangeAr(e.target.value)} dir="rtl" className="shadow-none" />
          )}
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">English</span>
          {multiline ? (
            <textarea
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              rows={3}
              dir="ltr"
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          ) : (
            <Input value={valueEn} onChange={(e) => onChangeEn(e.target.value)} dir="ltr" className="shadow-none" />
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function PlatformTab({ draft, setDraft }: { draft: PlatformConfig; setDraft: React.Dispatch<React.SetStateAction<PlatformConfig>> }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <BilingualInput
        labelEn={t('pcPlatformName')}
        valueAr={draft.platformName.ar}
        valueEn={draft.platformName.en}
        onChangeAr={(v) => setDraft((d) => ({ ...d, platformName: { ...d.platformName, ar: v } }))}
        onChangeEn={(v) => setDraft((d) => ({ ...d, platformName: { ...d.platformName, en: v } }))}
      />
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcLogoUrl')}</Label>
        <Input
          value={draft.logoUrl}
          onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
          placeholder={t('pcLogoUrlPlaceholder')}
        />
        {draft.logoUrl && (
          <img src={draft.logoUrl} alt="logo preview" className="h-12 mt-2 rounded border border-slate-200 dark:border-slate-700 p-1 bg-white" />
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcDefaultLanguage')}</Label>
        <div className="flex gap-3">
          {['ar', 'en'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, defaultLanguage: lang as 'ar' | 'en' }))}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                draft.defaultLanguage === lang
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-violet-400'
              }`}
            >
              {lang === 'ar' ? 'العربية' : 'English'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavbarTab({ draft, setDraft }: { draft: PlatformConfig; setDraft: React.Dispatch<React.SetStateAction<PlatformConfig>> }) {
  const { t } = useTranslation();
  const items = [...draft.navbar.items].sort((a, b) => a.order - b.order);
  // Available custom section keys for quick-link
  const customSections = draft.landing.sections
    .filter((s) => s.type === 'custom')
    .map((s) => ({ key: s.key, label: s.titleEn || s.titleAr || s.key }));

  const update = (items: NavItem[]) =>
    setDraft((d) => ({ ...d, navbar: { items } }));

  const addItem = () => {
    const newItem: NavItem = {
      key: `item-${crypto.randomUUID()}`,
      label: { ar: '', en: '' },
      href: '',
      isAnchor: true,
      order: items.length + 1,
      isVisible: true,
    };
    update([...items, newItem]);
  };

  const removeItem = (key: string) => update(items.filter((i) => i.key !== key));

  const moveItem = (key: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.key === key);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    update(reordered.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const patchItem = (key: string, patch: Partial<NavItem>) => {
    update(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <Card key={item.key} className="border border-slate-200 dark:border-slate-700 shadow-none">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveItem(item.key, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => moveItem(item.key, 1)} disabled={idx === items.length - 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => patchItem(item.key, { isVisible: !item.isVisible })}
                  className={`p-1.5 rounded transition-colors ${item.isVisible ? 'text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={item.isVisible ? t('pcNavVisible') : t('pcNavHidden')}
                >
                  {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => removeItem(item.key)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <BilingualInput
              labelEn={t('pcNavLabel')}
              valueAr={item.label.ar}
              valueEn={item.label.en}
              onChangeAr={(v) => patchItem(item.key, { label: { ...item.label, ar: v } })}
              onChangeEn={(v) => patchItem(item.key, { label: { ...item.label, en: v } })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 dark:text-slate-400">
                  {item.isAnchor ? t('pcNavSectionId') : t('pcNavRoutePath')}
                </Label>
                <Input
                  value={item.href}
                  onChange={(e) => patchItem(item.key, { href: e.target.value })}
                  placeholder={item.isAnchor ? t('pcNavAnchorHint') : t('pcNavRouteHint')}
                  className="shadow-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch
                  checked={item.isAnchor}
                  onCheckedChange={(v) => patchItem(item.key, { isAnchor: v })}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {item.isAnchor ? t('pcNavAnchorMode') : t('pcNavRouteMode')}
                </span>
              </div>
            </div>

            {/* Quick-link to a custom section */}
            {customSections.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 dark:text-slate-400">{t('pcNavLinkSection')}</Label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => patchItem(item.key, { sectionKey: undefined })}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      !item.sectionKey
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-violet-400'
                    }`}
                  >
                    {t('pcNavNoSection')}
                  </button>
                  {customSections.map((cs) => (
                    <button
                      key={cs.key}
                      type="button"
                      onClick={() => patchItem(item.key, { sectionKey: cs.key, href: cs.key, isAnchor: true })}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        item.sectionKey === cs.key
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
                      }`}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addItem} className="w-full border-dashed gap-2">
        <Plus className="w-4 h-4" /> {t('pcNavAddItem')}
      </Button>
    </div>
  );
}

function HeroTab({ draft, setDraft }: { draft: PlatformConfig; setDraft: React.Dispatch<React.SetStateAction<PlatformConfig>> }) {
  const { t } = useTranslation();
  const hero = draft.landing.hero;
  const patch = (p: Partial<typeof hero>) =>
    setDraft((d) => ({ ...d, landing: { ...d.landing, hero: { ...d.landing.hero, ...p } } }));

  return (
    <div className="space-y-6">
      <BilingualInput
        labelEn={t('pcHeroTitle')}
        valueAr={hero.titleAr}
        valueEn={hero.titleEn}
        onChangeAr={(v) => patch({ titleAr: v })}
        onChangeEn={(v) => patch({ titleEn: v })}
      />
      <BilingualInput
        labelEn={t('pcHeroDescription')}
        valueAr={hero.descriptionAr}
        valueEn={hero.descriptionEn}
        onChangeAr={(v) => patch({ descriptionAr: v })}
        onChangeEn={(v) => patch({ descriptionEn: v })}
        multiline
      />
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcHeroImageUrl')}</Label>
        <Input value={hero.heroImageUrl} onChange={(e) => patch({ heroImageUrl: e.target.value })} placeholder="/hero-illustration.png" />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('pcHeroPrimaryButton')}</h4>
        <BilingualInput
          labelEn={t('pcHeroButtonLabel')}
          valueAr={hero.primaryButtonLabelAr}
          valueEn={hero.primaryButtonLabelEn}
          onChangeAr={(v) => patch({ primaryButtonLabelAr: v })}
          onChangeEn={(v) => patch({ primaryButtonLabelEn: v })}
        />
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 dark:text-slate-400">{t('pcHeroButtonLink')}</Label>
          <Input value={hero.primaryButtonHref} onChange={(e) => patch({ primaryButtonHref: e.target.value })} placeholder="/stages" />
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('pcHeroSecondaryButton')}</h4>
          <Switch checked={hero.showSecondaryButton} onCheckedChange={(v) => patch({ showSecondaryButton: v })} />
        </div>
        {hero.showSecondaryButton && (
          <>
            <BilingualInput
              labelEn={t('pcHeroButtonLabel')}
              valueAr={hero.secondaryButtonLabelAr}
              valueEn={hero.secondaryButtonLabelEn}
              onChangeAr={(v) => patch({ secondaryButtonLabelAr: v })}
              onChangeEn={(v) => patch({ secondaryButtonLabelEn: v })}
            />
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 dark:text-slate-400">{t('pcHeroButtonLink')}</Label>
              <Input value={hero.secondaryButtonHref} onChange={(e) => patch({ secondaryButtonHref: e.target.value })} placeholder="/login" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section editors ──────────────────────────────────────────────────────────

function StatsEditor({ section, onUpdate }: { section: LandingSection; onUpdate: (s: LandingSection) => void }) {
  const { t } = useTranslation();
  const stats = section.stats ?? [];

  const patchStat = (idx: number, patch: Partial<StatItem>) => {
    const next = stats.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onUpdate({ ...section, stats: next });
  };
  const addStat = () =>
    onUpdate({ ...section, stats: [...stats, { key: `stat-${Date.now()}`, labelAr: '', labelEn: '', value: 0, suffix: '+', decimals: 0, iconName: 'Users' }] });
  const removeStat = (idx: number) =>
    onUpdate({ ...section, stats: stats.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-3 mt-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('pcStatItems')}</h5>
      {stats.map((stat, idx) => (
        <div key={stat.key} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
            <button type="button" onClick={() => removeStat(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <BilingualInput labelEn={t('pcStatLabel')} valueAr={stat.labelAr} valueEn={stat.labelEn} onChangeAr={(v) => patchStat(idx, { labelAr: v })} onChangeEn={(v) => patchStat(idx, { labelEn: v })} />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t('pcStatValue')}</Label>
              <Input type="number" value={stat.value} onChange={(e) => patchStat(idx, { value: +e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t('pcStatSuffix')}</Label>
              <Input value={stat.suffix} onChange={(e) => patchStat(idx, { suffix: e.target.value })} placeholder="+" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t('pcStatDecimals')}</Label>
              <Input type="number" min={0} max={3} value={stat.decimals} onChange={(e) => patchStat(idx, { decimals: +e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">{t('pcStatIconName')}</Label>
            <Input value={stat.iconName} onChange={(e) => patchStat(idx, { iconName: e.target.value })} placeholder="Users, BookOpen, TrendingUp..." />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addStat} className="w-full border-dashed gap-2">
        <Plus className="w-3.5 h-3.5" /> {t('pcAddStat')}
      </Button>
    </div>
  );
}

function TestimonialsEditor({ section, onUpdate }: { section: LandingSection; onUpdate: (s: LandingSection) => void }) {
  const { t } = useTranslation();
  const testimonials = section.testimonials ?? [];

  const patchItem = (idx: number, p: Partial<TestimonialItem>) =>
    onUpdate({ ...section, testimonials: testimonials.map((item, i) => (i === idx ? { ...item, ...p } : item)) });
  const add = () =>
    onUpdate({ ...section, testimonials: [...testimonials, { textAr: '', textEn: '', author: '', roleAr: '', roleEn: '' }] });
  const remove = (idx: number) =>
    onUpdate({ ...section, testimonials: testimonials.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-3 mt-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('pcTestimonialsHeader')}</h5>
      {testimonials.map((item, idx) => (
        <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
            <button type="button" onClick={() => remove(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <BilingualInput labelEn={t('pcTestimonialText')} valueAr={item.textAr} valueEn={item.textEn} onChangeAr={(v) => patchItem(idx, { textAr: v })} onChangeEn={(v) => patchItem(idx, { textEn: v })} multiline />
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">{t('pcTestimonialAuthor')}</Label>
            <Input value={item.author} onChange={(e) => patchItem(idx, { author: e.target.value })} />
          </div>
          <BilingualInput labelEn={t('pcTestimonialRole')} valueAr={item.roleAr} valueEn={item.roleEn} onChangeAr={(v) => patchItem(idx, { roleAr: v })} onChangeEn={(v) => patchItem(idx, { roleEn: v })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full border-dashed gap-2">
        <Plus className="w-3.5 h-3.5" /> {t('pcAddTestimonial')}
      </Button>
    </div>
  );
}

function FaqEditor({ section, onUpdate }: { section: LandingSection; onUpdate: (s: LandingSection) => void }) {
  const { t } = useTranslation();
  const items = section.faqItems ?? [];

  const patchItem = (idx: number, p: Partial<FaqItem>) =>
    onUpdate({ ...section, faqItems: items.map((f, i) => (i === idx ? { ...f, ...p } : f)) });
  const add = () =>
    onUpdate({ ...section, faqItems: [...items, { questionAr: '', questionEn: '', answerAr: '', answerEn: '' }] });
  const remove = (idx: number) =>
    onUpdate({ ...section, faqItems: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-3 mt-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('pcFaqItems')}</h5>
      {items.map((f, idx) => (
        <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
            <button type="button" onClick={() => remove(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <BilingualInput labelEn={t('pcFaqQuestion')} valueAr={f.questionAr} valueEn={f.questionEn} onChangeAr={(v) => patchItem(idx, { questionAr: v })} onChangeEn={(v) => patchItem(idx, { questionEn: v })} />
          <BilingualInput labelEn={t('pcFaqAnswer')} valueAr={f.answerAr} valueEn={f.answerEn} onChangeAr={(v) => patchItem(idx, { answerAr: v })} onChangeEn={(v) => patchItem(idx, { answerEn: v })} multiline />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full border-dashed gap-2">
        <Plus className="w-3.5 h-3.5" /> {t('pcAddFaqItem')}
      </Button>
    </div>
  );
}

// ─── Block Builder ────────────────────────────────────────────────────────────

const BLOCK_TYPE_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  title: Type,
  text: AlignLeft,
  image: Image,
  video: Film,
};

function BlockEditor({ block, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: SectionBlock;
  onUpdate: (b: SectionBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const Icon = BLOCK_TYPE_ICONS[block.type];
  const patch = (p: Partial<SectionBlock>) => onUpdate({ ...block, ...p });
  const patchStyle = (s: Partial<SectionBlock['style']>) =>
    onUpdate({ ...block, style: { ...block.style, ...s } });

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
      {/* Block header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
        <div className="flex gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <Icon className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t(`pcBlock_${block.type}`)}
          </span>
        </div>
        <button type="button" onClick={onRemove} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Type selector */}
        <div className="flex gap-1 flex-wrap">
          {(['title', 'text', 'image', 'video'] as BlockType[]).map((bt) => {
            const BIcon = BLOCK_TYPE_ICONS[bt];
            return (
              <button
                key={bt}
                type="button"
                onClick={() => patch({ type: bt })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  block.type === bt
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-violet-400'
                }`}
              >
                <BIcon className="w-3 h-3" />
                {t(`pcBlock_${bt}`)}
              </button>
            );
          })}
        </div>

        {/* Content fields */}
        {(block.type === 'title' || block.type === 'text') && (
          <BilingualInput
            labelEn={block.type === 'title' ? t('pcBlockTitle') : t('pcBlockText')}
            valueAr={block.textAr ?? ''}
            valueEn={block.textEn ?? ''}
            onChangeAr={(v) => patch({ textAr: v })}
            onChangeEn={(v) => patch({ textEn: v })}
            multiline={block.type === 'text'}
          />
        )}

        {(block.type === 'image' || block.type === 'video') && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t('pcBlockUrl')}</Label>
              <Input
                value={block.url ?? ''}
                onChange={(e) => patch({ url: e.target.value })}
                placeholder={block.type === 'image' ? 'https://... or /images/photo.jpg' : 'https://youtube.com/embed/... or /videos/intro.mp4'}
              />
            </div>
            {block.type === 'image' && (
              <BilingualInput
                labelEn={t('pcBlockAlt')}
                valueAr={block.altAr ?? ''}
                valueEn={block.altEn ?? ''}
                onChangeAr={(v) => patch({ altAr: v })}
                onChangeEn={(v) => patch({ altEn: v })}
              />
            )}
            {block.url && block.type === 'image' && (
              <img src={block.url} alt={block.altEn ?? ''} className="max-h-32 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-slate-50 dark:bg-slate-800" />
            )}
          </div>
        )}

        {/* Style controls */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">{t('pcBlockAlignment')}</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => patchStyle({ alignment: a })}
                  title={a}
                  className={`flex-1 py-1 text-xs rounded border transition-colors ${
                    (block.style?.alignment ?? 'left') === a
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-violet-400'
                  }`}
                >
                  {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">{t('pcBlockPadding')}</Label>
            <select
              value={block.style?.padding ?? 'md'}
              onChange={(e) => patchStyle({ padding: e.target.value as BlockStyle['padding'] })}
              className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {(block.type === 'title' || block.type === 'text') && (
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">{t('pcBlockSize')}</Label>
              <select
                value={block.style?.size ?? 'md'}
                onChange={(e) => patchStyle({ size: e.target.value as BlockStyle['size'] })}
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlocksEditor({ section, onUpdate }: { section: LandingSection; onUpdate: (s: LandingSection) => void }) {
  const { t } = useTranslation();
  const blocks: SectionBlock[] = section.blocks ?? [];

  const updateBlocks = (next: SectionBlock[]) => onUpdate({ ...section, blocks: next });

  const addBlock = (type: BlockType) => {
    const newBlock: SectionBlock = {
      key: `block-${crypto.randomUUID()}`,
      type,
      textAr: '',
      textEn: '',
      url: '',
      altAr: '',
      altEn: '',
      style: { alignment: 'left', padding: 'md', size: 'md' },
    };
    updateBlocks([...blocks, newBlock]);
  };

  const updateBlock = (idx: number, b: SectionBlock) =>
    updateBlocks(blocks.map((bl, i) => (i === idx ? b : bl)));

  const removeBlock = (idx: number) =>
    updateBlocks(blocks.filter((_, i) => i !== idx));

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    updateBlocks(next);
  };

  return (
    <div className="space-y-3 mt-4">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('pcBlocksBuilder')}</h5>

      {blocks.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">{t('pcBlocksEmpty')}</p>
      )}

      {blocks.map((block, idx) => (
        <BlockEditor
          key={block.key}
          block={block}
          onUpdate={(b) => updateBlock(idx, b)}
          onRemove={() => removeBlock(idx)}
          onMoveUp={() => moveBlock(idx, -1)}
          onMoveDown={() => moveBlock(idx, 1)}
          isFirst={idx === 0}
          isLast={idx === blocks.length - 1}
        />
      ))}

      <div className="flex gap-2 flex-wrap">
        {(['title', 'text', 'image', 'video'] as BlockType[]).map((bt) => {
          const BIcon = BLOCK_TYPE_ICONS[bt];
          return (
            <Button
              key={bt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(bt)}
              className="gap-1.5 border-dashed text-xs"
            >
              <BIcon className="w-3.5 h-3.5" />
              {t(`pcAddBlock_${bt}`)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function SectionsTab({ draft, setDraft }: { draft: PlatformConfig; setDraft: React.Dispatch<React.SetStateAction<PlatformConfig>> }) {
  const { t } = useTranslation();
  const sections = [...draft.landing.sections].sort((a, b) => a.order - b.order);
  const [expanded, setExpanded] = useState<string | null>(null);
  const sectionTypeLabels: Record<string, string> = {
    stats: t('pcSectionTypeStats'),
    stages: t('pcSectionTypeStages'),
    features: t('pcSectionTypeFeatures'),
    testimonials: t('pcSectionTypeTestimonials'),
    'teacher-application': t('pcSectionTypeTeacherApp'),
    faq: t('pcSectionTypeFaq'),
    custom: t('pcSectionTypeCustom'),
  };

  const updateSections = (secs: LandingSection[]) =>
    setDraft((d) => ({ ...d, landing: { ...d.landing, sections: secs } }));

  const move = (key: string, dir: -1 | 1) => {
    const idx = sections.findIndex((s) => s.key === key);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const reordered = [...sections];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    updateSections(reordered.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const toggleVisibility = (key: string) => {
    updateSections(sections.map((s) => (s.key === key ? { ...s, isVisible: !s.isVisible } : s)));
  };

  const patchSection = (key: string, patch: Partial<LandingSection>) => {
    updateSections(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const removeSection = (key: string) => {
    updateSections(sections.filter((s) => s.key !== key).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const addCustomSection = () => {
    const newSec: LandingSection = {
      key: `custom-${crypto.randomUUID()}`,
      type: 'custom',
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      order: sections.length + 1,
      isVisible: true,
    };
    updateSections([...sections, newSec]);
  };

  return (
    <div className="space-y-3">
      {sections.map((sec, idx) => (
        <Card key={sec.key} className={`border shadow-sm transition-all ${sec.isVisible ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(sec.key, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => move(sec.key, 1)} disabled={idx === sections.length - 1} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sec.type === 'stats' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                    sec.type === 'stages' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                    sec.type === 'features' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                    sec.type === 'testimonials' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                    sec.type === 'teacher-application' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                    sec.type === 'faq' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {sectionTypeLabels[sec.type] ?? sec.type}
                  </span>
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {sec.titleEn || sec.titleAr || sec.key}
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleVisibility(sec.key)}
                  className={`p-1.5 rounded transition-colors ${sec.isVisible ? 'text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={sec.isVisible ? t('pcSectionClickToHide') : t('pcSectionClickToShow')}
                >
                  {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === sec.key ? null : sec.key)}
                  className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
                >
                  {expanded === sec.key ? t('pcSectionClose') : t('pcSectionEdit')}
                </button>
                {sec.type === 'custom' && (
                  <button type="button" onClick={() => removeSection(sec.key)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          {expanded === sec.key && (
            <CardContent className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <BilingualInput
                labelEn={t('pcSectionTitle')}
                valueAr={sec.titleAr}
                valueEn={sec.titleEn}
                onChangeAr={(v) => patchSection(sec.key, { titleAr: v })}
                onChangeEn={(v) => patchSection(sec.key, { titleEn: v })}
              />
              <BilingualInput
                labelEn={t('pcSectionDescription')}
                valueAr={sec.descriptionAr}
                valueEn={sec.descriptionEn}
                onChangeAr={(v) => patchSection(sec.key, { descriptionAr: v })}
                onChangeEn={(v) => patchSection(sec.key, { descriptionEn: v })}
                multiline
              />
              {sec.type === 'stats' && (
                <StatsEditor section={sec} onUpdate={(s) => patchSection(sec.key, s)} />
              )}
              {sec.type === 'testimonials' && (
                <TestimonialsEditor section={sec} onUpdate={(s) => patchSection(sec.key, s)} />
              )}
              {sec.type === 'faq' && (
                <FaqEditor section={sec} onUpdate={(s) => patchSection(sec.key, s)} />
              )}
              {sec.type === 'custom' && (
                <BlocksEditor section={sec} onUpdate={(s) => patchSection(sec.key, s)} />
              )}
            </CardContent>
          )}
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addCustomSection} className="w-full border-dashed gap-2">
        <Plus className="w-4 h-4" /> {t('pcAddCustomSection')}
      </Button>
    </div>
  );
}

function SettingsTab({ draft, setDraft }: { draft: PlatformConfig; setDraft: React.Dispatch<React.SetStateAction<PlatformConfig>> }) {
  const { t } = useTranslation();
  const s = draft.settings;
  const patch = (p: Partial<typeof s>) => setDraft((d) => ({ ...d, settings: { ...d.settings, ...p } }));

  return (
    <div className="space-y-6">
      {s.maintenanceMode && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {t('pcMaintenanceModeWarning')}
          </p>
        </div>
      )}

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcFeatureToggles')}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ToggleRow label={t('pcMaintenanceMode')} checked={s.maintenanceMode} onChange={(v) => patch({ maintenanceMode: v })} />
          <ToggleRow label={t('pcEnableTeacherApps')} checked={s.enableTeacherApplications} onChange={(v) => patch({ enableTeacherApplications: v })} />
          <ToggleRow label={t('pcEnableStudentReg')} checked={s.enableStudentRegistration} onChange={(v) => patch({ enableStudentRegistration: v })} />
          <ToggleRow label={t('pcEnablePayments')} checked={s.enablePayments} onChange={(v) => patch({ enablePayments: v })} />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('commissionRate')}</Label>
        <div className="flex items-center gap-2 max-w-[160px]">
          <Input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={(s.commissionRateBps ?? 3000) / 100}
            onChange={(e) => patch({ commissionRateBps: Math.round(Number(e.target.value) * 100) })}
          />
          <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('subscriptionFlatFee')}</Label>
        <div className="flex items-center gap-2 max-w-[160px]">
          <Input
            type="number"
            min={0}
            step={1}
            value={(s.subscriptionFlatFeeCents ?? 5000) / 100}
            onChange={(e) => patch({ subscriptionFlatFeeCents: Math.round(Number(e.target.value) * 100) })}
          />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('currencyEgp')}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcContactEmail')}</Label>
        <Input
          type="email"
          value={s.contactEmail}
          onChange={(e) => patch({ contactEmail: e.target.value })}
          placeholder="info@yourplatform.com"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('pcSocialLinks')}</Label>
        {s.socialLinks.map((link, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 items-center">
            <Input value={link.platform} onChange={(e) => {
              const next = [...s.socialLinks];
              next[idx] = { ...link, platform: e.target.value };
              patch({ socialLinks: next });
            }} placeholder={t('pcSocialPlatformPlaceholder')} />
            <Input value={link.url} onChange={(e) => {
              const next = [...s.socialLinks];
              next[idx] = { ...link, url: e.target.value };
              patch({ socialLinks: next });
            }} placeholder="https://..." />
            <button type="button" onClick={() => patch({ socialLinks: s.socialLinks.filter((_, i) => i !== idx) })} className="p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => patch({ socialLinks: [...s.socialLinks, { platform: '', url: '', icon: '' }] })} className="gap-2 border-dashed">
          <Plus className="w-3.5 h-3.5" /> {t('pcAddSocialLink')}
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPlatformConfig() {
  const { t } = useTranslation();
  const { config, isLoading, updateConfig, resetToDefaults } = usePlatformConfig();
  const [draft, setDraft] = useState<PlatformConfig | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('platform');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Sync draft when config loads for the first time
  useEffect(() => {
    if (config && !draft) setDraft(JSON.parse(JSON.stringify(config)));
  }, [config, draft]);

  if (isLoading || !draft) {
    return <LoadingState variant="fullpage" />;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await updateConfig(draft);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetToDefaults();
      setDraft(null); // will re-sync from context
    } finally {
      setIsResetting(false);
      setResetConfirmOpen(false);
    }
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(config);
  // After the null guard above, draft is guaranteed to be PlatformConfig
  const setDraftNN = setDraft as React.Dispatch<React.SetStateAction<PlatformConfig>>;

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 space-y-6">
        {/* Header */}
        <PageHeader
          title={t('pcPageTitle')}
          subtitle={t('pcPageSubtitle')}
          action={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
                disabled={isResetting || isSaving}
                className="gap-2 text-slate-600 dark:text-slate-300"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                {t('pcReset')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className={`gap-2 ${saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? t('pcSaving') : saveStatus === 'saved' ? t('pcSaved') : saveStatus === 'error' ? t('pcSaveError') : t('pcSaveChanges')}
              </Button>
            </div>
          }
        />

        {isDirty && (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
            {t('pcUnsavedChanges')}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap border-b border-slate-200 dark:border-slate-800">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {activeTab === 'platform' && <PlatformTab draft={draft} setDraft={setDraftNN} />}
          {activeTab === 'navbar' && <NavbarTab draft={draft} setDraft={setDraftNN} />}
          {activeTab === 'hero' && <HeroTab draft={draft} setDraft={setDraftNN} />}
          {activeTab === 'sections' && <SectionsTab draft={draft} setDraft={setDraftNN} />}
          {activeTab === 'settings' && <SettingsTab draft={draft} setDraft={setDraftNN} />}
        </div>

        {/* Version info */}
        <div className="text-xs text-slate-400 dark:text-slate-600 text-right">
          {t('pcConfigVersion')} {draft.version}
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title={t('pcReset')}
        description={t('pcResetConfirm')}
        confirmLabel={t('pcReset')}
        cancelLabel={t('cancel')}
        tone="danger"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
