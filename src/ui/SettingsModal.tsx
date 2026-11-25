import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Volume2, VolumeX, Music, Bell, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}: SettingsModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto border-b border-[#d4af37]/25 pb-4 mb-6">
        <button
          id="btn-close-settings"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#faf7f0]/80 hover:text-[#faf7f0] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>العودة للقائمة</span>
        </button>

        <div className="text-[11px] font-mono text-[#d4af37] uppercase tracking-widest">
          SYSTEM CONFIG • الإعدادات
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-full max-w-2xl mx-auto my-auto py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-sm bg-[#160f0a] border border-[#d4af37]/40 shadow-xl space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif-court text-[#faf7f0]">
              إعدادات المحاكمة والنظام
            </h2>
            <p className="text-xs text-[#faf7f0]/65 font-body-court">
              تخصيص الأصوات والمؤثرات البيئية وإدارة سجل الحفظ.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Master Sound Toggle */}
            <div className="flex items-center justify-between p-4 rounded-sm bg-black/40 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-[#d4af37]/15 text-[#d4af37]">
                  {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold font-serif-court text-[#faf7f0]">الصوت العام</div>
                  <div className="text-[11px] text-white/50">تفعيل أو كتم كافة أصوات اللعبة</div>
                </div>
              </div>

              <button
                onClick={() => onUpdateSettings({ sound: !settings.sound })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.sound ? 'bg-[#d4af37]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#1a1008] absolute top-1 transition-all ${
                    settings.sound ? 'right-1' : 'right-7'
                  }`}
                />
              </button>
            </div>

            {/* Ambient Ambience Toggle */}
            <div className="flex items-center justify-between p-4 rounded-sm bg-black/40 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-[#d4af37]/15 text-[#d4af37]">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold font-serif-court text-[#faf7f0]">أجواء القاعة</div>
                  <div className="text-[11px] text-white/50">هدير الهواء المحيط وأصوات الحضور بالقاعة</div>
                </div>
              </div>

              <button
                onClick={() => onUpdateSettings({ music: !settings.music })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.music ? 'bg-[#d4af37]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#1a1008] absolute top-1 transition-all ${
                    settings.music ? 'right-1' : 'right-7'
                  }`}
                />
              </button>
            </div>

            {/* SFX Desk Sounds */}
            <div className="flex items-center justify-between p-4 rounded-sm bg-black/40 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-[#d4af37]/15 text-[#d4af37]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold font-serif-court text-[#faf7f0]">مؤثرات المنصة (SFX)</div>
                  <div className="text-[11px] text-white/50">طرق المطرقة، حفيف الأوراق، ونقر المصباح</div>
                </div>
              </div>

              <button
                onClick={() => onUpdateSettings({ sfx: !settings.sfx })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.sfx ? 'bg-[#d4af37]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#1a1008] absolute top-1 transition-all ${
                    settings.sfx ? 'right-1' : 'right-7'
                  }`}
                />
              </button>
            </div>

            {/* Language Display */}
            <div className="flex items-center justify-between p-4 rounded-sm bg-black/40 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-[#d4af37]/15 text-[#d4af37]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold font-serif-court text-[#faf7f0]">لغة واجهة المحاكمة</div>
                  <div className="text-[11px] text-white/50">المصطلحات القضائية الرسمية</div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xs bg-[#d4af37]/20 border border-[#d4af37]/30 text-xs font-serif-court text-[#d4af37] font-semibold">
                العربية (المصرية)
              </span>
            </div>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-sm bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-serif-court cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>إعادة ضبط سجل القضايا والتقدم</span>
              </button>
            ) : (
              <div className="p-4 rounded-sm bg-rose-950/60 border border-rose-600/50 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-rose-300 text-xs font-bold font-serif-court">
                  <AlertTriangle className="w-4 h-4" />
                  <span>هل أنت متأكد من مسح كافة القضايا المكتملة وإعادة قفلها؟</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setShowResetConfirm(false);
                    }}
                    className="px-4 py-1.5 rounded-sm bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer font-serif-court"
                  >
                    تأكيد المسح
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white/80 text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-2xl mx-auto pt-4 text-[11px] text-white/40 font-mono flex items-center justify-between border-t border-white/5">
        <div>THE COURT • PREFERENCES</div>
        <div>SETTINGS AUTO-SAVED</div>
      </div>
    </div>
  );
}
