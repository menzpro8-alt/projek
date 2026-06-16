import { NextRequest, NextResponse } from 'next/server';
import puter from 'puter';
import { Difficulty, QuestionType, AIGeneratedQuestion } from '@/lib/types';

function generateFallbackQuestions(
  subject: string,
  grade: string,
  difficulty: Difficulty,
  questionCount: number,
  questionTypes: QuestionType[],
  topic: string
): AIGeneratedQuestion[] {
  const questions: AIGeneratedQuestion[] = [];
  const topicLabel = topic || subject;

  for (let i = 0; i < questionCount; i++) {
    const id = `ai-${Date.now()}-${i}`;
    const tempId = `temp-${Date.now()}-${i}`;
    const qType = questionTypes[i % questionTypes.length] || 'pilihan_ganda';

    if (qType === 'pilihan_ganda') {
      const optionLabels = ['A', 'B', 'C', 'D', 'E'];
      const correctIdx = Math.floor(Math.random() * 5);
      questions.push({
        id,
        tempId,
        type: 'pilihan_ganda',
        text: `Soal ${topicLabel} ${difficulty} #${i + 1}: Pertanyaan pilihan ganda tentang ${topicLabel} untuk kelas ${grade}.`,
        difficulty,
        options: optionLabels.map((label, idx) => ({
          id: `${id}-opt-${idx}`,
          label,
          text: `Opsi ${label} untuk soal ${i + 1}`,
          isCorrect: idx === correctIdx,
        })),
        points: difficulty === 'mudah' ? 5 : difficulty === 'sedang' ? 10 : 15,
        isSelected: true,
      });
    } else if (qType === 'pilihan_ganda_kompleks') {
      const optionLabels = ['A', 'B', 'C', 'D', 'E'];
      questions.push({
        id,
        tempId,
        type: 'pilihan_ganda_kompleks',
        text: `Soal ${topicLabel} ${difficulty} #${i + 1}: Pilih semua pernyataan yang benar tentang ${topicLabel}.`,
        difficulty,
        options: optionLabels.map((label, idx) => ({
          id: `${id}-opt-${idx}`,
          label,
          text: `Pernyataan ${label} tentang ${topicLabel}`,
          isCorrect: idx < 2,
        })),
        points: difficulty === 'mudah' ? 10 : difficulty === 'sedang' ? 15 : 20,
        isSelected: true,
      });
    } else if (qType === 'menjodohkan') {
      questions.push({
        id,
        tempId,
        type: 'menjodohkan',
        text: `Soal ${topicLabel} ${difficulty} #${i + 1}: Cocokkan item di kolom kiri dengan item di kolom kanan yang sesuai.`,
        difficulty,
        matchingPairs: [
          { id: `${id}-p1`, premise: `Item kiri 1`, response: `Item kanan 1` },
          { id: `${id}-p2`, premise: `Item kiri 2`, response: `Item kanan 2` },
          { id: `${id}-p3`, premise: `Item kiri 3`, response: `Item kanan 3` },
          { id: `${id}-p4`, premise: `Item kiri 4`, response: `Item kanan 4` },
        ],
        points: 20,
        isSelected: true,
      });
    } else if (qType === 'isian_singkat') {
      questions.push({
        id,
        tempId,
        type: 'isian_singkat',
        text: `Soal ${topicLabel} ${difficulty} #${i + 1}: Isilah jawaban singkat untuk pertanyaan tentang ${topicLabel}.`,
        difficulty,
        shortAnswerKeywords: [
          { id: `${id}-k1`, keyword: 'jawaban kunci 1' },
          { id: `${id}-k2`, keyword: 'jawaban kunci 2' },
        ],
        points: difficulty === 'mudah' ? 5 : difficulty === 'sedang' ? 10 : 15,
        isSelected: true,
      });
    } else {
      questions.push({
        id,
        tempId,
        type: 'essay',
        text: `Soal ${topicLabel} ${difficulty} #${i + 1}: Jelaskan secara rinci tentang ${topicLabel} dan berikan contoh konkrit.`,
        difficulty,
        essayReferenceAnswer: `Jawaban referensi untuk soal essay tentang ${topicLabel}. Sertakan penjelasan lengkap dan contoh yang relevan.`,
        points: difficulty === 'mudah' ? 15 : difficulty === 'sedang' ? 20 : 30,
        isSelected: true,
      });
    }
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, grade, difficulty, questionCount, questionTypes, topic } = body as {
      subject: string;
      grade: string;
      difficulty: Difficulty;
      questionCount: number;
      questionTypes: QuestionType[];
      topic?: string;
    };

    const clampedCount = Math.min(Math.max(questionCount || 5, 1), 20);

    const requestedTypes: QuestionType[] = questionTypes && questionTypes.length > 0 ? questionTypes : ['pilihan_ganda'];

    const schema: Record<string, string> = {
      pilihan_ganda: `{"type":"pilihan_ganda","text":"...","difficulty":"${difficulty}","options":[{"label":"A","text":"...","isCorrect":false},{"label":"B","text":"...","isCorrect":true},{"label":"C","text":"...","isCorrect":false},{"label":"D","text":"...","isCorrect":false},{"label":"E","text":"...","isCorrect":false}],"points":10}`,
      pilihan_ganda_kompleks: `{"type":"pilihan_ganda_kompleks","text":"...","difficulty":"${difficulty}","options":[{"label":"A","text":"...","isCorrect":true},{"label":"B","text":"...","isCorrect":true},{"label":"C","text":"...","isCorrect":false},{"label":"D","text":"...","isCorrect":false},{"label":"E","text":"...","isCorrect":false}],"points":15}`,
      menjodohkan: `{"type":"menjodohkan","text":"...","difficulty":"${difficulty}","matchingPairs":[{"premise":"left","response":"right"},{"premise":"left2","response":"right2"},{"premise":"left3","response":"right3"},{"premise":"left4","response":"right4"}],"points":20}`,
      isian_singkat: `{"type":"isian_singkat","text":"...","difficulty":"${difficulty}","shortAnswerKeywords":[{"keyword":"answer keyword"}],"points":10}`,
      essay: `{"type":"essay","text":"...","difficulty":"${difficulty}","essayReferenceAnswer":"reference answer","points":25}`,
    };

    const schemasBlock = requestedTypes.map(t => `${t}: ${schema[t]}`).join('\n');

    const prompt = `Generate ${clampedCount} Indonesian ${subject} questions (kelas ${grade}, topik: ${topic || subject}, ${difficulty}). Tipe: ${requestedTypes.join(', ')}. Hanya tentang ${subject}. Return ONLY valid JSON array.\n${schemasBlock}\nBahasa Indonesia. Exactly ${clampedCount} questions.`;

    try {
      const result = await puter.ai.chat(
        [
          {
            role: 'system',
            content:
              'You are an expert Indonesian education question generator. Generate questions in Bahasa Indonesia. Return ONLY valid JSON array without any markdown formatting or code blocks.',
          },
          { role: 'user', content: prompt },
        ]
      );

      let parsed: unknown[];
      try {
        const content = typeof result === 'string' ? result : (result?.message?.content || '');
        // Try to extract JSON array from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch {
        // Fallback to mock data
        return NextResponse.json({
          questions: generateFallbackQuestions(
            subject,
            grade,
            difficulty,
            clampedCount,
            requestedTypes,
            topic || ''
          ),
          source: 'fallback',
        });
      }

      const questions: AIGeneratedQuestion[] = (parsed as Record<string, unknown>[]).map(
        (q, i) => {
          const id = `ai-${Date.now()}-${i}`;
          const tempId = `temp-${Date.now()}-${i}`;

          return {
            id,
            tempId,
            type: (q.type as QuestionType) || requestedTypes[i % requestedTypes.length] || 'pilihan_ganda',
            text: (q.text as string) || `Soal tentang ${topic || subject}`,
            difficulty,
            options: (q.options as AIGeneratedQuestion['options'])?.map((opt, oi) => ({
              ...opt,
              id: `${id}-opt-${oi}`,
            })),
            matchingPairs: (q.matchingPairs as AIGeneratedQuestion['matchingPairs'])?.map(
              (pair, pi) => ({
                ...pair,
                id: `${id}-p${pi}`,
              })
            ),
            shortAnswerKeywords: (
              q.shortAnswerKeywords as AIGeneratedQuestion['shortAnswerKeywords']
            )?.map((kw, ki) => ({
              ...kw,
              id: `${id}-k${ki}`,
            })),
            essayReferenceAnswer: q.essayReferenceAnswer as string | undefined,
            points: (q.points as number) || 10,
            isSelected: true,
          };
        }
      );

      return NextResponse.json({ questions, source: 'ai' });
    } catch {
      // Fallback if AI call fails entirely
      return NextResponse.json({
        questions: generateFallbackQuestions(
          subject,
          grade,
          difficulty,
          clampedCount,
          requestedTypes,
          topic || ''
        ),
        source: 'fallback',
      });
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
