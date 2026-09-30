import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:5001/api'

type Stock = {
  id: string
  symbol: string
  companyName: string
  currentPrice: number
  dayChange: number
  dayChangePct: number
}

type WatchlistItem = {
  id: string
  stock: Stock
}

type WatchlistData = {
  id: string
  name: string
  items: WatchlistItem[]
}

type Props = {
  stocks: Stock[]
  onBack: () => void
  onViewStock: (stock: Stock) => void
}

function Watchlist({ stocks, onBack, onViewStock }: Props) {
  const [watchlist, setWatchlist] = useState<WatchlistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('stocker_token')

  async function loadWatchlist() {
    try {
      setLoading(true)

      const response = await fetch(API + '/watchlists', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      const data = await response.json()

      if (data.success && data.watchlists.length > 0) {
        setWatchlist(data.watchlists[0])
      } else if (data.success) {
        const createResponse = await fetch(API + '/watchlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            name: 'My Stocks',
          }),
        })

        const createData = await createResponse.json()

        if (createData.success) {
          setWatchlist(createData.watchlist)
        }
      }
    } catch (error) {
      console.error('Watchlist error:', error)
      setMessage('Unable to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [])

  async function addStock(symbol: string) {
    if (!watchlist) return

    try {
      const response = await fetch(
        API + '/watchlists/' + watchlist.id + '/stocks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({ symbol }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setMessage(data.message || 'Unable to add stock')
        return
      }

      setMessage(symbol + ' added to watchlist')
      await loadWatchlist()
    } catch {
      setMessage('Unable to add stock')
    }
  }

  async function removeStock(stockId: string) {
    if (!watchlist) return

    try {
      const response = await fetch(
        API +
          '/watchlists/' +
          watchlist.id +
          '/stocks/' +
          stockId,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setMessage(data.message || 'Unable to remove stock')
        return
      }

      setMessage('Stock removed from watchlist')
      await loadWatchlist()
    } catch {
      setMessage('Unable to remove stock')
    }
  }

  const watchedIds = new Set(
    watchlist?.items.map((item) => item.stock.id) || [],
  )

  const availableStocks = stocks.filter(
    (stock) => !watchedIds.has(stock.id),
  )

  if (loading) {
    return (
      <main className="main">
        <div className="empty-state">
          Loading watchlist...
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <header className="topbar">
        <div>
          <p className="eyebrow">STOCKER</p>
          <h2>Watchlist</h2>
        </div>

        <button className="logout-button" onClick={onBack}>
          Back to Overview
        </button>
      </header>

      <section className="stocks-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              MY WATCHLIST
            </span>

            <h3>
              {watchlist?.name || 'My Stocks'}
            </h3>
          </div>

          <span className="view-all">
            {watchlist?.items.length || 0} saved
          </span>
        </div>

        {message && (
          <div className="trade-message">
            {message}
          </div>
        )}

        {watchlist && watchlist.items.length === 0 ? (
          <div className="empty-state">
            Your watchlist is empty. Add stocks below.
          </div>
        ) : (
          <div className="stock-table">
            <div className="table-header">
              <span>Company</span>
              <span>Price</span>
              <span>Change</span>
              <span>Action</span>
            </div>

            {watchlist?.items.map((item) => (
              <div
                className="stock-row"
                key={item.id}
              >
                <div className="company">
                  <div className="stock-logo">
                    {item.stock.symbol.charAt(0)}
                  </div>

                  <div>
                    <strong>{item.stock.symbol}</strong>
                    <small>
                      {item.stock.companyName}
                    </small>
                  </div>
                </div>

                <strong className="stock-price">
                  Rs.
                  {item.stock.currentPrice.toFixed(2)}
                </strong>

                <div
                  className={
                    item.stock.dayChange >= 0
                      ? 'change positive'
                      : 'change negative'
                  }
                >
                  {item.stock.dayChange >= 0 ? '+' : '-'}
                  {Math.abs(item.stock.dayChange).toFixed(2)}
                  {' ('}
                  {item.stock.dayChangePct >= 0 ? '+' : '-'}
                  {Math.abs(
                    item.stock.dayChangePct,
                  ).toFixed(2)}
                  {'%)'}
                </div>

                <div>
                  <button
                    className="watch"
                    onClick={() =>
                      onViewStock(item.stock)
                    }
                  >
                    View
                  </button>

                  <button
                    className="watch"
                    onClick={() =>
                      removeStock(item.stock.id)
                    }
                    style={{ marginLeft: '8px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stocks-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              ADD STOCKS
            </span>

            <h3>Available Stocks</h3>
          </div>
        </div>

        <div className="stock-table">
          {availableStocks.map((stock) => (
            <div
              className="stock-row"
              key={stock.id}
            >
              <div className="company">
                <div className="stock-logo">
                  {stock.symbol.charAt(0)}
                </div>

                <div>
                  <strong>{stock.symbol}</strong>
                  <small>{stock.companyName}</small>
                </div>
              </div>

              <strong className="stock-price">
                Rs.{stock.currentPrice.toFixed(2)}
              </strong>

              <div className="change positive">
                +{stock.dayChangePct.toFixed(2)}%
              </div>

              <button
                className="watch"
                onClick={() => addStock(stock.symbol)}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Watchlist