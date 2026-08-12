export default async function handler(req, res) {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzZD7pj6pJ-86F6w9-JyYqdD4gS5C6Zv0qijGazdbdHNbBYREYZNnWp29-U6i84CgwYeQ/exec';
  
  try {
    if (req.method === 'POST') {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return res.status(500).json({ status: 'error', message: 'Failed to parse Google Script response', raw: text });
      }
      return res.status(200).json(data);
    } else {
      const action = req.query.action;
      const id = req.query.id;
      const nik = req.query.nik;
      let url = `${GAS_URL}?action=${action}`;
      if (id) url += `&id=${id}`;
      if (nik) url += `&nik=${nik}`;
      
      const response = await fetch(url);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return res.status(500).json({ status: 'error', message: 'Failed to parse Google Script response', raw: text });
      }
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.toString() });
  }
}
