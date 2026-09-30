import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:5001/api'

type Transaction = {
  id: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  totalAmount: number
  executedAt: string
  stock: {
    symbol: string
    companyName: string
  }
}

type Props = {
  onBack: () => void
}

function Transactions({ onBack }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('stocker_token')

  async function loadTransactions() {
    try {
      setLoading(true)
      setMessage('')

      const response = await fetch(API + '/transactions', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setMessage(
          data.message || 'Unable to load transactions',
        )
        return
      }

      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Transactions error:', error)
      setMessage('Unable to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  function formatDate(dateString: string) {
    const date = new Date(dateString)

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '28px',
        boxSizing: 'border-box',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="eyebrow">STOCKER</p>
          <h2 style={{ margin: 0 }}>
            Transaction History
          </h2>
        </div>

        <button
          className="logout-button"
          onClick={onBack}
        >
          Back to Overview
        </button>
      </header>

      <section
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '26px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '22px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="section-label">
              TRADING ACTIVITY
            </span>

            <h3 style={{ marginTop: '8px' }}>
              Your Transactions
            </h3>
          </div>

          <strong>
            {transactions.length} transactions
          </strong>
        </div>

        {message && (
          <div
            className="trade-message"
            style={{ marginBottom: '20px' }}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            No transactions yet. Buy or sell a stock to see
            your trading history here.
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                minWidth: '750px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.5fr 0.8fr 0.8fr 1fr 1fr 1.3fr',
                  gap: '15px',
                  padding: '14px 16px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '13px',
                  fontWeight: 700,
                  opacity: 0.6,
                }}
              >
                <span>Stock</span>
                <span>Type</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
                <span>Date</span>
              </div>

              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1.5fr 0.8fr 0.8fr 1fr 1fr 1.3fr',
                    gap: '15px',
                    alignItems: 'center',
                    padding: '18px 16px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        borderRadius: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        background: '#f1f5f9',
                      }}
                    >
                      {transaction.stock.symbol.charAt(0)}
                    </div>

                    <div>
                      <strong
                        style={{
                          display: 'block',
                        }}
                      >
                        {transaction.stock.symbol}
                      </strong>

                      <small
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          opacity: 0.6,
                        }}
                      >
                        {transaction.stock.companyName}
                      </small>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background:
                          transaction.type === 'BUY'
                            ? '#dcfce7'
                            : '#fee2e2',
                        color:
                          transaction.type === 'BUY'
                            ? '#166534'
                            : '#991b1b',
                      }}
                    >
                      {transaction.type}
                    </span>
                  </div>

                  <strong>
                    {transaction.quantity}
                  </strong>

                  <span>
                    Rs.
                    {transaction.price.toFixed(2)}
                  </span>

                  <strong>
                    Rs.
                    {transaction.totalAmount.toFixed(2)}
                  </strong>

                  <small>
                    {formatDate(
                      transaction.executedAt,
                    )}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer style={{ marginTop: '30px' }}>
        <span>
          Stocker - AWS-ready stock market platform
        </span>

        <span>
          Demo market data - Backend connected
        </span>
      </footer>
    </main>
  )
}

export default Transactions