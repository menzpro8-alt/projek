'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { useAntiCheat } from '@/hooks/use-anti-cheat';

export default function AntiCheatOverlay() {
  const { strikes, showOverlay, dismissOverlay } = useAntiCheat();
  const isExamOver = strikes >= 3;

  if (!showOverlay) return null;

  return (
    <div className="anticheat-overlay">
      <div className="text-center px-6 max-w-md">
        {/* Warning Icon */}
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon
            icon={isExamOver ? faWarning : faShieldAlt}
            className="text-5xl text-white"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-3">
          PERINGATAN!
        </h2>

        {/* Message */}
        {isExamOver ? (
          <>
            <p className="text-white/90 text-lg mb-4">
              Ujian Anda telah diserahkan otomatis.
            </p>
            <p className="text-white/70 text-sm mb-6">
              Anda telah melanggar aturan ujian sebanyak 3 kali.
              Sistem secara otomatis mengumpulkan jawaban Anda.
            </p>
          </>
        ) : (
          <>
            <p className="text-white/90 text-lg mb-4">
              Anda telah meninggalkan halaman ujian.
            </p>
            <p className="text-white/70 text-sm mb-6">
              Mengganti tab atau meninggalkan halaman selama ujian berlangsung
              adalah pelanggaran. Harap tetap pada halaman ujian.
            </p>
          </>
        )}

        {/* Strike Counter */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-white/80 text-sm mr-1">Strike:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faWarning}
              className={`text-xl ${
                i < strikes ? 'text-white' : 'text-white/30'
              }`}
            />
          ))}
          <span className="text-white/80 text-sm ml-1">
            {strikes} dari 3
          </span>
        </div>

        {/* Back Button */}
        {!isExamOver && (
          <Button
            onClick={dismissOverlay}
            size="lg"
            className="bg-white text-coral hover:bg-white/90 font-semibold px-8"
          >
            Kembali ke Ujian
          </Button>
        )}
      </div>
    </div>
  );
}
