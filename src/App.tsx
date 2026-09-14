import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  kind: "income" | "expense";
};

type Goal = {
  name: string;
  target: number;
  saved: number;
  due: string;
};

const categories = ["Food", "Transport", "School", "Bills", "Fun"];
const formatMoney = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

function App() {
  const [name, setName] = useState(
    () => localStorage.getItem("student-budget-name") || "",
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("student-budget-transactions-v2");
    return stored ? JSON.parse(stored) : [];
  });
  const [theme, setTheme] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem("student-budget-theme") as "light" | "dark") ||
      "light",
  );
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState("Overview");
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const stored = localStorage.getItem("student-budget-monthly-budget");
    return stored ? Number(stored) : 10000;
  });
  const [budgetDraft, setBudgetDraft] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [chartRange, setChartRange] = useState("This month");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goal, setGoal] = useState<Goal>(() => {
    const stored = localStorage.getItem("student-budget-goal");
    return stored
      ? JSON.parse(stored)
      : {
          name: "New laptop",
          target: 35000,
          saved: 20300,
          due: "December 2026",
        };
  });
  const [goalDraft, setGoalDraft] = useState({ name: "", target: "", due: "" });
  const [showProfile, setShowProfile] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    title: "",
    amount: "",
    category: "Food",
    kind: "expense" as "income" | "expense",
  });
  const [nameInput, setNameInput] = useState("");
  useEffect(() => {
    localStorage.setItem(
      "student-budget-transactions-v2",
      JSON.stringify(transactions),
    );
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem("student-budget-goal", JSON.stringify(goal));
  }, [goal]);
  useEffect(() => {
    if (name) localStorage.setItem("student-budget-name", name);
  }, [name]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("student-budget-theme", theme);
  }, [theme]);
  const income = useMemo(
    () =>
      transactions
        .filter((item) => item.kind === "income")
        .reduce((total, item) => total + item.amount, 0),
    [transactions],
  );
  const expenses = useMemo(
    () =>
      transactions
        .filter((item) => item.kind === "expense")
        .reduce((total, item) => total + item.amount, 0),
    [transactions],
  );
  const remaining = income - expenses;
  const categoryTotals = categories.map((category) => ({
    category,
    total: transactions
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0),
  }));
  const displayedMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(2026, 8 + monthOffset, 1));
  const goalProgress = Math.min(
    Math.round((goal.saved / goal.target) * 100),
    100,
  );
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(newTransaction.amount);
    if (!newTransaction.title.trim() || !amount || amount < 0) return;
    setTransactions((current) => [
      {
        id: Date.now(),
        title: newTransaction.title.trim(),
        category:
          newTransaction.kind === "income" ? "Income" : newTransaction.category,
        date: new Date().toISOString().slice(0, 10),
        amount,
        kind: newTransaction.kind,
      },
      ...current,
    ]);
    setNewTransaction({
      title: "",
      amount: "",
      category: "Food",
      kind: "expense",
    });
    setShowForm(false);
  };

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = nameInput.trim();
    if (cleanName) {
      localStorage.setItem("student-budget-name", cleanName);
      setName(cleanName);
    }
  };

  const handleGoalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = Number(goalDraft.target);
    if (
      !goalDraft.name.trim() ||
      !target ||
      target < 1 ||
      !goalDraft.due.trim()
    )
      return;
    setGoal({
      name: goalDraft.name.trim(),
      target,
      saved: 0,
      due: goalDraft.due.trim(),
    });
    setGoalDraft({ name: "", target: "", due: "" });
    setShowGoalForm(false);
    setShowGoalMenu(false);
  };

  const handleBudgetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextBudget = Number(budgetDraft);
    if (!nextBudget || nextBudget < 1) return;
    setMonthlyBudget(nextBudget);
    localStorage.setItem("student-budget-monthly-budget", String(nextBudget));
    setBudgetDraft("");
  };

  const removeTransaction = (id: number) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
  };

  if (!name) {
    return (
      <main className="onboarding-shell">
        <div className="onboarding-mark">₱</div>
        <p className="eyebrow">WELCOME TO POCKETWISE</p>
        <h1>Let’s make your money feel a little simpler.</h1>
        <p>First, what should we call you?</p>
        <form onSubmit={handleNameSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            autoFocus
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="e.g. Alex"
          />
          <button className="primary-action" type="submit">
            Continue <span>→</span>
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">₱</span>
          <span>pocketwise</span>
        </div>
        <p className="sidebar-label">Your money space</p>
        <nav aria-label="Main navigation">
          {["Overview", "Transactions", "Budgets"].map((item) => (
            <button
              key={item}
              className={activeView === item ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView(item)}
            >
              <span className="nav-dot" />
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <strong>Small steps add up.</strong>
          <p>You are doing better than you think. Keep checking in.</p>
        </div>
        <button
          className="profile"
          onClick={() => setShowProfile(!showProfile)}
          aria-expanded={showProfile}
        >
          <span className="avatar">{name.slice(0, 2).toUpperCase()}</span>
          <span>
            <strong>{name}</strong>
            <small>Student account</small>
          </span>
          <span className="more">•••</span>
        </button>
        {showProfile && (
          <div className="profile-popover">
            <strong>{name}</strong>
            <span>Personal budget space</span>
            <button
              onClick={() => {
                setNameInput(name);
                localStorage.removeItem("student-budget-name");
                setName("");
                setShowProfile(false);
              }}
            >
              Edit profile
            </button>
          </div>
        )}
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">₱</span> pocketwise
          </div>
          <div className="month-picker">
            <button
              aria-label="Previous month"
              onClick={() => setMonthOffset((current) => current - 1)}
            >
              ‹
            </button>
            <span>{displayedMonth}</span>
            <button
              aria-label="Next month"
              onClick={() => setMonthOffset((current) => current + 1)}
            >
              ›
            </button>
          </div>
          <button
            className="theme-toggle"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <button
            className="notification"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            ♧<span />
          </button>
          {showNotifications && (
            <div className="notification-popover">
              <strong>Notifications</strong>
              <p>No new updates yet.</p>
            </div>
          )}
        </header>
        <section className="welcome-row">
          <div>
            <p className="eyebrow">MONDAY, SEPTEMBER 14</p>
            <h1>
              Good morning, {name} <span>✦</span>
            </h1>
            <p className="subtitle">
              Here is your money snapshot for this month.
            </p>
          </div>
          <button className="primary-action" onClick={() => setShowForm(true)}>
            <span>+</span> Add transaction
          </button>
        </section>
        {activeView !== "Overview" ? (
          <section key={activeView} className="tab-view detail-view">
            {activeView === "Transactions" ? (
              <>
                <div className="detail-heading">
                  <div>
                    <p className="eyebrow">TRANSACTIONS</p>
                    <h2>Your spending, all in one place.</h2>
                    <p>{transactions.length} recorded money moves</p>
                  </div>
                  <button className="primary-action" onClick={() => setShowForm(true)}>
                    <span>+</span> Add transaction
                  </button>
                </div>
                <div className="panel transaction-list-panel">
                  {transactions.length === 0 ? (
                    <div className="empty-state">
                      <strong>No transactions yet</strong>
                      <p>Add your first income or expense to start tracking.</p>
                      <button className="primary-action" onClick={() => setShowForm(true)}>
                        Add transaction <span>→</span>
                      </button>
                    </div>
                  ) : (
                    <div className="full-activity-list">
                      {transactions.map((item) => (
                        <div className="activity-item" key={item.id}>
                          <span className={`category-icon ${item.category.toLowerCase()}`}>
                            {item.kind === "income" ? "↗" : "₱"}
                          </span>
                          <span className="activity-name">
                            <strong>{item.title}</strong>
                            <small>{item.category} · {formatDate(item.date)}</small>
                          </span>
                          <strong className={item.kind === "income" ? "income-text" : ""}>
                            {item.kind === "income" ? "+" : "-"}{formatMoney(item.amount)}
                          </strong>
                          <button className="delete-transaction" aria-label={`Delete ${item.title}`} onClick={() => removeTransaction(item.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="detail-heading">
                  <div>
                    <p className="eyebrow">BUDGETS</p>
                    <h2>Plan your month before it plans you.</h2>
                    <p>Set a limit and keep your spending in view.</p>
                  </div>
                </div>
                <div className="budget-detail-grid">
                  <div className="panel budget-summary-panel">
                    <div className="panel-heading"><div><h2>Monthly budget</h2><p>{formatMoney(expenses)} spent so far</p></div><span className="budget-status">{expenses <= monthlyBudget ? "On track" : "Over budget"}</span></div>
                    <strong className="budget-number">{formatMoney(monthlyBudget)}</strong>
                    <div className="budget-progress"><span style={{ width: `${Math.min((expenses / monthlyBudget) * 100, 100)}%` }} /></div>
                    <div className="budget-labels"><span>{Math.round((expenses / monthlyBudget) * 100)}% used</span><span>{formatMoney(Math.max(monthlyBudget - expenses, 0))} left</span></div>
                  </div>
                  <form className="panel budget-form" onSubmit={handleBudgetSubmit}>
                    <h2>Adjust your limit</h2>
                    <p>Choose the maximum you want to spend this month.</p>
                    <label>Budget amount<input type="number" min="1" value={budgetDraft} onChange={(event) => setBudgetDraft(event.target.value)} placeholder={String(monthlyBudget)} /></label>
                    <button className="primary-action form-submit" type="submit">Save budget <span>→</span></button>
                  </form>
                </div>
              </>
            )}
          </section>
        ) : (
          <>
            <section className="metrics-grid">
              <div className="metric-card balance">
                <div className="metric-heading">
                  <span className="metric-icon">◎</span>
                  <span>Available balance</span>
                  <span className="trend positive">↑ 8.4%</span>
                </div>
                <strong>{formatMoney(remaining)}</strong>
                <p>of {formatMoney(15000)} monthly budget</p>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${Math.min((remaining / 15000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-heading">
                  <span className="metric-icon income">↗</span>
                  <span>Income</span>
                </div>
                <strong>{formatMoney(income)}</strong>
                <p className="muted">This month</p>
              </div>
              <div className="metric-card">
                <div className="metric-heading">
                  <span className="metric-icon expense">↘</span>
                  <span>Spent</span>
                </div>
                <strong>{formatMoney(expenses)}</strong>
                <p className="muted">
                  {income ? Math.round((expenses / income) * 100) : 0}% of
                  income
                </p>
              </div>
            </section>
            <section className="content-grid">
              <div className="panel spending-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Spending this month</h2>
                    <p>Keep an eye on where your money goes.</p>
                  </div>
                  <select
                    className="small-select"
                    value={chartRange}
                    onChange={(event) => setChartRange(event.target.value)}
                    aria-label="Spending period"
                  >
                    <option>This month</option>
                    <option>Last month</option>
                  </select>
                </div>
                <div className="chart-area">
                  <div className="chart-y">
                    <span>₱4k</span>
                    <span>₱3k</span>
                    <span>₱2k</span>
                    <span>₱1k</span>
                    <span>₱0</span>
                  </div>
                  <div className="bars">
                    {categoryTotals.map(({ category, total }) => (
                      <div className="bar-group" key={category}>
                        <div className="bar-wrap">
                          <span
                            className={`bar ${category.toLowerCase()}`}
                            style={{
                              height: `${Math.max((total / 4000) * 100, 7)}%`,
                            }}
                          />
                        </div>
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-total">
                  <span>Total spent</span>
                  <strong>{formatMoney(expenses)}</strong>
                  <span className="trend positive">
                    ↑ 4.2% <small>vs last month</small>
                  </span>
                </div>
              </div>
              <div className="panel goal-panel">
                <div className="panel-heading">
                  <div>
                    <h2>My savings goal</h2>
                    <p>One step closer every day.</p>
                  </div>
                  <button
                    className="kebab"
                    aria-label="Goal options"
                    aria-expanded={showGoalMenu}
                    onClick={() => setShowGoalMenu(!showGoalMenu)}
                  >
                    •••
                  </button>
                  {showGoalMenu && (
                    <div className="goal-popover">
                      <button
                        onClick={() => {
                          setShowGoalForm(true);
                          setShowGoalMenu(false);
                        }}
                      >
                        Add goal
                      </button>
                      <button onClick={() => setShowGoalMenu(false)}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
                <div className="goal-visual">
                  <div
                    className="goal-ring"
                    style={{
                      background: `conic-gradient(#2c8168 0 ${goalProgress}%, #dcebe3 ${goalProgress}% 100%)`,
                    }}
                  >
                    <span>
                      {goalProgress}<small>%</small>
                    </span>
                  </div>
                  <div>
                    <strong>{goal.name}</strong>
                    <p>Target: {formatMoney(goal.target)}</p>
                    <p className="goal-date">Due {goal.due}</p>
                  </div>
                </div>
                <div className="goal-progress">
                  <span style={{ width: `${goalProgress}%` }} />
                </div>
                <div className="goal-footer">
                  <span>{formatMoney(goal.saved)} saved</span>
                  <button onClick={() => setShowForm(true)}>
                    Add money <span>→</span>
                  </button>
                </div>
              </div>
            </section>
            <section className="bottom-grid">
              <div className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent activity</h2>
                    <p>Your latest money moves.</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActiveView("Transactions")}
                  >
                    See all <span>→</span>
                  </button>
                </div>
                <div className="activity-list">
                  {transactions.slice(0, 4).map((item) => (
                    <div className="activity-item" key={item.id}>
                      <span
                        className={`category-icon ${item.category.toLowerCase()}`}
                      >
                        {item.category === "Food"
                          ? "✦"
                          : item.category === "Transport"
                            ? "↗"
                            : item.category === "School"
                              ? "▣"
                              : item.category === "Bills"
                                ? "◒"
                                : "₱"}
                      </span>
                      <span className="activity-name">
                        <strong>{item.title}</strong>
                        <small>
                          {item.category} · {formatDate(item.date)}
                        </small>
                      </span>
                      <strong
                        className={item.kind === "income" ? "income-text" : ""}
                      >
                        {item.kind === "income" ? "+" : "-"}
                        {formatMoney(item.amount)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel budget-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Budget check-in</h2>
                    <p>Monthly spending limit</p>
                  </div>
                  <span className="budget-status">On track</span>
                </div>
                <strong className="budget-number">
                  {formatMoney(expenses)} <small>/ {formatMoney(monthlyBudget)}</small>
                </strong>
                <div className="budget-progress">
                  <span
                    style={{
                      width: `${Math.min((expenses / monthlyBudget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="budget-labels">
                  <span>Spent</span>
                  <span>{formatMoney(Math.max(monthlyBudget - expenses, 0))} left</span>
                </div>
                <button
                  className="outline-action"
                  onClick={() => setActiveView("Budgets")}
                >
                  Adjust budget <span>→</span>
                </button>
              </div>
            </section>
          </>
        )}{" "}
      </main>
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <form
            className="transaction-form"
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow">QUICK ENTRY</p>
                <h2>Add transaction</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="type-toggle">
              <button
                type="button"
                className={newTransaction.kind === "expense" ? "selected" : ""}
                onClick={() =>
                  setNewTransaction({ ...newTransaction, kind: "expense" })
                }
              >
                Expense
              </button>
              <button
                type="button"
                className={
                  newTransaction.kind === "income"
                    ? "selected income-selected"
                    : ""
                }
                onClick={() =>
                  setNewTransaction({ ...newTransaction, kind: "income" })
                }
              >
                Income
              </button>
            </div>
            <label>
              Description
              <input
                autoFocus
                value={newTransaction.title}
                onChange={(event) =>
                  setNewTransaction({
                    ...newTransaction,
                    title: event.target.value,
                  })
                }
                placeholder="e.g. Coffee with friends"
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="1"
                value={newTransaction.amount}
                onChange={(event) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: event.target.value,
                  })
                }
                placeholder="0.00"
              />
            </label>
            {newTransaction.kind === "expense" && (
              <label>
                Category
                <select
                  value={newTransaction.category}
                  onChange={(event) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: event.target.value,
                    })
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            )}
            <button className="primary-action form-submit" type="submit">
              Save transaction <span>→</span>
            </button>
          </form>
        </div>
      )}
      {showGoalForm && (
        <div className="modal-backdrop" onClick={() => setShowGoalForm(false)}>
          <form
            className="transaction-form"
            onSubmit={handleGoalSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow">SAVINGS PLAN</p>
                <h2>Add a goal</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowGoalForm(false)}
              >
                ×
              </button>
            </div>
            <label>
              Goal name
              <input
                autoFocus
                value={goalDraft.name}
                onChange={(event) =>
                  setGoalDraft({ ...goalDraft, name: event.target.value })
                }
                placeholder="e.g. Emergency fund"
              />
            </label>
            <label>
              Target amount
              <input
                type="number"
                min="1"
                value={goalDraft.target}
                onChange={(event) =>
                  setGoalDraft({ ...goalDraft, target: event.target.value })
                }
                placeholder="35000"
              />
            </label>
            <label>
              Due date
              <input
                value={goalDraft.due}
                onChange={(event) =>
                  setGoalDraft({ ...goalDraft, due: event.target.value })
                }
                placeholder="December 2026"
              />
            </label>
            <button className="primary-action form-submit" type="submit">
              Save goal <span>→</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
