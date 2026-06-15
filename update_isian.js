const fs = require('fs');

function updateTypes() {
  const file = 'src/lib/types.ts';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('shortAnswerKeywords?: ShortAnswerKeyword[];', 'shortAnswer?: string;');
  fs.writeFileSync(file, content);
}

function updateApiRoute() {
  const file = 'src/app/api/ai-generate/route.ts';
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /q\.shortAnswerKeywords as AIGeneratedQuestion\['shortAnswerKeywords'\]\)?\?.map\([\s\S]*?\),/,
    `q.shortAnswer as string,`
  );
  content = content.replace(
    /"shortAnswerKeywords": \[\{"keyword": "answer keyword"\}\]/g,
    `"shortAnswer": "exact short answer"`
  );
  fs.writeFileSync(file, content);
}

function updateGenerator() {
  const file = 'src/components/teacher/AIGenerator.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace in prompt labels
  content = content.replace(
    /isian_singkat: 'Isian Singkat \(short answer with keyword matching\)'/g,
    `isian_singkat: 'Isian Singkat (exact short answer)'`
  );
  
  // Replace in prompts
  content = content.replace(
    /"shortAnswerKeywords": \[\{"keyword": "answer keyword"\}\]/g,
    `"shortAnswer": "exact short answer"`
  );
  
  // Replace mapping assignment (2 occurrences)
  content = content.replace(
    /shortAnswerKeywords: \(q\.shortAnswerKeywords as AIGeneratedQuestion\['shortAnswerKeywords'\]\)\?\.map\(\(kw\) => \(\{\s+id: kw\.id \|\| `kw-\$\{Date\.now\(\)\}-\$\{Math\.random\(\)\}`,\s+keyword: kw\.keyword,\s+\}\)\),\s+/g,
    `shortAnswer: (q.shortAnswer as string) || '',\n            `
  );

  // Update UI renderer for isian_singkat
  const oldUI = `{q.type === 'isian_singkat' && q.shortAnswerKeywords && (
                                    <div className="space-y-2 mt-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>Keywords / Kata Kunci Jawaban</p>
                                      <div className="flex flex-wrap gap-2">
                                        {q.shortAnswerKeywords.map((kw, ki) => (
                                          <div key={kw.id || ki} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                                            <span className="truncate max-w-[150px]">{kw.keyword}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}`;
  
  const newUI = `{q.type === 'isian_singkat' && (
                                    <div className="space-y-2 mt-2">
                                      <p className="text-[11px] font-semibold" style={{ color: '#636e72' }}>Kunci Jawaban Singkat</p>
                                      <Input 
                                        value={q.shortAnswer || ''}
                                        onChange={(e) => {
                                          const updated = [...generatedQuestions];
                                          updated[index].shortAnswer = e.target.value;
                                          setGeneratedQuestions(updated);
                                        }}
                                        className="h-8 text-sm"
                                        placeholder="Ketik jawaban singkat..."
                                      />
                                    </div>
                                  )}`;
  
  content = content.replace(oldUI, newUI);
  fs.writeFileSync(file, content);
}

try {
  updateTypes();
  updateApiRoute();
  updateGenerator();
  console.log('Successfully updated isian_singkat to shortAnswer');
} catch(e) {
  console.error(e);
}
