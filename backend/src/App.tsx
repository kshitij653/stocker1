import { useEffect, useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'

const API = 'http://127.0.0.1:5001/api'

type Stock = {
  id: string
  symbol: string
  companyName: string
  exchange: string
  sector?: string
  currentPrice: number
  previousClose: number
  dayChange: number
  dayChangePct: number
  marketCap?: number
  volume?: number
}

type Holding = {
  id: string
  quantity: number
  averagePrice: number
  currentValue: number
  investedValue: number
  profitLoss: number
  profitLossPct: number
  stock: Stock
}

type Alert = {
  id: string
  type: 'ABOVE' | 'BELOW'
  targetPrice: number
  isTriggered: boolean
  stock: Stock
}

function App() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('stocker_token')

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  async function loadDashboard() {
    try {
      setLoading(true)

      const stocksResponse = await fetch(`${API}/stocks`)
      const stocksData = await stocksResponse.json()

      if (stocksData.success) {
        setStocks(stocksData.stocks)
      }

      if (token) {
        const [holdingsResponse, alertsResponse] = await Promise.all([
          fetch(`${API}/holdings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API}/alerts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        const holdingsData = await holdingsResponse.json()
        const alertsData = await alertsResponse.json()

        if (holdingsData.success) {
          setHoldings(holdingsData.holdings)
        }

        if (alertsData.success) {
          setAlerts(alertsData.alerts)
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (selectedStock) {
    return (
      <StockDetail
        stock={selectedStock}
        onBack={() => {
          setSelectedStock(null)
          loadDashboard()
        }}
      />
    )
  }

  const totalCurrentValue = holdings.reduce(
    (sum, holding) => sum + holding.currentValue,
    0,
  )

  const totalInvested = holdings.reduce(
    (sum, holding) => sum + holding.investedValue,
    0,
  )

  const totalProfitLoss = totalCurrentValue - totalInvested

  const totalProfitLossPct =
    totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0

  const logout = () => {
    localStorage.removeItem('stocker_token')
    window.location.reload()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <h1>Stocker</h1>
            <span>Market Intelligence</span>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">
            ⌂ Overview
          </button>

          <button className="nav-item">
            ↗ Markets
          </button>

          <button className="nav-item">
            ★ Watchlist
          </button>

          <button className="nav-item">
            ◉ Alerts
            {alerts.length > 0 && (
              <span className="nav-badge">{alerts.length}</span>
            )}
          </button>
        </nav>

        <div className="user-area">
          <div className="market-status">
            <span className="status-dot" />
            Market Open
            <small>NSE • BSE</small>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-top">
          <div>
            <span className="eyebrow">
              WEDNESDAY, SEPTEMBER 30, 2026
            </span>

            <h2>Overview</h2>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input placeholder="Search stocks" />
            <kbd>⌘ K</kbd>
          </div>
        </div>

        {loading ? (
          <div className="loading-card">
            Loading market data...
          </div>
        ) : (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">
                  MARKET
                  <span className="live-pill">LIVE</span>
                </div>

                <strong>{stocks.length} Stocks</strong>
                <span className="summary-muted">Connected</span>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  PORTFOLIO
                  <span className="live-pill">LIVE</span>
                </div>

                <strong>
                  {formatMoney(totalCurrentValue)}
                </strong>

                <span
                  className={
                    totalProfitLoss >= 0
                      ? 'positive'
                      : 'negative'
                  }
                >
                  {totalProfitLoss >= 0 ? '+' : ''}
                  {formatMoney(totalProfitLoss)}
                </span>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  HOLDINGS
                  <span className="db-pill">DB</span>
                </div>

                <strong>{holdings.length}</strong>
                <span className="summary-muted">
                  Active positions
                </span>
              </div>

              <div className="summary-card">
                <div className="summary-label">
                  PORTFOLIO VALUE
                </div>

                <strong>
                  {formatMoney(totalCurrentValue)}
                </strong>

                <span
                  className={
                    totalProfitLoss >= 0
                      ? 'positive'
                      : 'negative'
                  }
                >
                  {totalProfitLoss >= 0 ? '+' : ''}
                  {formatMoney(totalProfitLoss)}
                </span>
              </div>
            </section>

            <section className="main-grid">
              <div className="portfolio-card">
                <div className="section-header">
                  <div>
                    <span className="eyebrow">
                      PORTFOLIO VALUE
                    </span>

                    <h3>
                      {formatMoney(totalCurrentValue)}
                    </h3>
                  </div>

                  <span
                    className={
                      totalProfitLoss >= 0
                        ? 'return-badge positive'
                        : 'return-badge negative'
                    }
                  >
                    {totalProfitLoss >= 0 ? '+' : ''}
                    {totalProfitLossPct.toFixed(2)}%
                  </span>
                </div>

                <div className="portfolio-meta">
                  <div>
                    <span>Total invested</span>
                    <strong>
                      {formatMoney(totalInvested)}
                    </strong>
                  </div>

                  <div>
                    <span>Total return</span>
                    <strong
                      className={
                        totalProfitLoss >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {totalProfitLoss >= 0 ? '+' : ''}
                      {formatMoney(totalProfitLoss)}
                    </strong>
                  </div>
                </div>

                <div className="portfolio-chart">
                  <svg
                    viewBox="0 0 900 260"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="55"
                      x2="900"
                      y2="55"
                    />

                    <line
                      x1="0"
                      y1="120"
                      x2="900"
                      y2="120"
                    />

                    <line
                      x1="0"
                      y1="185"
                      x2="900"
                      y2="185"
                    />

                    <polyline
                      points="0,205 90,190 180,198 270,155 360,165 450,130 540,145 630,105 720,120 810,72 900,88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>

                  <div className="chart-labels">
                    <span>9:30</span>
                    <span>11:00</span>
                    <span>12:30</span>
                    <span>2:00</span>
                    <span>3:30</span>
                  </div>
                </div>
              </div>

              <aside className="alerts-card">
                <div className="section-header">
                  <div>
                    <span className="eyebrow">
                      SMART ALERTS
                    </span>

                    <h3>{alerts.length} Active</h3>
                  </div>

                  <button className="add-button">+</button>
                </div>

                {alerts.length === 0 ? (
                  <div className="empty-state">
                    No active alerts
                  </div>
                ) : (
                  <div className="alert-list">
                    {alerts.slice(0, 4).map((alert) => (
                      <div
                        className="alert-item"
                        key={alert.id}
                      >
                        <div className="stock-mini">
                          {alert.stock.symbol.charAt(0)}
                        </div>

                        <div className="alert-info">
                          <strong>
                            {alert.stock.symbol}
                          </strong>

                          <span>
                            Price{' '}
                            {alert.type === 'ABOVE'
                              ? 'above'
                              : 'below'}{' '}
                            {formatMoney(
                              alert.targetPrice,
                            )}
                          </span>
                        </div>

                        <small>Active</small>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </section>

            <section className="market-section">
              <div className="section-header">
                <div>
                  <span className="eyebrow">
                    MARKET WATCH
                  </span>

                  <h3>Stocks</h3>
                </div>

                <span className="view-all">
                  {stocks.length} available →
                </span>
              </div>

              <div className="stocks-table">
                <div className="table-header">
                  <span>Company</span>
                  <span>Price</span>
                  <span>Change</span>
                  <span>Action</span>
                </div>

                {stocks.map((stock) => (
                  <div
                    className="stock-row"
                    key={stock.id}
                  >
                    <div className="company-cell">
                      <div className="stock-logo">
                        {stock.symbol.charAt(0)}
                      </div>

                      <div>
                        <strong>{stock.symbol}</strong>
                        <span>{stock.companyName}</span>
                      </div>
                    </div>

                    <strong>
                      {formatMoney(stock.currentPrice)}
                    </strong>

                    <span
                      className={
                        stock.dayChange >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {stock.dayChange >= 0 ? '↗' : '↘'}{' '}
                      {stock.dayChange >= 0 ? '+' : ''}
                      {stock.dayChange.toFixed(2)} (
                      {stock.dayChangePct >= 0 ? '+' : ''}
                      {stock.dayChangePct.toFixed(2)}%)
                    </span>

                    <button
                      className="watch"
                      onClick={() =>
                        setSelectedStock(stock)
                      }
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App