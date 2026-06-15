'use client';

import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faCircleDot,
  faSquareCheck,
  faRightLeft,
  faFont,
  faAlignLeft,
  faRedo,
  faTrash,
  faSave,
  faSpinner,
  faFileAlt,
  faChevronDown,
  faChevronUp,
  faMagicWandSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useExamStore } from '@/lib/store';
import { SUBJECTS, CLASS_GRADES } from '@/lib/mock-data';
import { saveGeneratedQuestions } from '@/app/actions/question';
import {
  QuestionType,
  Difficulty,
  AIGeneratedQuestion,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/lib/types';
import { toast } from 'sonner';

declare global { interface Window { puter: any; } }

// ---------------------------------------------------------------------------
// Question type card definitions (matching QuestionEditor style)
// ---------------------------------------------------------------------------
const QUESTION_TYPE_CARDS: {
  type: QuestionType;
  icon: typeof faCircleDot;
  label: string;
  subtitle: string;
}[] = [
  {
    type: 'pilihan_ganda',
    icon: faCircleDot,
    label: 'Pilihan Ganda',
    subtitle: 'Single Choice',
  },
  {
    type: 'pilihan_ganda_kompleks',
    icon: faSquareCheck,
    label: 'PG Kompleks',
    subtitle: 'Multi-Select',
  },
  {
    type: 'menjodohkan',
    icon: faRightLeft,
    label: 'Menjodohkan',
    subtitle: 'Matching',
  },
  {
    type: 'isian_singkat',
    icon: faFont,
    label: 'Isian Singkat',
    subtitle: 'Short Answer',
  },
  {
    type: 'essay',
    icon: faAlignLeft,
    label: 'Essay',
    subtitle: 'Uraian',
  },
];

// ---------------------------------------------------------------------------
// Progress step labels
// ---------------------------------------------------------------------------
const GENERATION_STEPS = [
  'Step 1/3: Analyzing subject...',
  'Step 2/3: Generating questions...',
  'Step 3/3: Validating format...',
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function AIGenerator() {
  const {
    aiSubject, setAiSubject,
    aiGrade, setAiGrade,
    aiDifficulty, setAiDifficulty,
    aiQuestionCount, setAiQuestionCount,
    aiQuestionTypes, setAiQuestionTypes,
    aiModel, setAiModel,
  } = useExamStore();

  const [topic, setTopic] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [source, setSource] = useState<string>('');
  const [generationStep, setGenerationStep] = useState(0);
  const [mixedDifficulty, setMixedDifficulty] = useState(false);
  const [mixMudah, setMixMudah] = useState(33);
  const [mixSedang, setMixSedang] = useState(34);
  const [mixSulit, setMixSulit] = useState(33);
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(new Set());

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSource('');
    setGenerationStep(0);

    const step1 = setTimeout(() => setGenerationStep(1), 800);
    const step2 = setTimeout(() => setGenerationStep(2), 1800);

    try {
      if (!window.puter) { toast.error('Puter.js belum dimuat. Silakan muat ulang halaman.'); setIsGenerating(false); return; }
      if (!window.puter.auth.isSignedIn()) {
        await window.puter.auth.signIn();
      }

      const clampedCount = Math.min(Math.max(aiQuestionCount || 5, 1), 20);
      const requestedTypes = aiQuestionTypes && aiQuestionTypes.length > 0 ? aiQuestionTypes : ['pilihan_ganda'];
      

      const subjectName = aiSubject === 'custom' ? customSubject : (SUBJECTS.find(s => s.id === aiSubject)?.name || aiSubject || 'General');
      const gradeName = CLASS_GRADES.find(c => c.id === aiGrade)?.name || aiGrade || 'General';
      const topicName = topic || subjectName;

      const typeLabels: Record<QuestionType, string> = {
        pilihan_ganda: 'Pilihan Ganda (single choice with options A-E)',
        pilihan_ganda_kompleks: 'Pilihan Ganda Kompleks (multiple correct answers with options A-E)',
        menjodohkan: 'Menjodohkan (matching pairs - left premise to right response)',
        isian_singkat: 'Isian Singkat (exact short answer)',
        essay: 'Essay / Uraian (open-ended with reference answer)',
      };

      const typesDescription = requestedTypes.map(t => `${t} (${typeLabels[t as QuestionType]})`).join(', ');

      const prompt = `Generate ${clampedCount} Indonesian education questions with the following specifications:
- Subject: ${subjectName}
- Class/Grade: ${gradeName}
- Topic: ${topicName}
- Difficulty: ${mixedDifficulty ? 'sedang' : aiDifficulty}
- Question Types to include: ${typesDescription}

STRICT RULE: The questions and answers MUST ONLY be about the specified Subject (${subjectName}) and Topic (${topicName}). If you generate questions about any other unrelated subject, it is a critical failure. All generated content must correctly match the subject!

Return ONLY a valid JSON array (no markdown, no code blocks). Each element must be an object with a "type" field indicating the question type. Depending on the "type", the structure must be:

For type "pilihan_ganda":
{"type": "pilihan_ganda", "text": "question text", "difficulty": "${mixedDifficulty ? 'sedang' : aiDifficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": false}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 10}

For type "pilihan_ganda_kompleks":
{"type": "pilihan_ganda_kompleks", "text": "question text", "difficulty": "${mixedDifficulty ? 'sedang' : aiDifficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": true}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 15}

For type "menjodohkan":
{"type": "menjodohkan", "text": "question text", "difficulty": "${mixedDifficulty ? 'sedang' : aiDifficulty}", "matchingPairs": [{"premise": "left item", "response": "right item"}, {"premise": "left item 2", "response": "right item 2"}], "points": 20}

For type "isian_singkat":
{"type": "isian_singkat", "text": "question text", "difficulty": "${mixedDifficulty ? 'sedang' : aiDifficulty}", "shortAnswer": "exact short answer", "points": 10}

For type "essay":
{"type": "essay", "text": "question text", "difficulty": "${mixedDifficulty ? 'sedang' : aiDifficulty}", "essayReferenceAnswer": "reference answer text", "points": 25}

Try to distribute the ${clampedCount} questions among the requested types: ${requestedTypes.join(', ')}. All questions must be in Bahasa Indonesia and appropriate for the specified grade level. Generate exactly ${clampedCount} questions.`;

      
      let result;
      try {
        result = await window.puter.ai.chat(prompt, aiModel ? { model: aiModel } : undefined);
      } catch (err) {
        console.warn('Puter AI with model failed, falling back to default:', err);
        result = await window.puter.ai.chat(prompt);
      }

      const content = typeof result === 'string' ? result : (result?.message?.content || '');
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response: ' + content);
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      const questions: AIGeneratedQuestion[] = (parsed as Record<string, unknown>[]).map(
        (q, i) => {
          const id = `ai-${Date.now()}-${i}`;
          const tempId = `temp-${Date.now()}-${i}`;
          return {
            id,
            tempId,
            type: (q.type as QuestionType) || requestedTypes[i % requestedTypes.length] || 'pilihan_ganda',
            text: (q.text as string) || `Soal tentang ${topicName}`,
            difficulty: mixedDifficulty ? 'sedang' : (aiDifficulty as Difficulty),
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

      setGeneratedQuestions(questions);
      setSource('ai');
      setGenerationStep(3);
    } catch (e: any) {
      console.error(e);
      setGeneratedQuestions([]);
      setSource('error: ' + (e.message || String(e)));
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationStep(0);
      }, 500);
    }
  }, [aiSubject, aiGrade, aiDifficulty, aiQuestionCount, aiQuestionTypes, aiModel, topic, mixedDifficulty]);

  const handleReroll = useCallback(async (index: number) => {
    const question = generatedQuestions[index];
    setIsGenerating(true);

    try {
      if (!window.puter.auth.isSignedIn()) {
        await window.puter.auth.signIn();
      }
      
      const typeLabels: Record<QuestionType, string> = {
        pilihan_ganda: 'Pilihan Ganda (single choice with options A-E)',
        pilihan_ganda_kompleks: 'Pilihan Ganda Kompleks (multiple correct answers with options A-E)',
        menjodohkan: 'Menjodohkan (matching pairs - left premise to right response)',
        isian_singkat: 'Isian Singkat (exact short answer)',
        essay: 'Essay / Uraian (open-ended with reference answer)',
      };
      

      const subjectName = aiSubject === 'custom' ? customSubject : (SUBJECTS.find(s => s.id === aiSubject)?.name || aiSubject || 'General');
      const gradeName = CLASS_GRADES.find(c => c.id === aiGrade)?.name || aiGrade || 'General';
      const topicName = topic || subjectName;

      const prompt = `Generate 1 Indonesian education question with the following specifications:
- Subject: ${subjectName}
- Class/Grade: ${gradeName}
- Topic: ${topicName}
- Difficulty: ${question.difficulty}
- Question Type: ${question.type} (${typeLabels[question.type]})

STRICT RULE: The questions and answers MUST ONLY be about the specified Subject (${subjectName}) and Topic (${topicName}). If you generate questions about any other unrelated subject, it is a critical failure. All generated content must correctly match the subject!

Return ONLY a valid JSON array containing exactly 1 object with a "type" field indicating the question type. Depending on the "type", the structure must be:

For type "pilihan_ganda":
{"type": "pilihan_ganda", "text": "question text", "difficulty": "${question.difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": false}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 10}

For type "pilihan_ganda_kompleks":
{"type": "pilihan_ganda_kompleks", "text": "question text", "difficulty": "${question.difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": true}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 15}

For type "menjodohkan":
{"type": "menjodohkan", "text": "question text", "difficulty": "${question.difficulty}", "matchingPairs": [{"premise": "left item", "response": "right item"}], "points": 20}

For type "isian_singkat":
{"type": "isian_singkat", "text": "question text", "difficulty": "${question.difficulty}", "shortAnswer": "exact short answer", "points": 10}

For type "essay":
{"type": "essay", "text": "question text", "difficulty": "${question.difficulty}", "essayReferenceAnswer": "reference answer text", "points": 25}
`;

      
      let result;
      try {
        result = await window.puter.ai.chat(prompt, aiModel ? { model: aiModel } : undefined);
      } catch (err) {
        console.warn('Puter AI with model failed, falling back to default:', err);
        result = await window.puter.ai.chat(prompt);
      }

      const content = typeof result === 'string' ? result : (result?.message?.content || '');
      
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found: ' + content);
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.length > 0) {
        const q = parsed[0];
        const id = `ai-${Date.now()}`;
        const newQ: AIGeneratedQuestion = {
          id,
          tempId: `temp-${Date.now()}`,
          type: (q.type as QuestionType) || question.type,
          text: (q.text as string) || `Soal tentang ${topicName}`,
          difficulty: question.difficulty,
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

        setGeneratedQuestions(prev => {
          const updated = [...prev];
          updated[index] = newQ;
          return updated;
        });
      }
    } catch (e: any) {
      console.error(e);
      // keep the existing question on failure
    } finally {
      setIsGenerating(false);
    }
  }, [generatedQuestions, aiSubject, aiGrade, aiModel, topic]);

  const handleDelete = useCallback((index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleToggleSelect = useCallback((index: number) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) =>
        i === index ? { ...q, isSelected: !q.isSelected } : q
      )
    );
  }, []);

  const handleUpdateText = useCallback((index: number, text: string) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, text } : q))
    );
  }, []);

  const handleUpdateOptionText = useCallback(
    (qIndex: number, optIndex: number, text: string) => {
      setGeneratedQuestions(prev =>
        prev.map((q, i) => {
          if (i !== qIndex || !q.options) return q;
          return {
            ...q,
            options: q.options.map((opt, oi) =>
              oi === optIndex ? { ...opt, text } : opt
            ),
          };
        })
      );
    },
    []
  );

  const handleUpdatePair = useCallback(
    (qIndex: number, pairIndex: number, field: 'premise' | 'response', value: string) => {
      setGeneratedQuestions(prev =>
        prev.map((q, i) => {
          if (i !== qIndex || !q.matchingPairs) return q;
          return {
            ...q,
            matchingPairs: q.matchingPairs.map((pair, pi) =>
              pi === pairIndex ? { ...pair, [field]: value } : pair
            ),
          };
        })
      );
    },
    []
  );

  const handleUpdateKeyword = useCallback(
    (qIndex: number, kwIndex: number, keyword: string) => {
      setGeneratedQuestions(prev =>
        prev.map((q, i) => {
          if (i !== qIndex || !q.shortAnswerKeywords) return q;
          return {
            ...q,
            shortAnswerKeywords: q.shortAnswerKeywords.map((kw, ki) =>
              ki === kwIndex ? { ...kw, keyword } : kw
            ),
          };
        })
      );
    },
    []
  );

  const handleUpdateEssayRef = useCallback((qIndex: number, essayReferenceAnswer: string) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) => (i === qIndex ? { ...q, essayReferenceAnswer } : q))
    );
  }, []);

  const handleSaveAll = useCallback(async () => {
    const selected = generatedQuestions.filter(q => q.isSelected);
    if (selected.length === 0) return;
    
    const subjectName = aiSubject === 'custom' ? customSubject : (SUBJECTS.find(s => s.id === aiSubject)?.name || aiSubject || 'General');
    const gradeName = CLASS_GRADES.find(c => c.id === aiGrade)?.name || aiGrade || 'General';
    const topicName = topic || subjectName;

    const result = await saveGeneratedQuestions(selected, subjectName, gradeName, topicName);
    
    if (result.success) {
      toast.success(`${result.count} soal berhasil disimpan!`, {
        description: 'Semua soal terpilih telah ditambahkan ke database Supabase.',
      });
      // Optionally clear after saving
      // setGeneratedQuestions(generatedQuestions.filter(q => !q.isSelected));
    } else {
      toast.error('Gagal menyimpan soal', {
        description: result.error,
      });
    }
  }, [generatedQuestions, aiSubject, customSubject, aiGrade, topic]);

  const handleSaveDraft = useCallback(() => {
    const selected = generatedQuestions.filter(q => q.isSelected);
    toast.success(`${selected.length} soal disimpan sebagai draft`, {
      description: 'Soal disimpan sebagai draft dan dapat diedit nanti.',
    });
  }, [generatedQuestions]);

  const handleClearAll = useCallback(() => {
    setGeneratedQuestions([]);
    setSource('');
  }, []);

  const toggleCollapse = useCallback((tempId: string) => {
    setCollapsedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  }, []);

  const selectedCount = generatedQuestions.filter(q => q.isSelected).length;

  const getTypeIcon = (type: QuestionType) => {
    const found = QUESTION_TYPE_CARDS.find(t => t.type === type);
    return found ? found.icon : faCircleDot;
  };

  const getTypeSubtitle = (type: QuestionType) => {
    const found = QUESTION_TYPE_CARDS.find(t => t.type === type);
    return found ? found.subtitle : '';
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel - Configuration Form */}
        <div className="w-full lg:w-[420px] shrink-0">
          <Card className="border border-slate-200 overflow-hidden">
            {/* Gradient header bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#5B6ABF] to-[#7B8AD4]" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2D3436' }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B6ABF] to-[#7B8AD4] flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} className="text-white text-sm" />
                </div>
                AI Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                  Mata Pelajaran
                </Label>
                <Select value={aiSubject} onValueChange={setAiSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Lainnya / Ketik Manual...</SelectItem>
                  </SelectContent>
                </Select>
                {aiSubject === 'custom' && (
                  <Input
                    placeholder="Ketik mata pelajaran..."
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Class/Grade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                  Kelas
                </Label>
                <Select value={aiGrade} onValueChange={setAiGrade}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_GRADES.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* Model Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                  AI Model (Puter)
                </Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Model AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="meta-llama/Llama-3-70b-chat-hf">Llama 3 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                  Topik
                </Label>
                <Input
                  placeholder="Masukkan topik spesifik (opsional)"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                    Tingkat Kesulitan
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-[11px]" style={{ color: '#636e72' }}>
                      Campuran
                    </Label>
                    <Switch
                      checked={mixedDifficulty}
                      onCheckedChange={setMixedDifficulty}
                    />
                  </div>
                </div>

                {!mixedDifficulty ? (
                  <div className="flex gap-2">
                    {(['mudah', 'sedang', 'sulit'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setAiDifficulty(d)}
                        className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          aiDifficulty === d
                            ? d === 'mudah'
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : d === 'sedang'
                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                : 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {DIFFICULTY_LABELS[d]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-700 font-medium">Mudah</span>
                        <span className="text-xs font-mono" style={{ color: '#2D3436' }}>{mixMudah}%</span>
                      </div>
                      <Slider
                        value={[mixMudah]}
                        onValueChange={([v]) => setMixMudah(v)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-700 font-medium">Sedang</span>
                        <span className="text-xs font-mono" style={{ color: '#2D3436' }}>{mixSedang}%</span>
                      </div>
                      <Slider
                        value={[mixSedang]}
                        onValueChange={([v]) => setMixSedang(v)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-red-700 font-medium">Sulit</span>
                        <span className="text-xs font-mono" style={{ color: '#2D3436' }}>{mixSulit}%</span>
                      </div>
                      <Slider
                        value={[mixSulit]}
                        onValueChange={([v]) => setMixSulit(v)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <p className="text-[10px] text-center" style={{ color: '#b2bec3' }}>
                      Persentase akan disesuaikan secara proporsional
                    </p>
                  </div>
                )}
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                  Jumlah Soal
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={aiQuestionCount}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setAiQuestionCount(Math.min(Math.max(val, 1), 20));
                    }
                  }}
                />
                <p className="text-[11px]" style={{ color: '#636e72' }}>Rentang: 1 - 20 soal</p>
              </div>

              {/* Question Type - Card style selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium" style={{ color: '#2D3436' }}>
                    Tipe Soal
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      if (aiQuestionTypes.length === QUESTION_TYPE_CARDS.length) {
                        setAiQuestionTypes(['pilihan_ganda']);
                      } else {
                        setAiQuestionTypes(QUESTION_TYPE_CARDS.map(c => c.type));
                      }
                    }}
                  >
                    {aiQuestionTypes.length === QUESTION_TYPE_CARDS.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {QUESTION_TYPE_CARDS.map(({ type, icon, label, subtitle }) => {
                    const isSelected = aiQuestionTypes.includes(type);
                    return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (isSelected && aiQuestionTypes.length > 1) {
                          setAiQuestionTypes(aiQuestionTypes.filter(t => t !== type));
                        } else if (!isSelected) {
                          setAiQuestionTypes([...aiQuestionTypes, type]);
                        }
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'border-[#5B6ABF] bg-[#5B6ABF]/10'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={icon}
                        className={`text-sm ${
                          isSelected ? 'text-[#5B6ABF]' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-[10px] leading-tight ${
                          isSelected ? 'text-[#5B6ABF] font-medium' : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-[8px] text-slate-400 leading-tight">
                        {subtitle}
                      </span>
                    </button>
                  )})}
                </div>
              </div>

              {/* Generate Button */}
              <div className="space-y-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiSubject || !aiGrade}
                  className="w-full h-12 text-white font-medium text-sm relative overflow-hidden"
                  style={{ backgroundColor: '#5B6ABF' }}
                >
                  {/* Shimmer animation */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
                  )}
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Generating with AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBolt} />
                      Generate with AI
                    </span>
                  )}
                </Button>
                {/* Progress step indicator */}
                {isGenerating && generationStep > 0 && generationStep <= 3 && (
                  <div className="text-center">
                    <p className="text-xs font-medium animate-pulse" style={{ color: '#5B6ABF' }}>
                      {GENERATION_STEPS[generationStep - 1]}
                    </p>
                  </div>
                )}
              </div>

              {source && source !== 'error' && (
                <p className="text-[11px] text-center" style={{ color: '#636e72' }}>
                  Sumber: {source === 'ai' ? 'AI Generated' : 'Fallback (Mock Data)'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Staging Review */}
        <div className="flex-1 min-w-0">
          <Card className="border border-slate-200 h-full flex flex-col overflow-hidden">
            {/* Gradient header */}
            <div className="h-1 bg-gradient-to-r from-[#5B6ABF] to-[#7B8AD4]" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2D3436' }}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} className="text-[#5B6ABF]" />
                  Generated Questions - Review &amp; Edit
                </CardTitle>
                {generatedQuestions.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2.5 py-1"
                    style={{ backgroundColor: '#EEF0FB', color: '#5B6ABF' }}
                  >
                    {selectedCount} of {generatedQuestions.length} selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
              {generatedQuestions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center" style={{ color: '#636e72' }}>
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <FontAwesomeIcon
                        icon={faBolt}
                        className="text-2xl text-slate-300"
                      />
                    </div>
                    <p className="text-sm">
                      Konfigurasikan pengaturan di sebelah kiri, lalu klik
                      &ldquo;Generate with AI&rdquo; untuk membuat soal.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 max-h-[calc(100vh-340px)]">
                    <div className="space-y-3 pr-3">
                      {generatedQuestions.map((q, index) => {
                        const isCollapsed = collapsedQuestions.has(q.tempId);
                        return (
                          <div
                            key={q.tempId}
                            className={`rounded-xl border-2 transition-all overflow-hidden ${
                              q.isSelected
                                ? 'border-slate-200 bg-white'
                                : 'border-slate-100 bg-slate-50/60 opacity-70'
                            }`}
                          >
                            {/* Question Header */}
                            <div className="flex items-start gap-3 p-4">
                              {/* Toggle Switch */}
                              <div className="pt-0.5">
                                <Switch
                                  checked={q.isSelected}
                                  onCheckedChange={() => handleToggleSelect(index)}
                                />
                              </div>

                              {/* Question number badge + info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  {/* Number badge */}
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white shrink-0"
                                    style={{ backgroundColor: '#5B6ABF' }}
                                  >
                                    {index + 1}
                                  </span>
                                  {/* Type badge */}
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#5B6ABF]/10 text-[#5B6ABF]">
                                    <FontAwesomeIcon icon={getTypeIcon(q.type)} className="text-[8px]" />
                                    {QUESTION_TYPE_LABELS[q.type]}
                                  </span>
                                  {/* Difficulty badge */}
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 ${DIFFICULTY_COLORS[q.difficulty]}`}
                                  >
                                    {DIFFICULTY_LABELS[q.difficulty]}
                                  </Badge>
                                  {/* Points */}
                                  <span className="text-[10px] ml-auto" style={{ color: '#b2bec3' }}>
                                    {q.points} poin
                                  </span>
                                </div>

                                {/* Question text */}
                                <Textarea
                                  value={q.text}
                                  onChange={e => handleUpdateText(index, e.target.value)}
                                  className="mb-0 min-h-[50px] text-sm resize-none"
                                  style={{ color: '#2D3436' }}
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReroll(index)}
                                      disabled={isGenerating}
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-[#5B6ABF]"
                                    >
                                      <FontAwesomeIcon icon={faRedo} className="text-xs" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Regenerate just this question</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(index)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B6B]"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                </Button>
                              </div>
                            </div>

                            {/* Collapsible details section */}
                            <Collapsible
                              open={!isCollapsed}
                              onOpenChange={() => toggleCollapse(q.tempId)}
                            >
                              <div className="px-4 pb-1">
                                <CollapsibleTrigger asChild>
                                  <button className="flex items-center gap-1.5 text-[11px] font-medium mb-2 hover:text-[#5B6ABF] transition-colors" style={{ color: '#636e72' }}>
                                    <FontAwesomeIcon
                                      icon={isCollapsed ? faChevronDown : faChevronUp}
                                      className="text-[8px]"
                                    />
                                    {isCollapsed ? 'Show Details' : 'Hide Details'}
                                  </button>
                                </CollapsibleTrigger>
                              </div>
                              <CollapsibleContent>
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                                  {/* Type-specific content */}
                                  {q.type === 'pilihan_ganda' && q.options && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>Pilihan Jawaban</p>
                                      {q.options.map((opt, oi) => (
                                        <div key={opt.id || oi} className="flex items-center gap-2">
                                          <span
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                              opt.isCorrect
                                                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}
                                          >
                                            {opt.label}
                                          </span>
                                          <Input
                                            value={opt.text}
                                            onChange={e =>
                                              handleUpdateOptionText(index, oi, e.target.value)
                                            }
                                            className="text-sm h-8"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {q.type === 'pilihan_ganda_kompleks' && q.options && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>Pilihan Jawaban</p>
                                      {q.options.map((opt, oi) => (
                                        <div key={opt.id || oi} className="flex items-center gap-2">
                                          <span
                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                                              opt.isCorrect
                                                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}
                                          >
                                            {opt.label}
                                          </span>
                                          <Input
                                            value={opt.text}
                                            onChange={e =>
                                              handleUpdateOptionText(index, oi, e.target.value)
                                            }
                                            className="text-sm h-8"
                                          />
                                        </div>
                                      ))}
                                      <p className="text-[10px]" style={{ color: '#636e72' }}>
                                        Jawaban benar ditandai dengan highlight hijau
                                      </p>
                                    </div>
                                  )}

                                  {q.type === 'menjodohkan' && q.matchingPairs && (
                                    <div className="space-y-4 mt-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>
                                        Pasangan Tarik Garis (Kunci Jawaban)
                                      </p>
                                      <div className="flex flex-col gap-3 relative">
                                        {q.matchingPairs.map((pair, pi) => (
                                          <div key={pair.id || pi} className="flex items-center gap-0">
                                            {/* Kotak Kiri (Premise) */}
                                            <div className="flex-1 relative bg-slate-50 p-1.5 rounded-lg border border-slate-200 z-10">
                                              <Input
                                                value={pair.premise}
                                                onChange={e =>
                                                  handleUpdatePair(index, pi, 'premise', e.target.value)
                                                }
                                                className="text-sm h-8 bg-white border-slate-200"
                                                placeholder="Pernyataan Kiri"
                                              />
                                              {/* Titik Konektor Kiri */}
                                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#5B6ABF] rounded-full translate-x-[7px] border-2 border-white shadow-sm" />
                                            </div>

                                            {/* Garis Penghubung Tengah */}
                                            <div className="w-12 h-[2px] bg-gradient-to-r from-[#5B6ABF] to-[#00b894] opacity-50 z-0" />

                                            {/* Kotak Kanan (Response) */}
                                            <div className="flex-1 relative bg-slate-50 p-1.5 rounded-lg border border-slate-200 z-10">
                                              {/* Titik Konektor Kanan */}
                                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#00b894] rounded-full -translate-x-[7px] border-2 border-white shadow-sm" />
                                              <Input
                                                value={pair.response}
                                                onChange={e =>
                                                  handleUpdatePair(index, pi, 'response', e.target.value)
                                                }
                                                className="text-sm h-8 bg-white border-slate-200"
                                                placeholder="Jawaban Kanan"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {q.type === 'isian_singkat' && q.shortAnswerKeywords && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>
                                        Kata Kunci Jawaban
                                      </p>
                                      {q.shortAnswerKeywords.map((kw, ki) => (
                                        <div key={kw.id || ki} className="flex items-center gap-2">
                                          <Input
                                            value={kw.keyword}
                                            onChange={e =>
                                              handleUpdateKeyword(index, ki, e.target.value)
                                            }
                                            className="text-sm h-8"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {q.type === 'essay' && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>
                                        Jawaban Referensi
                                      </p>
                                      <Textarea
                                        value={q.essayReferenceAnswer || ''}
                                        onChange={e => handleUpdateEssayRef(index, e.target.value)}
                                        className="text-sm min-h-[60px]"
                                      />
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <Button
                      onClick={handleSaveAll}
                      disabled={selectedCount === 0}
                      className="flex-1 text-white font-medium h-10"
                      style={{ backgroundColor: '#5B6ABF' }}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save {selectedCount} Question{selectedCount !== 1 ? 's' : ''}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={selectedCount === 0}
                      className="border-[#5B6ABF]/30 text-[#5B6ABF] hover:bg-[#5B6ABF]/5 h-10"
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" />
                      Save as Draft
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      className="border-slate-300 text-slate-500 hover:text-[#FF6B6B] hover:border-[#FF6B6B]/30 h-10"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
                      Clear All
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shimmer animation keyframe */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </TooltipProvider>
  );
}
