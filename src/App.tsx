import { useState } from 'react';
import { Send, BookOpen } from 'lucide-react';
import { HfInference } from '@huggingface/inference'; // ✅ new SDK import

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODEL_ID = 'Domver345/lightnovel_ai_proto';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;

  // ✅ Initialize Hugging Face client
  const hf = new HfInference(apiToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!apiToken || apiToken === 'your_token_here') {
        throw new Error('Please set your Hugging Face API token in the .env file');
      }

      // ✅ Modern API call
      const result = await hf.chatCompletion({
        model: MODEL_ID,  // "openai/gpt-oss-120b"
        messages: [
          { role: "user", content: userMessage }
        ],
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
        },
      });

      // The SDK returns a single object, not an array
      const assistantMessage =
        typeof result.generated_text === 'string'
          ? result.generated_text
          : 'No response generated';

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${
            error instanceof Error ? error.message : 'Failed to get response'
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-amber-800" />
            <h1 className="text-5xl font-serif text-amber-900">Literary Muse</h1>
          </div>
          <p className="text-lg text-amber-700 font-serif italic mb-2">
            Where words dance and stories unfold
          </p>
          <p className="text-sm text-amber-600 font-serif">
            Powered by {MODEL_ID}
          </p>
        </header>

        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === 'user'
                  ? 'bg-amber-100 border-l-4 border-amber-600'
                  : 'bg-white border-l-4 border-orange-600'
              } p-6 rounded-r-lg shadow-md`}
            >
              <div className="flex items-start gap-3">
                <span className="font-serif font-bold text-sm text-amber-900 uppercase tracking-wider">
                  {message.role === 'user' ? 'You' : 'Muse'}
                </span>
              </div>
              <p className="mt-2 text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          ))}

          {isLoading && (
            <div className="bg-white border-l-4 border-orange-600 p-6 rounded-r-lg shadow-md">
              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm text-amber-900 uppercase tracking-wider">
                  Muse
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                </div>
                <span className="text-gray-600 font-serif italic text-sm">
                  Composing thoughts...
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="sticky bottom-8">
          <div className="bg-white rounded-lg shadow-xl border-2 border-amber-300 overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Pen your thoughts here..."
              className="w-full px-6 py-4 text-gray-800 font-serif text-lg resize-none focus:outline-none"
              rows={3}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center px-6 py-3 bg-amber-50 border-t border-amber-200">
              <span className="text-sm text-amber-700 font-serif italic">
                Press Enter to send, Shift+Enter for new line
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-full font-serif hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {messages.length === 0 && (
          <div className="text-center mt-16 text-amber-700">
            <p className="font-serif text-lg italic">
              "Every great story begins with a single word..."
            </p>
            <p className="mt-4 text-sm">
              Start your literary journey by writing in the prompt box below
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
