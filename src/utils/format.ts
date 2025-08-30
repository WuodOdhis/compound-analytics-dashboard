export function formatCurrency(value: number): string {
  // Convert to absolute value to handle negative numbers
  const absValue = Math.abs(value)
  
  // Handle trillions
  if (absValue >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`
  }
  
  // Handle billions
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  
  // Handle millions
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  
  // Handle thousands
  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  
  // Handle small numbers
  return `$${value.toFixed(2)}`
}