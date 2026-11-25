"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Award, ArrowRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { QuizQuestionData } from "@/types";
import { trackClientActivity } from "@/lib/client-storage";

interface CoupleQuizProps {
  questions: QuizQuestionData[];
}

export default function CoupleQuiz({ questions }: CoupleQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIdx];
  const isCorrect = selectedOption === currentQ.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
      });

      await trackClientActivity({
        actionType: "QUIZ_COMPLETED",
        title: `İlişki Quizi Tamamlandı! Skor: ${score} / ${questions.length} 🏆`,
        detail: `${questions.length} sorudan ${score} tanesini doğru bildi!`,
        metadata: { score, total: questions.length },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            Tatlı Yarışma
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wine">
            &ldquo;Bizi Ne Kadar Tanıyorsun?&rdquo; Quiz 💕
          </h3>
        </div>
        {!isFinished && (
          <span className="px-3.5 py-1.5 rounded-full bg-powder text-wine text-xs font-bold">
            Soru {currentIdx + 1} / {questions.length}
          </span>
        )}
      </div>

      {!isFinished ? (
        <div>
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-rosewarm/25 mb-4">
            <p className="font-serif text-lg sm:text-xl font-bold text-wine leading-snug">
              {currentQ.question}
            </p>
          </div>

          <div className="space-y-2.5 mb-5">
            {currentQ.options.map((opt, idx) => {
              const isPicked = selectedOption === idx;
              const isRightOption = idx === currentQ.correctIndex;

              let btnStyle =
                "bg-white/90 hover:bg-powder/70 text-wine border-rosewarm/25";
              if (selectedOption !== null) {
                if (isRightOption) {
                  btnStyle =
                    "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                } else if (isPicked) {
                  btnStyle = "bg-rose-100 border-rose-500 text-rose-900";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isRightOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {selectedOption !== null && isPicked && !isRightOption && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-powder/80 border border-rosewarm/30 text-xs sm:text-sm text-wine font-medium">
                {isCorrect ? "🎉 Doğru Cevap! " : "🙈 Olsun, yine de çok tatlısın! "}
                {currentQ.rewardMessage || "Seninle her anımız çok özel 💖"}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>
                  {currentIdx + 1 === questions.length
                    ? "Sonucu Gör & Quizi Bitir 🏆"
                    : "Sonraki Soruya Geç"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-powder mx-auto flex items-center justify-center text-wine">
            <Award className="w-9 h-9 text-rosewarm" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-wine">
            Harikasın Sevgilim! 🎉
          </h4>
          <p className="text-base font-bold text-rosewarm">
            Skorun: {score} / {questions.length}
          </p>
          <p className="text-sm text-[#6D2E46] max-w-md mx-auto">
            Skorun ne olursa olsun kalbimin tek şampiyonu her zaman sensin! Sonucun bana iletildi bile 💝
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-powder text-wine text-xs font-bold hover:bg-rosewarm hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Çöz</span>
          </button>
        </div>
      )}
    </div>
  );
}
