import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const mockVendors = [
  { name: 'Acme Corp', id: 'acme', selected: true },
  { name: 'Global Industries', id: 'global', selected: true },
];



const statusTabs = [
  { label: 'All', id: 'all' },
  { label: 'Pending', id: 'pending' },
  { label: 'Approved', id: 'approved' },
  { label: 'Mismatched', id: 'mismatched' },
  { label: 'Paid', id: 'paid' },
];

export default function Home() {
  const [vendors, setVendors] = useState(mockVendors);
  const [status, setStatus] = useState('pending');
  const [amount, setAmount] = useState([0, 10000]);
  const [columns, setColumns] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch board data on mount
  React.useEffect(() => {
    fetch('/api/kanban')
      .then(res => res.json())
      .then(data => {
        setColumns(data);
        setLoading(false);
      });
  }, []);

  // Drag and drop handler
  const onDragEnd = async (result) => {
    if (!columns) return;
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Defensive: ensure card is removed from all columns before adding to destination
    const cardIdToMove = columns
      .find(col => col.id === source.droppableId)
      .cards[source.index].id;
    let newColumns = columns.map(col => ({
      ...col,
      cards: col.cards.filter(card => card.id !== cardIdToMove)
    }));

    // Now add the card to the destination column at the right index
    const movedCard = columns.find(col => col.id === source.droppableId).cards[source.index];
    const destColIdx = newColumns.findIndex(col => col.id === destination.droppableId);
    const destCards = Array.from(newColumns[destColIdx].cards);
    destCards.splice(destination.index, 0, movedCard);
    newColumns[destColIdx] = { ...newColumns[destColIdx], cards: destCards };

    setColumns(newColumns);
    await fetch('/api/kanban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newColumns),
    });
  };

  if (!columns) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-gray-500">Loading board...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
      {/* Header */}
      <header className="flex items-center px-6 py-4 bg-blue-900 text-white shadow">
        <span className="text-2xl font-semibold flex-1">Accounts Payable</span>
        <div className="flex gap-8">
          <div>100 <span className="text-sm">TallInvoices</span></div>
          <div>45 <span className="text-sm">Pending Payments</span></div>
          <div>2 <span className="text-sm">High-Risk Mismatches</span></div>
          <div>5 <span className="text-sm">S1A Breaches</span></div>
        </div>
        <button className="ml-8 text-xl">☰</button>
      </header>

      <main className="flex gap-4 px-4 py-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-xl shadow p-4 flex flex-col gap-6">
          <input className="w-full px-3 py-2 rounded border mb-2" placeholder="Search..." />
          <div>
            <div className="font-bold mb-2">Vendor</div>
            {vendors.map(v => (
              <label key={v.id} className="flex items-center gap-2 mb-1">
                <input type="checkbox" checked={v.selected} readOnly />
                {v.name}
                {v.id === 'global' && <span className="ml-1 text-xs text-red-600">1</span>}
              </label>
            ))}
          </div>
          <div>
            <div className="font-bold mb-2">Status</div>
            {statusTabs.map(tab => (
              <label key={tab.id} className="flex items-center gap-2 mb-1">
                <input type="checkbox" checked={status === tab.id || (tab.id === 'all' && status === 'pending')} readOnly />
                {tab.label}
              </label>
            ))}
          </div>
          <div>
            <div className="font-bold mb-2">Amount</div>
            <input type="range" min={0} max={10000} value={amount[1]} className="w-full" readOnly />
            <div className="flex justify-between text-xs mt-1">
              <span>$0</span><span>$10k</span>
            </div>
          </div>
          <button className="mt-2 py-1 px-3 bg-blue-100 rounded text-blue-800">Filter</button>
        </aside>

        {/* Kanban Columns */}
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="flex-1 flex gap-6 overflow-x-auto pb-2">
            {columns.map((col, colIdx) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      // Avoid overflow: hidden on parent containers for drag-and-drop to work
                      `bg-white rounded-xl shadow p-4 flex flex-col gap-4 min-h-[500px] min-w-[350px] transition-all ` +
                      (snapshot.isDraggingOver ? 'ring-2 ring-blue-400 border-blue-400 border-2' : '')
                    }
                  >
                    <div className="font-bold text-lg mb-2">{col.title}</div>
                    {col.cards.map((card, cardIdx) => (
                      <Draggable draggableId={card.id} index={cardIdx} key={card.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              `bg-gray-50 rounded-lg p-3 mb-2 shadow flex flex-col gap-1 border border-gray-200 user-select-none cursor-move ` +
                              (snapshot.isDragging ? 'ring-2 ring-blue-400' : '')
                            }
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{card.id}</span>
                              {card.urgent && <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded">Urgent</span>}
                            </div>
                            <div className="text-xs text-gray-500">From {card.from}</div>
                            {card.amount && <div className="text-blue-900 font-bold">${card.amount}</div>}
                            <div className="text-xs text-gray-400">{card.date}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </section>
        </DragDropContext>
      </main>
    </div>
  );
}
