const fs = require('fs');
const file = 'src/components/teacher/AIGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const callCode = `
      let result;
      try {
        result = await window.puter.ai.chat(prompt, aiModel ? { model: aiModel } : undefined);
      } catch (err) {
        console.warn('Puter AI with model failed, falling back to default:', err);
        result = await window.puter.ai.chat(prompt);
      }
`;

content = content.replace(/const result = await window\.puter\.ai\.chat\(prompt, \{ model: aiModel \}\);/g, callCode);

fs.writeFileSync(file, content);
console.log('Patched puter model handling');
