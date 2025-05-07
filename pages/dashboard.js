
import { useEffect, useState } from 'react';
import { supabase } from '../pages/Client';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    console.log('[useEffect] Dashboard component mounted.');
  
    const getUserAndLoad = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
  
      if (!user) {
        console.warn('No user found, redirecting to login.');
        router.push('/');
        return;
      }
  
      console.log('Fetching bookmarks for user:', user.id);
  
      const { data, error } = await supabase
        .from('Schema')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        console.log('Bookmarks fetched:', data);
        console.log('user:', user.id);
  
      if (error) {
        console.error('Error fetching bookmarks:', error);
      } else {
        console.log('Bookmarks fetched:', data);
        setBookmarks(data ?? []);
      }
    };
  
    getUserAndLoad();
  }, []);
  
  
  const fetchMetadata = async (targetUrl) => {
    try {
      const encodedUrl = encodeURIComponent(targetUrl);
      const res = await fetch(`/api/metadata?url=${encodedUrl}`);
  
      if (!res.ok) {
        const text = await res.text();
        console.error('Metadata fetch failed:', res.status, text);
        return { title: 'Untitled', favicon: '' };
      }
  
      const data = await res.json();
      return { title: data.title, favicon: data.favicon };
    } catch (err) {
      console.error('fetchMetadata error:', err);
      return { title: 'Untitled', favicon: '' };
    }
  };
  
  
  

  const fetchSummary = async (targetUrl) => {
    console.log('[fetchSummary] Called with:', targetUrl);
    try {
      const encodedUrl = encodeURIComponent(targetUrl);
      const res = await fetch(`https://r.jina.ai/${encodedUrl}`);
      console.log('[fetchSummary] Response status:', res.status);
  
      if (!res.ok) {
        console.error('[fetchSummary] Non-OK response:', res.status, res.statusText);
        return `Summary fetch failed with status ${res.status}`;
      }
  
      const summary = await res.text();
      return summary || 'No summary returned.';
    } catch (err) {
      console.error('[fetchSummary] Error:', err);
      return 'Summary temporarily unavailable.';
    }
  };
  
  
  
  const saveBookmark = async () => {
    if (!url.trim()) {
      alert('Please enter a valid URL.');
      return;
    }
  
    setLoading(true);
  
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
  
      if (!user) {
        console.warn('[saveBookmark] No user found, redirecting to login.');
        alert('You must be logged in.');
        router.push('/');
        return;
      }
  
      // Fetch title + favicon
      console.log('[saveBookmark] Fetching metadata...');
      const { title, favicon } = await fetchMetadata(url);
  
      if (!title) {
        console.warn('[saveBookmark] Metadata extraction failed');
        alert('Could not extract title from the URL.');
        return;
      }
  
      // Fetch summary using Jina
      console.log('[saveBookmark] Calling fetchSummary...');
      let summary;
      try {
        summary = await fetchSummary(url);
        console.log('[saveBookmark] Summary:', summary);
      } catch (summaryErr) {
        console.error('[saveBookmark] Summary fetch failed:', summaryErr);
        summary = 'Summary temporarily unavailable.';
      }
  
      // Insert into Supabase
      console.log('[saveBookmark] Inserting into Supabase...');
      const { error } = await supabase.from('Schema').insert([
        {
          url,
          title,
          favicon,
          summary,
          user_id: user.id,
        },
      ]);
  
      if (error) {
        console.error('[saveBookmark] Supabase insert error:', error);
        alert('Error saving bookmark: ' + error.message);
        return;
      }
  
      alert('Bookmark saved!');
      alert('Bookmark saved!');

      const { data: refreshedBookmarks, error: refreshError } = await supabase
        .from('Schema')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (refreshError) {
        console.error('Error refreshing bookmarks:', refreshError);
      } else {
        setBookmarks(refreshedBookmarks ?? []);
      }
      setUrl('');

    } catch (err) {
      console.error('[saveBookmark] Unexpected error:', err);
      alert('Unexpected error: ' + err.message);
    }
  
    setLoading(false);
  };
  
  

  const deleteBookmark = async (id) => {
    console.log('Deleting bookmark with id:', id);
  
    const { error } = await supabase.from('Schema').delete().eq('id', id);
  
    if (error) {
      console.error('Error deleting bookmark:', error);
      alert('Error deleting bookmark: ' + error.message);
      return;
    }
  
    // Fetch updated bookmarks
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
  
    if (user) {
      const { data, error } = await supabase
        .from('Schema')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching bookmarks after deletion:', error);
      } else {
        setBookmarks(data ?? []);
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bookmarks</h1>

      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL here"
          className="border p-2 flex-grow"
        />
        <button
          onClick={saveBookmark}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="grid gap-4">
        {bookmarks.map((bm) => (
          <div key={bm.id} className="border p-4 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {bm.favicon && <img src={bm.favicon} alt="" className="w-5 h-5" />}
              <a href={bm.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                {bm.title}
              </a>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{bm.summary}</p>
            <button
              onClick={() => deleteBookmark(bm.id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


