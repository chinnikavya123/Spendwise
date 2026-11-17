
export const dashboardStats = [
  {
    title: "Total Balance",
    amount: 82450,
    change: "+12.8%",
    description: "vs. last month",
    icon: "wallet",
    color: "green"
  },
  {
    title: "Monthly Income",
    amount: 45000,
    change: "+8.2%",
    description: "vs. last month",
    icon: "trending-up",
    color: "blue"
  },
  {
    title: "Monthly Expenses",
    amount: 18450,
    change: "-5.4%",
    description: "vs. last month",
    icon: "credit-card",
    color: "orange"
  },
  {
    title: "Total Savings",
    amount: 26550,
    change: "+18.6%",
    description: "vs. last month",
    icon: "piggy-bank",
    color: "purple"
  }
];

export const spendingData = [
  { month: "Jan", income: 32000, expenses: 18000 },
  { month: "Feb", income: 38000, expenses: 22000 },
  { month: "Mar", income: 35000, expenses: 19500 },
  { month: "Apr", income: 42000, expenses: 24000 },
  { month: "May", income: 39000, expenses: 21000 },
  { month: "Jun", income: 45000, expenses: 18450 }
];

export const categoryData = [
  { name: "Food & Dining", value: 5200, color: "#10B981" },
  { name: "Shopping", value: 3800, color: "#6366F1" },
  { name: "Transport", value: 2400, color: "#F59E0B" },
  { name: "Entertainment", value: 1800, color: "#EC4899" },
  { name: "Bills", value: 3250, color: "#0EA5E9" },
  { name: "Others", value: 2000, color: "#94A3B8" }
];

export const transactions = [
  {
    id: 1,
    title: "Grocery Shopping",
    category: "Food & Dining",
    date: "Today, 10:30 AM",
    amount: -1250,
    icon: "shopping-basket"
  },
  {
    id: 2,
    title: "Monthly Salary",
    category: "Income",
    date: "Today, 09:00 AM",
    amount: 45000,
    icon: "wallet"
  },
  {
    id: 3,
    title: "Uber Ride",
    category: "Transport",
    date: "Yesterday, 06:45 PM",
    amount: -320,
    icon: "car"
  },
  {
    id: 4,
    title: "Netflix Subscription",
    category: "Entertainment",
    date: "Yesterday, 11:00 AM",
    amount: -649,
    icon: "tv"
  },
  {
    id: 5,
    title: "Amazon Purchase",
    category: "Shopping",
    date: "Nov 14, 02:15 PM",
    amount: -1899,
    icon: "shopping-bag"
  }
];

export const budgetData = [
  { name: "Food & Dining", spent: 5200, limit: 8000 },
  { name: "Shopping", spent: 3800, limit: 5000 },
  { name: "Transport", spent: 2400, limit: 3000 }
];
