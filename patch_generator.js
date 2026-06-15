const fs = require('fs');

const file = 'src/components/teacher/AIGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add puter import
content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport puter from 'puter';");

// 2. Update useExamStore destructuring
content = content.replace(
`    aiQuestionTypes, setAiQuestionTypes,
  } = useExamStore();`,
`    aiQuestionTypes, setAiQuestionTypes,
    aiModel, setAiModel,
  } = useExamStore();`
);

// 3. Add aiModel UI
const modelUI = `
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
`;

content = content.replace(
`              {/* Topic */}
              <div className="space-y-2">`,
modelUI + `
              {/* Topic */}
              <div className="space-y-2">`
);

// 4. Replace handleGenerate & handleReroll
const newHandleGenerate = `
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSource('');
    setGenerationStep(0);

    const step1 = setTimeout(() => setGenerationStep(1), 800);
    const step2 = setTimeout(() => setGenerationStep(2), 1800);

    try {
      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn();
      }

      const clampedCount = Math.min(Math.max(aiQuestionCount || 5, 1), 20);
      const requestedTypes = aiQuestionTypes && aiQuestionTypes.length > 0 ? aiQuestionTypes : ['pilihan_ganda'];
      
      const typeLabels: Record<QuestionType, string> = {
        pilihan_ganda: 'Pilihan Ganda (single choice with options A-E)',
        pilihan_ganda_kompleks: 'Pilihan Ganda Kompleks (multiple correct answers with options A-E)',
        menjodohkan: 'Menjodohkan (matching pairs - left premise to right response)',
        isian_singkat: 'Isian Singkat (short answer with keyword matching)',
        essay: 'Essay / Uraian (open-ended with reference answer)',
      };

      const typesDescription = requestedTypes.map(t => \`\${t} (\${typeLabels[t as QuestionType]})\`).join(', ');

      const prompt = \`Generate \${clampedCount} Indonesian education questions with the following specifications:
- Subject: \${aiSubject}
- Class/Grade: \${aiGrade}
- Topic: \${topic || aiSubject}
- Difficulty: \${mixedDifficulty ? 'sedang' : aiDifficulty}
- Question Types to include: \${typesDescription}

Return ONLY a valid JSON array (no markdown, no code blocks). Each element must be an object with a "type" field indicating the question type. Depending on the "type", the structure must be:

For type "pilihan_ganda":
{"type": "pilihan_ganda", "text": "question text", "difficulty": "\${mixedDifficulty ? 'sedang' : aiDifficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": false}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 10}

For type "pilihan_ganda_kompleks":
{"type": "pilihan_ganda_kompleks", "text": "question text", "difficulty": "\${mixedDifficulty ? 'sedang' : aiDifficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": true}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 15}

For type "menjodohkan":
{"type": "menjodohkan", "text": "question text", "difficulty": "\${mixedDifficulty ? 'sedang' : aiDifficulty}", "matchingPairs": [{"premise": "left item", "response": "right item"}, {"premise": "left item 2", "response": "right item 2"}], "points": 20}

For type "isian_singkat":
{"type": "isian_singkat", "text": "question text", "difficulty": "\${mixedDifficulty ? 'sedang' : aiDifficulty}", "shortAnswerKeywords": [{"keyword": "answer keyword"}], "points": 10}

For type "essay":
{"type": "essay", "text": "question text", "difficulty": "\${mixedDifficulty ? 'sedang' : aiDifficulty}", "essayReferenceAnswer": "reference answer text", "points": 25}

Try to distribute the \${clampedCount} questions among the requested types: \${requestedTypes.join(', ')}. All questions must be in Bahasa Indonesia and appropriate for the specified grade level. Generate exactly \${clampedCount} questions.\`;

      const result = await puter.ai.chat(prompt, { model: aiModel });
      const content = typeof result === 'string' ? result : (result?.message?.content || '');
      
      const jsonMatch = content.match(/\\[[\\s\\S]*\\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response: ' + content);
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      const questions: AIGeneratedQuestion[] = (parsed as Record<string, unknown>[]).map(
        (q, i) => {
          const id = \`ai-\${Date.now()}-\${i}\`;
          const tempId = \`temp-\${Date.now()}-\${i}\`;
          return {
            id,
            tempId,
            type: (q.type as QuestionType) || requestedTypes[i % requestedTypes.length] || 'pilihan_ganda',
            text: (q.text as string) || \`Soal tentang \${topic || aiSubject}\`,
            difficulty: mixedDifficulty ? 'sedang' : (aiDifficulty as Difficulty),
            options: (q.options as AIGeneratedQuestion['options'])?.map((opt, oi) => ({
              ...opt,
              id: \`\${id}-opt-\${oi}\`,
            })),
            matchingPairs: (q.matchingPairs as AIGeneratedQuestion['matchingPairs'])?.map(
              (pair, pi) => ({
                ...pair,
                id: \`\${id}-p\${pi}\`,
              })
            ),
            shortAnswerKeywords: (
              q.shortAnswerKeywords as AIGeneratedQuestion['shortAnswerKeywords']
            )?.map((kw, ki) => ({
              ...kw,
              id: \`\${id}-k\${ki}\`,
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
      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn();
      }
      
      const typeLabels: Record<QuestionType, string> = {
        pilihan_ganda: 'Pilihan Ganda (single choice with options A-E)',
        pilihan_ganda_kompleks: 'Pilihan Ganda Kompleks (multiple correct answers with options A-E)',
        menjodohkan: 'Menjodohkan (matching pairs - left premise to right response)',
        isian_singkat: 'Isian Singkat (short answer with keyword matching)',
        essay: 'Essay / Uraian (open-ended with reference answer)',
      };
      
      const prompt = \`Generate 1 Indonesian education question with the following specifications:
- Subject: \${aiSubject}
- Class/Grade: \${aiGrade}
- Topic: \${topic || aiSubject}
- Difficulty: \${question.difficulty}
- Question Type: \${question.type} (\${typeLabels[question.type]})

Return ONLY a valid JSON array containing exactly 1 object with a "type" field indicating the question type. Depending on the "type", the structure must be:

For type "pilihan_ganda":
{"type": "pilihan_ganda", "text": "question text", "difficulty": "\${question.difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": false}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 10}

For type "pilihan_ganda_kompleks":
{"type": "pilihan_ganda_kompleks", "text": "question text", "difficulty": "\${question.difficulty}", "options": [{"label": "A", "text": "option text", "isCorrect": true}, {"label": "B", "text": "option text", "isCorrect": true}, {"label": "C", "text": "option text", "isCorrect": false}, {"label": "D", "text": "option text", "isCorrect": false}, {"label": "E", "text": "option text", "isCorrect": false}], "points": 15}

For type "menjodohkan":
{"type": "menjodohkan", "text": "question text", "difficulty": "\${question.difficulty}", "matchingPairs": [{"premise": "left item", "response": "right item"}], "points": 20}

For type "isian_singkat":
{"type": "isian_singkat", "text": "question text", "difficulty": "\${question.difficulty}", "shortAnswerKeywords": [{"keyword": "answer keyword"}], "points": 10}

For type "essay":
{"type": "essay", "text": "question text", "difficulty": "\${question.difficulty}", "essayReferenceAnswer": "reference answer text", "points": 25}
\`;

      const result = await puter.ai.chat(prompt, { model: aiModel });
      const content = typeof result === 'string' ? result : (result?.message?.content || '');
      
      const jsonMatch = content.match(/\\[[\\s\\S]*\\]/);
      if (!jsonMatch) throw new Error('No JSON array found: ' + content);
      
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.length > 0) {
        const q = parsed[0];
        const id = \`ai-\${Date.now()}\`;
        const newQ: AIGeneratedQuestion = {
          id,
          tempId: \`temp-\${Date.now()}\`,
          type: (q.type as QuestionType) || question.type,
          text: (q.text as string) || \`Soal tentang \${topic || aiSubject}\`,
          difficulty: question.difficulty,
          options: (q.options as AIGeneratedQuestion['options'])?.map((opt, oi) => ({
            ...opt,
            id: \`\${id}-opt-\${oi}\`,
          })),
          matchingPairs: (q.matchingPairs as AIGeneratedQuestion['matchingPairs'])?.map(
            (pair, pi) => ({
              ...pair,
              id: \`\${id}-p\${pi}\`,
            })
          ),
          shortAnswerKeywords: (
            q.shortAnswerKeywords as AIGeneratedQuestion['shortAnswerKeywords']
          )?.map((kw, ki) => ({
            ...kw,
            id: \`\${id}-k\${ki}\`,
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
`;

// Replace everything from handleGenerate to the end of handleReroll
const regex = /const handleGenerate = useCallback\(async \(\) => \{[\s\S]*?\}, \[generatedQuestions, aiSubject, aiGrade, topic\]\);/m;
content = content.replace(regex, newHandleGenerate.trim());

fs.writeFileSync(file, content);
console.log('Patched AIGenerator.tsx');
