import { useEffect, useState } from 'react'
import './App.css'
import StockDetail from './StockDetail'
import Watchlist from './Watchlist'
import Alerts from './Alerts'
import Transactions from './Transactions'

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
  type: string
  targetPrice: number
  stock: Stock
}

function App() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] =
    useState<Stock | null>(null)

  const token = localStorage.getItem('stocker_token')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)

      const stockResponse = await fetch(API + '/stocks')
      const stockData = await stockResponse.json()

      if (stockData.success) {
        setStocks(stockData.stocks)
      }

      if (token) {
        const headers = {
          Authorization: 'Bearer ' + token,
        }

        const [holdingResponse, alertResponse] =
          await Promise.all([
            fetch(API + '/holdings', { headers }),
            fetch(API + '/alerts', { headers }),
          ])

        const holdingData =
          await holdingResponse.json()

        const alertData =
          await alertResponse.json()

        if (holdingData.success) {
          setHoldings(holdingData.holdings)
        }

        if (alertData.success) {
          setAlerts(alertData.alerts || [])
        }
      }
    } catch (error) {
      console.error(
        'Dashboard loading error:',
        error,
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = stocks.filter((stock) => {
    const query = search.toLowerCase().trim()

    if (!query) {
      return true
    }

    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.companyName
        .toLowerCase()
        .includes(query)
    )
  })

  const totalInvested = holdings.reduce(
    (sum, holding) =>
      sum + holding.investedValue,
    0,
  )

  const totalCurrentValue = holdings.reduce(
    (sum, holding) =>
      sum + holding.currentValue,
    0,
  )

  const totalProfitLoss =
    totalCurrentValue - totalInvested

  const totalProfitLossPct =
    totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0

  const formatMoney = (value: number) =>
    'Rs.' +
    value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

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

  if (activeTab === 'Watchlist') {
    return (
      <Watchlist
        stocks={stocks}
        onBack={() =>
          setActiveTab('Overview')
        }
        onViewStock={(stock) =>
          setSelectedStock(stock)
        }
      />
    )
  }

  if (activeTab === 'Alerts') {
    return (
      <Alerts
        stocks={stocks}
        onBack={() =>
          setActiveTab('Overview')
        }
      />
    )
  }

  if (activeTab === 'Transactions') {
    return (
      <Transactions
        onBack={() =>
          setActiveTab('Overview')
        }
      />
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            S
          </div>

          <div>
            <h1>Stocker</h1>
            <span>Market Intelligence</span>
          </div>
        </div>

        <nav className="nav">
          {[
            'Overview',
            'Markets',
            'Watchlist',
            'Alerts',
            'Transactions',
          ].map((item) => (
            <button
              key={item}
              className={
                activeTab === item
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() =>
                setActiveTab(item)
              }
            >
              <span className="nav-icon">
                {item === 'Overview' && 'O'}
                {item === 'Markets' && '+'}
                {item === 'Watchlist' && '*'}
                {item === 'Alerts' && 'O'}
                {item === 'Transactions' && '$'}
              </span>

              {item}

              {item === 'Alerts' &&
                alerts.length > 0 && (
                  <span className="notification-dot">
                    {alerts.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="market-status">
            <span className="status-dot" />

            <div>
              <strong>Market Open</strong>
              <small>NSE - BSE</small>
            </div>
          </div>

          <div className="user-card">
            <div className="avatar">
              G
            </div>

            <div>
              <strong>Investor</strong>
              <small>Stocker account</small>
            </div>

            <span>---</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              WEDNESDAY, SEPTEMBER 30, 2026
            </p>

            <h2>{activeTab}</h2>
          </div>

          <div className="top-actions">
            <div className="search">
              <span>S</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search stocks, companies..."
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() =>
                    setSearch('')
                  }
                >
                  X
                </button>
              )}

              <kbd>Ctrl K</kbd>
            </div>

            <button className="icon-button">
              O
            </button>

            <button
              className="logout-button"
              onClick={() => {
                localStorage.removeItem(
                  'stocker_token',
                )
                window.location.reload()
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {search.trim() && (
          <div className="search-results-info">
            Showing {filteredStocks.length} result
            {filteredStocks.length === 1
              ? ''
              : 's'} for "{search}"
          </div>
        )}

        <section className="indices">
          <div className="index-card">
            <div className="index-top">
              <span>MARKET</span>
              <span className="live-label">
                LIVE
              </span>
            </div>

            <strong>
              {stocks.length} Stocks
            </strong>

            <div className="index-change">
              <span className="positive">
                Connected
              </span>
            </div>
          </div>

          <div className="index-card">
            <div className="index-top">
              <span>PORTFOLIO</span>
              <span className="live-label">
                LIVE
              </span>
            </div>

            <strong>
              {formatMoney(totalCurrentValue)}
            </strong>

            <div className="index-change">
              <span
                className={
                  totalProfitLoss >= 0
                    ? 'positive'
                    : 'negative'
                }
              >
                {totalProfitLoss >= 0
                  ? '+'
                  : ''}
                {formatMoney(totalProfitLoss)}
              </span>
            </div>
          </div>

          <div className="index-card">
            <div className="index-top">
              <span>HOLDINGS</span>
              <span className="live-label">
                DB
              </span>
            </div>

            <strong>
              {holdings.length}
            </strong>

            <div className="index-change">
              <span className="positive">
                Active positions
              </span>
            </div>
          </div>
        </section>

        <section className="hero-grid">
          <div className="hero-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  PORTFOLIO VALUE
                </span>

                <h3>
                  {formatMoney(
                    totalCurrentValue,
                  )}
                </h3>
              </div>

              <span
                className={
                  totalProfitLoss >= 0
                    ? 'profit-pill'
                    : 'loss-pill'
                }
              >
                {totalProfitLoss >= 0
                  ? '+'
                  : ''}
                {formatMoney(
                  totalProfitLoss,
                )}
              </span>
            </div>

            <div className="portfolio-meta">
              <span>
                Total invested{' '}
                <strong>
                  {formatMoney(
                    totalInvested,
                  )}
                </strong>
              </span>

              <span>
                Total return{' '}
                <strong
                  className={
                    totalProfitLossPct >=
                    0
                      ? 'positive'
                      : 'negative'
                  }
                >
                  {totalProfitLossPct >= 0
                    ? '+'
                    : ''}
                  {totalProfitLossPct.toFixed(
                    2,
                  )}
                  %
                </strong>
              </span>
            </div>

            <div className="chart">
              <div className="chart-grid">
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                viewBox="0 0 800 190"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,150 C45,145 55,128 95,136 C135,144 148,105 188,113 C230,121 238,95 278,104 C320,113 337,76 380,84 C420,92 437,62 480,71 C520,80 540,47 580,59 C620,71 648,35 680,46 C720,59 744,26 800,20 L800,190 L0,190 Z"
                  fill="currentColor"
                  opacity="0.08"
                />

                <path
                  d="M0,150 C45,145 55,128 95,136 C135,144 148,105 188,113 C230,121 238,95 278,104 C320,113 337,76 380,84 C420,92 437,62 480,71 C520,80 540,47 580,59 C620,71 648,35 680,46 C720,59 744,26 800,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
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

          <div className="alert-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  SMART ALERTS
                </span>

                <h3>
                  {alerts.length} Active
                </h3>
              </div>

              <button
                className="add-button"
                onClick={() =>
                  setActiveTab('Alerts')
                }
              >
                +
              </button>
            </div>

            <div className="alert-list">
              {alerts.length === 0 ? (
                <div className="empty-state">
                  No active alerts
                </div>
              ) : (
                alerts
                  .slice(0, 3)
                  .map((alert) => (
                    <div
                      className="alert-row"
                      key={alert.id}
                    >
                      <div className="alert-symbol">
                        {alert.stock.symbol.charAt(
                          0,
                        )}
                      </div>

                      <div>
                        <strong>
                          {alert.stock.symbol}
                        </strong>

                        <small>
                          Price{' '}
                          {alert.type ===
                          'ABOVE'
                            ? 'above'
                            : 'below'}{' '}
                          {formatMoney(
                            alert.targetPrice,
                          )}
                        </small>
                      </div>

                      <span className="alert-active">
                        Active
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        <section className="stocks-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                MARKET WATCH
              </span>

              <h3>Stocks</h3>
            </div>

            <span className="view-all">
              {filteredStocks.length} available
            </span>
          </div>

          <div className="stock-table">
            <div className="table-header">
              <span>Company</span>
              <span>Price</span>
              <span>Change</span>
              <span>Action</span>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading market data...
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="empty-state">
                No stocks found for "{search}"
              </div>
            ) : (
              filteredStocks.map((stock) => (
                <div
                  className="stock-row"
                  key={stock.symbol}
                >
                  <div className="company">
                    <div className="stock-logo">
                      {stock.symbol.charAt(
                        0,
                      )}
                    </div>

                    <div>
                      <strong>
                        {stock.symbol}
                      </strong>

                      <small>
                        {stock.companyName}
                      </small>
                    </div>
                  </div>

                  <strong className="stock-price">
                    {formatMoney(
                      stock.currentPrice,
                    )}
                  </strong>

                  <div
                    className={
                      stock.dayChange >= 0
                        ? 'change positive'
                        : 'change negative'
                    }
                  >
                    {stock.dayChange >= 0
                      ? '+'
                      : '-'}
                    {Math.abs(
                      stock.dayChange,
                    ).toFixed(2)}
                    {' ('}
                    {stock.dayChangePct >= 0
                      ? '+'
                      : '-'}
                    {Math.abs(
                      stock.dayChangePct,
                    ).toFixed(2)}
                    {'%)'}
                  </div>

                  <button
                    className="watch"
                    onClick={() =>
                      setSelectedStock(stock)
                    }
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <footer>
          <span>
            Stocker - AWS-ready stock market platform
          </span>

          <span>
            Demo market data - Backend connected
          </span>
        </footer>
      </main>
    </div>
  )
}

export default App