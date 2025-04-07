import { useState } from 'react';
import axios from 'axios';

export default function AdminPage() {
  const [slug, setSlug] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/slugs');
      setSlug(res.data.slug);
      setLink(res.data.link);
    } catch (err) {
      console.error(err);
      setError('Failed to generate slug.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 Slug Generator (Admin)</h1>
      <button
        onClick={generateSlug}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate New Link'}
      </button>

      {slug && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <p className="text-sm">Generated Slug:</p>
          <p className="font-mono text-lg text-blue-700">{slug}</p>
          <p className="mt-2 text-sm">Embed this link:</p>
          <a
            href={link}
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link}
          </a>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}