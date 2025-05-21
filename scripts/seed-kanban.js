// scripts/seed-kanban.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('kanban_board');
    const board = {
      _id: 'main-board',
      columns: [
        {
          id: 'purchase-requisition',
          title: 'Purchase Requisition',
          cards: [
            { id: 'PR-00123', from: 'Manufacturing', date: 'May 5, 2024', urgent: false },
            { id: 'PR-00455', from: 'IT', date: 'May 7, 2024', urgent: true },
            { id: 'PR-00456', from: 'Acme Corp', date: 'May 9, 2024', urgent: true },
            { id: 'PR-00457', from: 'Global Industries', date: 'May 9, 2024', urgent: true },
          ],
        },
        { id: 'quote-collection', title: 'Quote Collection', cards: [] },
        { id: 'po-issued', title: 'PO Issued', cards: [] },
        { id: 'grn', title: 'GRN', cards: [] },
        { id: 'three-way-match', title: '3-Way Match', cards: [] },
        { id: 'approved-for-payment', title: 'Approved for Payment', cards: [] },
        { id: 'payment-completed', title: 'Payment Completed', cards: [] },
      ],
    };
    await collection.updateOne(
      { _id: 'main-board' },
      { $set: board },
      { upsert: true }
    );
    console.log('Dummy Kanban board seeded!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
