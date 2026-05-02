import type { Trade, DerivAccount } from "./types"
import { getSymbolFromShortcode, getInstrumentName } from "./symbol-map"

const APP_ID = `339TwdltLITjyylgd80Vg`
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`
const OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}`

/**
 * Returns the Deriv OAuth authorization URL.
 * Redirects user to Deriv login, then back to your app with tokens in query params.
 */
export function getOAuthUrl(): string {
  return OAUTH_URL
}

/**
 * Parses the OAuth redirect URL to extract Deriv accounts.
 * Deriv returns: ?acct1=CR123&token1=a1-xxx&cur1=USD&acct2=VR456&token2=a1-yyy&cur2=USD
 */
export function parseOAuthRedirect(searchParams: URLSearchParams): DerivAccount[] {
  const accounts: DerivAccount[] = []
  let i = 1

  while (searchParams.has(`acct${i}`)) {
    const account = searchParams.get(`acct${i}`)
    const token = searchParams.get(`token${i}`)
    const currency = searchParams.get(`cur${i}`)

    if (account && token && currency) {
      accounts.push({ account, token, currency })
    }
    i++
  }

  return accounts
}

export class DerivAPI {
  private ws: WebSocket | null = null
  private token: string
  private onOpen: () => void
  private onMessage: (data: any) => void
  private onError: (error: any) => void
  private onClose: () => void

  constructor(
    token: string,
    callbacks: {
      onOpen?: () => void
      onMessage?: (data: any) => void
      onError?: (error: any) => void
      onClose?: () => void
    },
  ) {
    this.token = token
    this.onOpen = callbacks.onOpen || (() => { })
    this.onMessage = callbacks.onMessage || (() => { })
    this.onError = callbacks.onError || (() => { })
    this.onClose = callbacks.onClose || (() => { })
  }

  connect() {
    this.ws = new WebSocket(WS_URL)

    this.ws.onopen = () => {
      console.log("[DerivAPI] Connected")
      this.authorize()
      this.onOpen()
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
      this.onMessage(data)
    }

    this.ws.onerror = (error) => {
      console.error("[DerivAPI] Error:", error)
      this.onError(error)
    }

    this.ws.onclose = () => {
      console.log("[DerivAPI] Closed")
      this.onClose()
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private authorize() {
    this.send({ authorize: this.token })
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn("[DerivAPI] WebSocket not open, cannot send:", data)
    }
  }

  private handleMessage(data: any) {
    if (data.msg_type === "authorize") {
      // Once authorized, fetch initial data
      this.fetchProfitTable(0)
      this.subscribeBalance()
    }

    if (data.msg_type === "profit_table") {
      if (data.profit_table && data.profit_table.count > 0 && data.profit_table.count >= 500) {
        const currentOffset = data.echo_req?.offset || 0
        // Fetch next batch
        this.fetchProfitTable(currentOffset + 500)
      }
    }
  }

  fetchProfitTable(offset = 0) {
    this.send({
      profit_table: 1,
      description: 1,
      sort: "DESC",
      limit: 500, // Max limit per request
      offset: offset,
      // No date_from - fetch all available history
    })
  }

  fetchCandles(symbol: string, start: number, end: number) {
    // Add buffer to start and end to show context
    const buffer = (end - start) * 0.2 // 20% buffer
    const adjustedStart = Math.floor(start - buffer)
    const adjustedEnd = Math.floor(end + buffer)

    this.send({
      ticks_history: symbol,
      adjust_start_time: 1,
      count: 100, // Limit points for performance
      end: adjustedEnd,
      start: adjustedStart,
      style: "candles",
      granularity: 60, // 1 minute candles by default, adjust based on duration if needed
    })
  }

  subscribeBalance() {
    this.send({ balance: 1, subscribe: 1 })
  }
}

export function mapDerivTradeToAppTrade(derivTrade: any): Trade {
  const timestamp = derivTrade.purchase_time || derivTrade.sell_time || derivTrade.transaction_time

  let dateStr = new Date().toISOString().split("T")[0] // Default to today

  if (timestamp) {
    try {
      // Check if timestamp is in seconds (Deriv usually sends epoch seconds)
      const ms = timestamp > 10000000000 ? timestamp : timestamp * 1000
      const dateObj = new Date(ms)
      if (!isNaN(dateObj.getTime())) {
        dateStr = dateObj.toISOString().split("T")[0]
      }
    } catch (e) {
      console.warn("[DerivAPI] Failed to parse date:", timestamp)
    }
  }

  const rawSymbol = derivTrade.symbol || getSymbolFromShortcode(derivTrade.shortcode || "")
  const symbol = derivTrade.display_name || rawSymbol
  const instrumentName = getInstrumentName(symbol)

  return {
    id: derivTrade.transaction_id.toString(),
    date: dateStr,
    asset: instrumentName,
    pnl: Number(derivTrade.sell_price) - Number(derivTrade.buy_price),
    notes: `Deriv Trade #${derivTrade.transaction_id} (${derivTrade.contract_type})`,
    source: "deriv",
    entryTime: derivTrade.purchase_time,
    exitTime: derivTrade.sell_time,
    entryPrice: Number(derivTrade.buy_price),
    exitPrice: Number(derivTrade.sell_price),
    rawSymbol: rawSymbol,
  }
}
