import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzZD7pj6pJ-86F6w9-JyYqdD4gS5C6Zv0qijGazdbdHNbBYREYZNnWp29-U6i84CgwYeQ/exec';

const gasProxyPlugin = () => ({
  name: 'gas-proxy',
  configureServer(server) {
    server.middlewares.use('/api/gas', async (req, res) => {
      try {
        const fetch = globalThis.fetch;
        if (req.method === 'POST') {
           let body = '';
           req.on('data', chunk => { body += chunk.toString(); });
           req.on('end', async () => {
             const response = await fetch(GAS_URL, { method: 'POST', body });
             const data = await response.text();
             res.setHeader('Content-Type', 'application/json');
             res.end(data);
           });
        } else {
           const url = new URL(req.url, 'http://localhost');
           const response = await fetch(GAS_URL + url.search);
           const data = await response.text();
           res.setHeader('Content-Type', 'application/json');
           res.end(data);
        }
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({status: 'error', message: e.message}));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gasProxyPlugin()],
})
