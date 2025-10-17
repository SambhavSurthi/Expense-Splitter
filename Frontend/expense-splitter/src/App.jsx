import React, { useEffect, useMemo, useState } from 'react'
import {
  listParticipants,
  createParticipant,
  deleteParticipant,
  listExpenses,
  createExpense,
  deleteExpense,
  getSummary,
} from './api.js'

const App = () => {
  const [participants, setParticipants] = useState([])
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [newParticipant, setNewParticipant] = useState('')

  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', paidById: '' })
  const participantsById = useMemo(() => Object.fromEntries(participants.map(p => [p.id, p])), [participants])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [ps, es, sm] = await Promise.all([
        listParticipants(),
        listExpenses(),
        getSummary(),
      ])
      setParticipants(ps)
      setExpenses(es)
      setSummary(sm)
    } catch (e) {
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const onAddParticipant = async (e) => {
    e.preventDefault()
    if (!newParticipant.trim()) return
    await createParticipant({ name: newParticipant.trim() })
    setNewParticipant('')
    refresh()
  }

  const onDeleteParticipant = async (id) => {
    await deleteParticipant(id)
    refresh()
  }

  const onAddExpense = async (e) => {
    e.preventDefault()
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paidById) return
    const payload = {
      description: expenseForm.description,
      amount: Number(expenseForm.amount),
      paidBy: { id: Number(expenseForm.paidById) },
    }
    await createExpense(payload)
    setExpenseForm({ description: '', amount: '', paidById: '' })
    refresh()
  }

  const onDeleteExpense = async (id) => {
    await deleteExpense(id)
    refresh()
  }

  return (    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mini Expense Splitter</h1>
          <button onClick={refresh} className="px-3 py-2 rounded bg-gray-900 text-white text-sm">Refresh</button>
        </header>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>}
        {loading && <div className="animate-pulse">Loading...</div>}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-3">Participants</h2>
              <form onSubmit={onAddParticipant} className="flex gap-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Name (e.g., You, Alex)" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} />
                <button className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
              </form>
              <ul className="mt-4 divide-y">
                {participants.map(p => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <span>{p.name}</span>
                    <button onClick={() => onDeleteParticipant(p.id)} className="text-sm text-red-600">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-3">Add Expense</h2>
              <form onSubmit={onAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm(v => ({ ...v, description: e.target.value }))} />
                <input type="number" className="border rounded px-3 py-2" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm(v => ({ ...v, amount: e.target.value }))} />
                <select className="border rounded px-3 py-2" value={expenseForm.paidById} onChange={e => setExpenseForm(v => ({ ...v, paidById: e.target.value }))}>
                  <option value="">Paid By</option>
                  {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-3">Expenses</h2>
              <ul className="divide-y">
                {expenses.map(ex => (
                  <li key={ex.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{ex.description}</div>
                      <div className="text-sm text-gray-600">{participantsById[ex.paidBy?.id]?.name} paid ₹{Number(ex.amount).toFixed(2)}</div>
                    </div>
                    <button onClick={() => onDeleteExpense(ex.id)} className="text-sm text-red-600">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Summary</h2>
          {!summary ? (
            <div className="text-gray-500">No data</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded bg-gray-100">
                <div className="text-xs text-gray-500">Total Spent</div>
                <div className="text-xl font-bold">₹{Number(summary.total ?? 0).toFixed(2)}</div>
              </div>
              <div className="p-3 rounded bg-gray-100">
                <div className="text-xs text-gray-500">Equal Share</div>
                <div className="text-xl font-bold">₹{Number(summary.equalShare ?? 0).toFixed(2)} each</div>
              </div>
              <div className="p-3 rounded bg-gray-100">
                <div className="text-xs text-gray-500">Balances</div>
                <ul className="text-sm">
                  {summary.balance && Object.entries(summary.balance).map(([name, val]) => (
                    <li key={name}>
                      {name}: {Number(val).toFixed(2)} {Number(val) >= 0 ? '(gets back)' : '(owes)'}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-3 p-3 rounded bg-gray-100">
                <div className="text-xs text-gray-500 mb-1">Settlements</div>
                {(!summary.settlements || summary.settlements.length === 0) ? (
                  <div className="text-sm text-gray-600">No transfers needed.</div>
                ) : (
                  <ul className="text-sm list-disc pl-5">
                    {summary.settlements.map((s, idx) => (
                      <li key={idx}>{s.from} pays {s.to} ₹{Number(s.amount).toFixed(2)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App