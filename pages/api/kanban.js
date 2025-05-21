import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await (await import('../../lib/mongodb')).default;
  const db = client.db();
  const collection = db.collection('kanban_board');

  if (req.method === 'GET') {
    let board = await collection.findOne({ _id: 'main-board' });
    if (!board) {
      // Create default board if not present
      board = {
        _id: 'main-board',
        columns: [
          { id: 'purchase-requisition', title: 'Purchase Requisition', cards: [] },
          { id: 'quote-collection', title: 'Quote Collection', cards: [] },
          { id: 'po-issued', title: 'PO Issued', cards: [] },
          { id: 'grn', title: 'GRN', cards: [] },
          { id: 'three-way-match', title: '3-Way Match', cards: [] },
          { id: 'approved-for-payment', title: 'Approved for Payment', cards: [] },
          { id: 'payment-completed', title: 'Payment Completed', cards: [] },
        ],
      };
      await collection.insertOne(board);
    }
    res.status(200).json(board.columns);
  } else if (req.method === 'POST') {
    const columns = req.body;
    await collection.updateOne(
      { _id: 'main-board' },
      { $set: { columns } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

