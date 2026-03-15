export const users = [
  { id: "U101", name: "Alice Chen", email: "alice@dev.io", role: "Senior Engineer", location: "San Francisco" },
  { id: "U102", name: "Bob Harris", email: "bob@design.com", role: "Product Designer", location: "London" },
  { id: "U103", name: "Charlie Day", email: "charlie@sales.force", role: "Sales Lead", location: "New York" },
  { id: "U104", name: "Diana Prince", email: "diana@amazon.com", role: "Senior Engineer", location: "New York" },
  { id: "U105", name: "Ethan Hunt", email: "ethan@mission.im", role: "Security Analyst", location: "London" }
];

export const products = [
  { sku: "PROD-01", name: "UltraWide Monitor", category: "Hardware", price: 800, stock: 5 },
  { sku: "PROD-02", name: "Ergonomic Mouse", category: "Hardware", price: 90, stock: 0 }, // Out of stock!
  { sku: "PROD-03", name: "Graphic Tablet", category: "Design", price: 350, stock: 12 },
  { sku: "PROD-04", name: "Mechanical Keyboard", category: "Hardware", price: 200, stock: 15 },
  { sku: "PROD-05", name: "Noise Cancelling Headphones", category: "Audio", price: 300, stock: 2 }
];

export const orders = [
  { orderId: "ORD-501", userId: "U101", sku: "PROD-01", qty: 1, date: "2026-01-15" },
  { orderId: "ORD-502", userId: "U101", sku: "PROD-02", qty: 1, date: "2026-02-10" },
  { orderId: "ORD-503", userId: "U102", sku: "PROD-03", qty: 1, date: "2026-02-01" },
  { orderId: "ORD-504", userId: "U104", sku: "PROD-04", qty: 1, date: "2026-03-01" },
  { orderId: "ORD-505", userId: "U104", sku: "PROD-05", qty: 1, date: "2026-03-05" }
];

export const tickets = [
  { ticketId: "TKT-001", userId: "U101", issue: "Screen flickering on my Monitor", status: "Open", priority: "High" },
  { ticketId: "TKT-002", userId: "U104", issue: "Keyboard key sticking", status: "Closed", priority: "Medium" }
];