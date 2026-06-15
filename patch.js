const fs = require('fs');
const file = 'src/components/teacher/AIGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const mappingCode = `
      const subjectName = SUBJECTS.find(s => s.id === aiSubject)?.name || aiSubject || 'General';
      const gradeName = CLASS_GRADES.find(c => c.id === aiGrade)?.name || aiGrade || 'General';
      const topicName = topic || subjectName;
`;

content = content.replace(
  `      const typeLabels: Record<QuestionType, string> =`,
  mappingCode + `\n      const typeLabels: Record<QuestionType, string> =`
);

content = content.replace(
  `      const prompt = \`Generate 1 Indonesian education question with the following specifications:`,
  mappingCode + `\n      const prompt = \`Generate 1 Indonesian education question with the following specifications:`
);

content = content.replaceAll('- Subject: ${aiSubject}', '- Subject: ${subjectName}');
content = content.replaceAll('- Class/Grade: ${aiGrade}', '- Class/Grade: ${gradeName}');
content = content.replaceAll('- Topic: ${topic || aiSubject}', '- Topic: ${topicName}');
content = content.replaceAll('Soal tentang ${topic || aiSubject}', 'Soal tentang ${topicName}');

fs.writeFileSync(file, content);
console.log('Fixed subject and grade mappings.');
