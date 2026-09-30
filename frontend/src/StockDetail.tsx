import { useState } from 'react'
import './StockDetail.css'

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

type StockDetailProps = {
stock: Stock
onBack: () => void
}

function StockDetail({ stock, onBack }: StockDetailProps) {
const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
const [quantity, setQuantity] = useState('')
const [loading, setLoading] = useState(false)
const [message, setMessage] = useState('')
const [error, setError] = useState('')

const token = localStorage.getItem('stocker_token')

const formatMoney = (value: number) =>
'₹' +
value.toLocaleString('en-IN', {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
})

const estimatedTotal =
quantity && Number(quantity) > 0
? Number(quantity) * stock.currentPrice
: 0

async function handleTrade() {
setMessage('')
setError('')

const tradeQuantity = Number(quantity)

if (!quantity || tradeQuantity <= 0) {
  setError('Enter a valid quantity.')
  return
}

if (!token) {
  setError('Please login again.')
  return
}

setLoading(true)

try {
  const response = await fetch(API + '/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      symbol: stock.symbol,
      type: tradeType,
      quantity: tradeQuantity,
      price: stock.currentPrice,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Transaction failed')
  }

  setMessage(
    tradeType === 'BUY'
      ? 'Buy order recorded successfully.'
      : 'Sell order recorded successfully.',
  )

  setQuantity('')

  setTimeout(() => {
    onBack()
  }, 700)
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Transaction failed',
  )
} finally {
  setLoading(false)
}

}

return ( <div className="stock-detail-page"> <header className="detail-header"> <button
       className="back-button"
       onClick={onBack}
     >
← Back </button>

    <div className="detail-actions">
      <button className="outline-button">
        ☆ Watchlist
      </button>

      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('stocker_token')
          window.location.reload()
        }}
      >
        Logout
      </button>
    </div>
  </header>

  <main className="detail-content">
    <section className="stock-hero">
      <div className="stock-title">
        <div className="large-stock-logo">
          {stock.symbol.charAt(0)}
        </div>

        <div>
          <div className="symbol-line">
            <span>{stock.symbol}</span>
            <small>{stock.exchange}</small>
          </div>

          <h1>{stock.companyName}</h1>

          <p>
            {stock.sector || 'Market Stock'}
          </p>
        </div>
      </div>

      <div className="price-block">
        <strong>
          {formatMoney(stock.currentPrice)}
        </strong>

        <span
          className={
            stock.dayChange >= 0
              ? 'detail-positive'
              : 'detail-negative'
          }
        >
          {stock.dayChange >= 0 ? '+' : ''}
          {stock.dayChange.toFixed(2)} (
          {stock.dayChangePct >= 0 ? '+' : ''}
          {stock.dayChangePct.toFixed(2)}%)
        </span>
      </div>
    </section>

    <section className="detail-grid">
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="detail-label">
              PRICE PERFORMANCE
            </div>

            <h2>
              {formatMoney(stock.currentPrice)}
            </h2>
          </div>

          <div className="time-tabs">
            <button className="selected">
              1D
            </button>

            <button>1W</button>
            <button>1M</button>
            <button>1Y</button>
          </div>
        </div>

        <div className="large-chart">
          <div className="chart-lines">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg
            viewBox="0 0 900 300"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,235 75,220 150,228 225,180 300,195 375,155 450,170 525,125 600,145 675,105 750,118 825,78 900,92"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>

          <div className="chart-time">
            <span>9:30</span>
            <span>11:00</span>
            <span>12:30</span>
            <span>2:00</span>
            <span>3:30</span>
          </div>
        </div>
      </div>

      <div className="trade-card">
        <div className="trade-tabs">
          <button
            className={
              tradeType === 'BUY'
                ? 'trade-active'
                : ''
            }
            onClick={() => {
              setTradeType('BUY')
              setMessage('')
              setError('')
            }}
          >
            Buy
          </button>

          <button
            className={
              tradeType === 'SELL'
                ? 'trade-active'
                : ''
            }
            onClick={() => {
              setTradeType('SELL')
              setMessage('')
              setError('')
            }}
          >
            Sell
          </button>
        </div>

        <div className="trade-heading">
          <span>{stock.symbol}</span>

          <strong>
            {formatMoney(stock.currentPrice)}
          </strong>
        </div>

        <label>
          Quantity

          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            placeholder="Enter quantity"
          />
        </label>

        <div className="trade-summary">
          <span>
            <span>Price</span>
            <strong>
              {formatMoney(stock.currentPrice)}
            </strong>
          </span>

          <span>
            <span>Estimated total</span>
            <strong>
              {formatMoney(estimatedTotal)}
            </strong>
          </span>
        </div>

        <button
          className={
            tradeType === 'BUY'
              ? 'execute-button buy'
              : 'execute-button sell'
          }
          onClick={handleTrade}
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : tradeType === 'BUY'
              ? 'Buy ' + stock.symbol
              : 'Sell ' + stock.symbol}
        </button>

        {message && (
          <div className="trade-message">
            {message}
          </div>
        )}

        {error && (
          <div className="trade-message">
            {error}
          </div>
        )}

        <small className="demo-note">
          Demo trading • No real money involved
        </small>
      </div>
    </section>

    <section className="stats-section">
      <div className="stat-box">
        <span>PREVIOUS CLOSE</span>
        <strong>
          {formatMoney(stock.previousClose)}
        </strong>
      </div>

      <div className="stat-box">
        <span>DAY CHANGE</span>
        <strong
          className={
            stock.dayChange >= 0
              ? 'detail-positive'
              : 'detail-negative'
          }
        >
          {stock.dayChange >= 0 ? '+' : ''}
          {formatMoney(stock.dayChange)}
        </strong>
      </div>

      <div className="stat-box">
        <span>MARKET CAP</span>
        <strong>
          {stock.marketCap
            ? formatMoney(stock.marketCap)
            : '—'}
        </strong>
      </div>

      <div className="stat-box">
        <span>VOLUME</span>
        <strong>
          {stock.volume
            ? stock.volume.toLocaleString('en-IN')
            : '—'}
        </strong>
      </div>
    </section>
  </main>
</div>

)
}

export default StockDetail
