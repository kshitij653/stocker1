import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:5001/api'

type Stock = {
  id: string
  symbol: string
  companyName: string
  currentPrice: number
}

type Alert = {
  id: string
  type: string
  targetPrice: number
  stock: Stock
  isTriggered: boolean
}

type Props = {
  stocks: Stock[]
  onBack: () => void
}

function Alerts({ stocks, onBack }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState('ABOVE')
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('stocker_token')

  useEffect(() => {
    if (stocks.length > 0 && !symbol) {
      setSymbol(stocks[0].symbol)
    }
  }, [stocks, symbol])

  async function loadAlerts() {
    try {
      setLoading(true)

      const response = await fetch(API + '/alerts', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      const data = await response.json()

      if (data.success) {
        setAlerts(data.alerts || [])
      } else {
        setMessage(data.message || 'Unable to load alerts')
      }
    } catch (error) {
      console.error('Alerts error:', error)
      setMessage('Unable to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  async function createAlert() {
    if (!symbol) {
      setMessage('Select a stock')
      return
    }

    if (!targetPrice || Number(targetPrice) <= 0) {
      setMessage('Enter a valid target price')
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const response = await fetch(API + '/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          symbol,
          type,
          targetPrice: Number(targetPrice),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setMessage(data.message || 'Unable to create alert')
        return
      }

      setMessage('Price alert created successfully')
      setTargetPrice('')

      await loadAlerts()
    } catch (error) {
      console.error('Create alert error:', error)
      setMessage('Unable to create alert')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAlert(id: string) {
    try {
      const response = await fetch(
        API + '/alerts/' + id,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setMessage(data.message || 'Unable to delete alert')
        return
      }

      setMessage('Alert deleted successfully')

      await loadAlerts()
    } catch (error) {
      console.error('Delete alert error:', error)
      setMessage('Unable to delete alert')
    }
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
          <h2 style={{ margin: 0 }}>Alerts</h2>
        </div>

        <button
          className="logout-button"
          onClick={onBack}
        >
          Back to Overview
        </button>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(320px, 0.9fr) minmax(420px, 1.1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <section
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '26px',
            boxSizing: 'border-box',
            minWidth: 0,
          }}
        >
          <div style={{ marginBottom: '22px' }}>
            <span className="section-label">
              CREATE ALERT
            </span>

            <h3 style={{ marginTop: '8px' }}>
              Price Alert
            </h3>

            <p style={{ marginTop: '8px', opacity: 0.65 }}>
              Get an alert when a stock reaches your target price.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <strong>Stock</strong>

              <select
                value={symbol}
                onChange={(event) =>
                  setSymbol(event.target.value)
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                }}
              >
                {stocks.map((stock) => (
                  <option
                    key={stock.symbol}
                    value={stock.symbol}
                  >
                    {stock.symbol} - {stock.companyName}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <strong>Condition</strong>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                }}
              >
                <option value="ABOVE">
                  Price goes above
                </option>

                <option value="BELOW">
                  Price goes below
                </option>
              </select>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <strong>Target Price</strong>

              <input
                type="number"
                min="0"
                step="0.01"
                value={targetPrice}
                onChange={(event) =>
                  setTargetPrice(event.target.value)
                }
                placeholder="250.00"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                }}
              />
            </label>

            <button
              className="execute-button buy"
              onClick={createAlert}
              disabled={saving}
              style={{
                width: '100%',
                marginTop: '4px',
              }}
            >
              {saving ? 'Creating...' : 'Create Alert'}
            </button>

            {message && (
              <div
                className="trade-message"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {message}
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '26px',
            boxSizing: 'border-box',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '22px',
            }}
          >
            <div>
              <span className="section-label">
                SMART ALERTS
              </span>

              <h3 style={{ marginTop: '8px' }}>
                Active Alerts
              </h3>
            </div>

            <strong>
              {alerts.length}
            </strong>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              No alerts created yet
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                maxHeight: '520px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '18px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    boxSizing: 'border-box',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      minWidth: '46px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      background: '#f1f5f9',
                    }}
                  >
                    {alert.stock.symbol.charAt(0)}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '16px',
                      }}
                    >
                      {alert.stock.symbol}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '5px',
                        opacity: 0.65,
                        fontSize: '14px',
                      }}
                    >
                      {alert.stock.companyName}
                    </span>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '7px',
                        fontSize: '14px',
                      }}
                    >
                      Alert when price is{' '}
                      <strong>
                        {alert.type === 'ABOVE'
                          ? 'above'
                          : 'below'}
                      </strong>{' '}
                      Rs.
                      {alert.targetPrice.toFixed(2)}
                    </span>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '5px',
                        fontSize: '13px',
                        opacity: 0.55,
                      }}
                    >
                      Current price: Rs.
                      {alert.stock.currentPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    className="watch"
                    onClick={() =>
                      deleteAlert(alert.id)
                    }
                    style={{
                      flexShrink: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer style={{ marginTop: '30px' }}>
        <span>
          Stocker - AWS-ready stock market platform
        </span>

        <span>
          Demo market data - Backend connected
        </span>
      </footer>

      <style>
        {`
          @media (max-width: 900px) {
            main > div {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            main {
              padding: 18px !important;
            }
          }
        `}
      </style>
    </main>
  )
}

export default Alerts