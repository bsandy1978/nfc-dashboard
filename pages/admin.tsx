import axios from 'axios';
import { useState } from 'react';

export default function AdminPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Improved error handling and link sanitization
  const generateSlug = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/slugs`);
      setGeneratedSlug(res.data.slug);
      setGeneratedLink(encodeURI(res.data.link)); // Sanitize the generated link
    } catch (err: any) {
      const errorMessage = err.response?.status === 409
        ? 'Slug collision – please try again.'
        : (err.message || 'Error generating slug.');
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Slug Generator (Admin)</h1>
      <button
        onClick={generateSlug}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate New Link'}
      </button>
      {generatedSlug && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <p className="text-sm">Generated Slug:</p>
          <p className="font-mono text-lg text-blue-700">{generatedSlug}</p>
          <p className="mt-2 text-sm">Embed this link in the NFC card:</p>
          <a
            href={generatedLink}
            className="text-blue-600 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {generatedLink}
          </a>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}