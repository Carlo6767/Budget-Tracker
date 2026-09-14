import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Transaction = {
  id: number
  title: string
  category: string
  date: string
  amount: number
  kind: 'income' | 'expense'
}

const categories = ['Food', 'Transport', 'School', 'Bills', 'Fun']
const formatMoney = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('student-budget-transactions-v2')
    return stored ? JSON.parse(stored) : []
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('student-budget-theme') as 'light' | 'dark') || 'light')
  const [showForm, setShowForm] = useState(false)
  const [activeView, setActiveView] = useState('Overview')
  const [newTransaction, setNewTransaction] = useState({ title: '', amount: '', category: 'Food', kind: 'expense' as 'income' | 'expense' })
  useEffect(() => { localStorage.setItem('student-budget-transactions-v2', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('student-budget-theme', theme)
  }, [theme])
  const income = useMemo(() => transactions.filter((item) => item.kind === 'income').reduce((total, item) => total + item.amount, 0), [transactions])
  const expenses = useMemo(() => transactions.filter((item) => item.kind === 'expense').reduce((total, item) => total + item.amount, 0), [transactions])
  const remaining = income - expenses
  const categoryTotals = categories.map((category) => ({ category, total: transactions.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0) }))
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = Number(newTransaction.amount)
    if (!newTransaction.title.trim() || !amount || amount < 0) return
    setTransactions((current) => [{ id: Date.now(), title: newTransaction.title.trim(), category: newTransaction.kind === 'income' ? 'Income' : newTransaction.category, date: new Date().toISOString().slice(0, 10), amount, kind: newTransaction.kind }, ...current])
    setNewTransaction({ title: '', amount: '', category: 'Food', kind: 'expense' })
    setShowForm(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="brand"><span className="brand-mark">₱</span><span>pocketwise</span></div><p className="sidebar-label">Your money space</p><nav aria-label="Main navigation">{['Overview', 'Transactions', 'Budgets', 'Savings goals'].map((item) => <button key={item} className={activeView === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveView(item)}><span className="nav-dot" />{item}</button>)}</nav><div className="sidebar-tip"><span className="tip-spark">✦</span><strong>Small steps add up.</strong><p>You are doing better than you think. Keep checking in.</p></div><button className="profile"><span className="avatar">AM</span><span><strong>Alex Mendoza</strong><small>Student account</small></span><span className="more">•••</span></button></aside>
      <main className="main-content"><header className="topbar"><div className="mobile-brand"><span className="brand-mark">₱</span> pocketwise</div><div className="month-picker"><button aria-label="Previous month">‹</button><span>September 2026</span><button aria-label="Next month">›</button></div><button className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾' : '☀'}</button><button className="notification" aria-label="Notifications">♧<span /></button></header><section className="welcome-row"><div><p className="eyebrow">MONDAY, SEPTEMBER 14</p><h1>Good morning, Alex <span>✦</span></h1><p className="subtitle">Here is your money snapshot for this month.</p></div><button className="primary-action" onClick={() => setShowForm(true)}><span>+</span> Add transaction</button></section>
        {activeView !== 'Overview' ? <section className="placeholder-view"><p className="eyebrow">{activeView.toUpperCase()}</p><h2>{activeView === 'Transactions' ? 'Your spending, all in one place.' : activeView === 'Budgets' ? 'Plan your month before it plans you.' : 'Give your next goal somewhere to go.'}</h2><p>This area is ready for the next Pocketwise feature. Use the quick add button to keep tracking in the meantime.</p><button className="primary-action" onClick={() => setShowForm(true)}>+ Add transaction</button></section> : <><section className="metrics-grid"><div className="metric-card balance"><div className="metric-heading"><span className="metric-icon">◎</span><span>Available balance</span><span className="trend positive">↑ 8.4%</span></div><strong>{formatMoney(remaining)}</strong><p>of {formatMoney(15000)} monthly budget</p><div className="progress-track"><span style={{ width: `${Math.min((remaining / 15000) * 100, 100)}%` }} /></div></div><div className="metric-card"><div className="metric-heading"><span className="metric-icon income">↗</span><span>Income</span></div><strong>{formatMoney(income)}</strong><p className="muted">This month</p></div><div className="metric-card"><div className="metric-heading"><span className="metric-icon expense">↘</span><span>Spent</span></div><strong>{formatMoney(expenses)}</strong><p className="muted">{income ? Math.round((expenses / income) * 100) : 0}% of income</p></div></section><section className="content-grid"><div className="panel spending-panel"><div className="panel-heading"><div><h2>Spending this month</h2><p>Keep an eye on where your money goes.</p></div><button className="small-select">This month⌄</button></div><div className="chart-area"><div className="chart-y"><span>₱4k</span><span>₱3k</span><span>₱2k</span><span>₱1k</span><span>₱0</span></div><div className="bars">{categoryTotals.map(({ category, total }) => <div className="bar-group" key={category}><div className="bar-wrap"><span className={`bar ${category.toLowerCase()}`} style={{ height: `${Math.max((total / 4000) * 100, 7)}%` }} /></div><span>{category}</span></div>)}</div></div><div className="chart-total"><span>Total spent</span><strong>{formatMoney(expenses)}</strong><span className="trend positive">↑ 4.2% <small>vs last month</small></span></div></div><div className="panel goal-panel"><div className="panel-heading"><div><h2>My savings goal</h2><p>One step closer every day.</p></div><button className="kebab" aria-label="Goal options">•••</button></div><div className="goal-visual"><div className="goal-ring"><span>58<small>%</small></span></div><div><strong>New laptop</strong><p>Target: {formatMoney(35000)}</p><p className="goal-date">Due December 2026</p></div></div><div className="goal-progress"><span style={{ width: '58%' }} /></div><div className="goal-footer"><span>{formatMoney(20300)} saved</span><button onClick={() => setShowForm(true)}>Add money <span>→</span></button></div></div></section><section className="bottom-grid"><div className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your latest money moves.</p></div><button className="text-button" onClick={() => setActiveView('Transactions')}>See all <span>→</span></button></div><div className="activity-list">{transactions.slice(0, 4).map((item) => <div className="activity-item" key={item.id}><span className={`category-icon ${item.category.toLowerCase()}`}>{item.category === 'Food' ? '✦' : item.category === 'Transport' ? '↗' : item.category === 'School' ? '▣' : item.category === 'Bills' ? '◒' : '₱'}</span><span className="activity-name"><strong>{item.title}</strong><small>{item.category} · {formatDate(item.date)}</small></span><strong className={item.kind === 'income' ? 'income-text' : ''}>{item.kind === 'income' ? '+' : '-'}{formatMoney(item.amount)}</strong></div>)}</div></div><div className="panel budget-panel"><div className="panel-heading"><div><h2>Budget check-in</h2><p>Monthly spending limit</p></div><span className="budget-status">On track</span></div><strong className="budget-number">{formatMoney(expenses)} <small>/ {formatMoney(10000)}</small></strong><div className="budget-progress"><span style={{ width: `${Math.min((expenses / 10000) * 100, 100)}%` }} /></div><div className="budget-labels"><span>Spent</span><span>{formatMoney(10000 - expenses)} left</span></div><button className="outline-action">Adjust budget <span>→</span></button></div></section></>}</main>
      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="transaction-form" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}><div className="form-heading"><div><p className="eyebrow">QUICK ENTRY</p><h2>Add transaction</h2></div><button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button></div><div className="type-toggle"><button type="button" className={newTransaction.kind === 'expense' ? 'selected' : ''} onClick={() => setNewTransaction({ ...newTransaction, kind: 'expense' })}>Expense</button><button type="button" className={newTransaction.kind === 'income' ? 'selected income-selected' : ''} onClick={() => setNewTransaction({ ...newTransaction, kind: 'income' })}>Income</button></div><label>Description<input autoFocus value={newTransaction.title} onChange={(event) => setNewTransaction({ ...newTransaction, title: event.target.value })} placeholder="e.g. Coffee with friends" /></label><label>Amount<input type="number" min="1" value={newTransaction.amount} onChange={(event) => setNewTransaction({ ...newTransaction, amount: event.target.value })} placeholder="0.00" /></label>{newTransaction.kind === 'expense' && <label>Category<select value={newTransaction.category} onChange={(event) => setNewTransaction({ ...newTransaction, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>}<button className="primary-action form-submit" type="submit">Save transaction <span>→</span></button></form></div>}
    </div>
  )
}

export default App
