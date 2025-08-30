# Compound Analytics Dashboard

 **Award-Winning Hackathon Submission** 

A comprehensive, real-time analytics dashboard for Compound v3 markets featuring advanced risk monitoring, multi-market support, and beautiful visualizations. Built for DeFi power users and institutions.

##  Features

- ** Real-time Market Analytics** - Live utilization rates, supply/borrow APYs across all Compound markets
- ** Interactive Charts** - Historical trends with Recharts visualizations
- ** Risk Monitoring** - Advanced risk alerts and liquidation warnings
- ** Multi-Market Support** - USDC, WETH, WBTC, UNI, LINK, and more
- ** Responsive Design** - Modern UI with dark mode and mobile optimization
- ** Live Updates** - Real-time data with 30-second refresh intervals
- ** Portfolio Tracking** - User position monitoring and analysis

## Quickstart

### Web Dashboard (Recommended)

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment** (Optional - works with demo data)
```bash
# The app includes demo data fallback, but you can add your own RPC:
echo "RPC_URL=https://cloudflare-eth.com" > .env
# Or use any Ethereum RPC provider (Alchemy, Infura, etc.)
```

3. **Start the dashboard**
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

###  **Demo Mode**
The dashboard includes intelligent fallback to **demo mode** when:
- RPC connection fails
- Contract calls encounter errors
- Network issues occur

**Demo mode provides:**
- Realistic market data simulation
- All features remain functional
- Clear "Demo Mode" indicator
- Smooth user experience

### Terminal Version (Legacy)

```bash
npm run legacy:dev
```

##  Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom Compound theme
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query for real-time data
- **Blockchain**: Ethers.js for Compound v3 integration

##  Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── MarketOverview.tsx
│   ├── UtilizationChart.tsx
│   ├── RateComparison.tsx
│   └── RiskMetrics.tsx
├── hooks/              # Custom React hooks
├── services/           # Blockchain services
├── providers/          # React context providers
└── abi/               # Smart contract ABIs
```

##  Hackathon Highlights

- **Real-time Data**: WebSocket-like updates without WebSockets
- **Risk Analysis**: Advanced liquidation risk monitoring
- **Multi-Asset**: Support for 5+ Compound markets
- **User Experience**: Beautiful, responsive design
- **Performance**: Optimized queries and caching
- **Error Handling**: Robust error boundaries and fallbacks

## 🔧 Configuration

### Environment Variables

```bash
# Required
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Optional
COMET_ADDRESS=0xc3d688B66703497DAA19211EEdff47f25384cdc3
COMET_REWARDS_ADDRESS=0x1B0e765F6224C21223AeA2af16c1C46E38885a40
```

### Supported Networks

- **Ethereum Mainnet** (Primary)
- **Local Fork** (Development)
- **Testnets** (Goerli, Sepolia)

##  Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Docker

```bash
docker build -t compound-dashboard .
docker run -p 3000:3000 compound-dashboard
```

##  Analytics & Metrics

- **Real-time utilization tracking**
- **APY calculations and comparisons**
- **TVL monitoring across markets**
- **Risk assessment algorithms**
- **Historical data visualization**

##  Security

- Read-only blockchain interactions
- No private key requirements
- Input validation and sanitization
- Error boundary protection
- Secure RPC endpoint configuration

##  Contributing

This is a hackathon submission! Feel free to:

1. Fork and enhance
2. Add new features
3. Improve the UI/UX
4. Extend market support
5. Add new analytics

##  License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Compound hackathon** 
