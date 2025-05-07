import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    res.status(200).json([
      { id: '1', productName: 'Example', numbers: 1, price: 1000, detail: 'Sample product' },
    ]);
  } else if (req.method === 'POST') {
    const data = req.body;
  
    console.log('Received invoice data:', data);
    res.status(200).json({ message: 'Invoice received', downloadUrl: null }); 
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
