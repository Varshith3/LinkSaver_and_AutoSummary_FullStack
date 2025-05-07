export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }
  
    try {
      const decodedUrl = decodeURIComponent(url);
      const response = await fetch(decodedUrl);
  
      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to fetch the target page' });
      }
  
      const html = await response.text();
  
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Untitled';
      const favicon = new URL('/favicon.ico', decodedUrl).href;
  
      res.status(200).json({ title, favicon });
    } catch (err) {
      console.error('Metadata fetch failed:', err);
      res.status(500).json({ error: 'Fetch error: ' + err.message });
    }
  }
  