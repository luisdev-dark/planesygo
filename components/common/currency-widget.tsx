"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { icons } from "@/lib/icons"

interface Currency {
  code: string
  name: string
  symbol: string
  rate: number // Rate relative to EUR
}

interface CurrencyWidgetProps {
  defaultFrom?: string
  defaultTo?: string
  defaultAmount?: number
  onConvert?: (from: string, to: string, amount: number, result: number) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

const currencies: Currency[] = [
  { code: "EUR", name: "Euro", symbol: "€", rate: 1 },
  { code: "USD", name: "Dólar estadounidense", symbol: "$", rate: 1.08 },
  { code: "GBP", name: "Libra esterlina", symbol: "£", rate: 0.86 },
  { code: "JPY", name: "Yen japonés", symbol: "¥", rate: 161.5 },
  { code: "CAD", name: "Dólar canadiense", symbol: "C$", rate: 1.47 },
  { code: "AUD", name: "Dólar australiano", symbol: "A$", rate: 1.66 },
  { code: "CHF", name: "Franco suizo", symbol: "CHF", rate: 0.93 },
]

export function CurrencyWidget({
  defaultFrom = "EUR",
  defaultTo = "USD",
  defaultAmount = 100,
  onConvert,
  className = "",
  size = "md",
}: CurrencyWidgetProps) {
  const [fromCurrency, setFromCurrency] = useState(defaultFrom)
  const [toCurrency, setToCurrency] = useState(defaultTo)
  const [amount, setAmount] = useState(defaultAmount)
  const [result, setResult] = useState(0)

  const DollarSignIcon = icons.dollarSign
  const ArrowRightIcon = icons.chevronRight

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  useEffect(() => {
    const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1
    const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1
    const convertedAmount = (amount / fromRate) * toRate
    setResult(convertedAmount)
    onConvert?.(fromCurrency, toCurrency, amount, convertedAmount)
  }, [fromCurrency, toCurrency, amount, onConvert])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getSymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code
  }

  return (
    <Card className={`rounded-2xl border-0 shadow-lg ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSignIcon className="h-4 w-4 text-primary" />
          <span className="font-medium">Conversión de moneda</span>
        </div>

        <div className="space-y-3">
          {/* Currency selectors */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{currency.symbol}</span>
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{currency.symbol}</span>
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount input */}
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="rounded-xl pr-12"
              placeholder="Cantidad"
              min="0"
              step="0.01"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
              {getSymbol(fromCurrency)}
            </span>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Intercambiar monedas"
            >
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground rotate-90" />
            </button>
          </div>

          {/* Result */}
          <div className="text-center p-4 bg-muted rounded-xl">
            <div className={`font-bold text-primary ${sizeClasses[size]}`}>
              {getSymbol(toCurrency)} {result.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1 {fromCurrency} ={" "}
              {(
                (currencies.find((c) => c.code === toCurrency)?.rate || 1) /
                (currencies.find((c) => c.code === fromCurrency)?.rate || 1)
              ).toFixed(4)}{" "}
              {toCurrency}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
