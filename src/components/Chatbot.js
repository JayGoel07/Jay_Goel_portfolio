import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false); 
  const [resumeText, setResumeText] = useState('');
  const extractResumeText = async () => {
    const loadingTask = pdfjsLib.getDocument(`${process.env.PUBLIC_URL}/Jay_Goel_SDE.pdf`);
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += "\nPage " + i + ":\n" + strings.join(' ') + '\n';

    }

    setResumeText(fullText);
    return fullText;
  };

  const askBot = async () => {
    setLoading(true);

    const resumeContent = resumeText || await extractResumeText();

    const res = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer b9071c0ea39ecc93c5bb6809ab6bfee7832193dae778f5ce2a142d29e696b752', // Replace with your key
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        prompt: `You are a helpful assistant who will answer questions about this resume.\n\nResume Content:\n${resumeContent}\n\nNow answer the following question:\nQ: ${question}\nA:`,
        max_tokens: 150,
      }),
    });

    const data = await res.json();
    console.log("API Response:", data);
    const answer =
  data &&
  data.choices &&
  data.choices[0] &&
  data.choices[0].text
    ? data.choices[0].text.trim()
    : "Sorry, I couldn't understand.";

setResponse(answer);


    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid gray', marginTop: '2rem', borderRadius: '10px' }}>
      <h3>AI Chatbot for Resume 🤖</h3>
      <input
        type="text"
        value={question}
        placeholder="Ask about my resume, skills, or projects..."
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: '70%', padding: '8px' }}
      />
      <button onClick={askBot} style={{ marginLeft: '10px', padding: '8px' }}>
        Ask
      </button>
      <div style={{ marginTop: '1rem', minHeight: '2rem' }}>
        {loading ? 'Thinking...' : <strong>{response}</strong>}
      </div>
    </div>
  );
};

export default Chatbot;
