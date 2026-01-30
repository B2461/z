import { DivinationType } from '../types';

const objectCounterCode = {
    'types.ts': `
// In types.ts, add the new tool type to the enum:
export enum DivinationType {
    // ... other types
    OBJECT_COUNTER = 'वस्तु गणक'
}

// The existing UserInput interface is used, which includes 'image' and 'question' fields.
// No changes are needed for Reading or UserInput interfaces for this tool.
    `.trim(),

    'data/tools.ts': `
// In data/tools.ts, add the tool to a category, for example, 'AI उपकरण':
{
    name: 'AI उपकरण',
    tools: [
        // ... other tools
        { type: DivinationType.OBJECT_COUNTER, icon: '🧐' },
    ],
},
    `.trim(),

    'components/InputForm.tsx': `
// In components/InputForm.tsx, add a case in renderFormFields():
case DivinationType.OBJECT_COUNTER:
    return (
        <>
            <div className="mb-6 text-center">
                <label className="block text-purple-200 text-lg mb-4">वस्तुओं का चित्र अपलोड करें</label>
                {/* ... file input and image preview logic ... */}
                {image && <div className="mt-4"><p>चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Object preview" /></div>}
            </div>
            <div className="mb-6">
                <label htmlFor="question" className="block text-purple-200 text-lg mb-2">किस वस्तु की गिनती करनी है?</label>
                <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="उदाहरण: सेब, बोतलें, पेंच" />
            </div>
        </>
    );

// Add validation in the handleSubmit() function:
if (divinationType === DivinationType.OBJECT_COUNTER) {
    if (!image) {
        setFormError("कृपया वस्तुओं का एक चित्र अपलोड करें।");
        return;
    }
    if (!question.trim()) {
        setFormError("कृपया उस वस्तु का नाम दर्ज करें जिसकी गिनती करनी है।");
        return;
    }
}
    `.trim(),

    'services/geminiService.ts': `
// In services/geminiService.ts, add a new prompt in getPrompt():
case DivinationType.OBJECT_COUNTER:
    return \`Act as an expert object counter. Analyze the provided image. Meticulously count how many '\${input.question}' are visible. Provide a clear and accurate response in HINDI. Structure the response into three parts: 'past' (Confirming the object counted), 'present' (Stating the final count clearly), and 'future' (A concluding remark). Be precise.\`;

// The existing image handling logic in generateReading() will process the request:
if ((type === DivinationType.OBJECT_COUNTER) && userInput.image) {
    const imageBase64 = await fileToBase64(userInput.image);
    contents = {
        parts: [
            { text: prompt },
            {
                inlineData: {
                    mimeType: userInput.image.type,
                    data: imageBase64
                }
            }
        ]
    };
}
    `.trim(),
    
    'components/ResultDisplay.tsx': `
// In components/ResultDisplay.tsx, add titles in getTitlesForType():
if (type === DivinationType.OBJECT_COUNTER) {
    return {
        main: 'गिनती का परिणाम',
        past: 'वस्तु',
        present: 'कुल गिनती',
        future: 'सारांश',
        resetButton: 'नई गिनती करें',
        icons: ['🧐', '🔢', '📝']
    };
}
    `.trim()
};


const codeSnippets: Record<string, Record<string, string>> = {
    [DivinationType.OBJECT_COUNTER]: objectCounterCode
};

export const getCodeForTool = (toolType: DivinationType): { file: string; code: string; language: string }[] => {
    const snippets = codeSnippets[toolType] || {};
    if (Object.keys(snippets).length === 0) {
        return [{
            file: 'Info',
            code: `इस टूल के लिए कोड स्निपेट अभी उपलब्ध नहीं हैं।`,
            language: 'text'
        }];
    }
    return Object.entries(snippets).map(([file, code]) => ({
        file,
        code,
        language: file.endsWith('.ts') || file.endsWith('.tsx') ? 'typescript' : 'text'
    }));
};