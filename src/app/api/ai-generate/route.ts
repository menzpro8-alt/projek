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

    const typeLabels: Record<QuestionType, string> = {
      pilihan_ganda: 'Pilihan Ganda (single choice with options A-E)',
      pilihan_ganda_kompleks: 'Pilihan Ganda Kompleks (multiple correct answers with options A-E)',
      menjodohkan: 'Menjodohkan (matching pairs - left premise to right response)',
      isian_singkat: 'Isian Singkat (short answer with keyword matching)',
      essay: 'Essay / Uraian (open-ended with reference answer)',
    };

    const requestedTypes: QuestionType[] = questionTypes && questionTypes.length > 0 ? questionTypes : ['pilihan_ganda'];
    const typesDescription = requestedTypes.map(t => `${t} (${typeLabels[t as QuestionType]})`).join(', ');

    const prompt = `Generate ${clampedCount} Indonesian education questions with the following specifications:
- Subject: ${subject}
- Class/Grade: ${grade}
- Topic: ${topic || subject}
- Difficulty: ${difficulty}
- Question Types to include: ${typesDescription}

Return ONLY a valid JSON array (no markdown, no code blocks). Each element must be an object with a "type" field indicating the question type. Depending on the "type", the structure must be:

For type "pilihan_ganda":
{"type": "pilihan_ganda", "text": "question text", "difficulty": "${difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": false}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 10}

For type "pilihan_ganda_kompleks":
{"type": "pilihan_ganda_kompleks", "text": "question text", "difficulty": "${difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": true}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 15}

For type "menjodohkan":
{"type": "menjodohkan", "text": "question text", "difficulty": "${difficulty}", "matchingPairs": [{"premise": "left item", "response": "right item"}, {"premise": "left item 2", "response": "right item 2"}, {"premise": "left item 3", "response": "right item 3"}, {"premise": "left item 4", "response": "right item 4"}], "points": 20}

For type "isian_singkat":
{"type": "isian_singkat", "text": "question text", "difficulty": "${difficulty}", "shortAnswer": "exact short answer", "points": 10}

For type "essay":
{"type": "essay", "text": "question text", "difficulty": "${difficulty}", "essayReferenceAnswer": "reference answer text", "points": 25}

Try to distribute the ${clampedCount} questions among the requested types: ${requestedTypes.join(', ')}. All questions must be in Bahasa Indonesia and appropriate for the specified grade level. Generate exactly ${clampedCount} questions.`;

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
