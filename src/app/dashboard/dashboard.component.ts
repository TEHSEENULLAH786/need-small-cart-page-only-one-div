import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CartItem {
  id: number;
  emoji: string;
  bg: string;
  name: string;
  sub: string;
  qty: number;
  price: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart">
      <div class="cart-header">
        <h2>🛒 Your Cart</h2>
        <span class="badge">{{ totalItems() }} item{{ totalItems() === 1 ? '' : 's' }}</span>
      </div>

      @for (item of items(); track item.id) {
        <div class="cart-item">
          <div class="item-img" [style.background]="item.bg">{{ item.emoji }}</div>
          <div class="item-info">
            <div class="name">{{ item.name }}</div>
            <div class="sub">{{ item.sub }}</div>
          </div>
          <div class="item-qty">
            <button class="qty-btn" (click)="decrement(item.id)">−</button>
            <span class="qty-val">{{ item.qty }}</span>
            <button class="qty-btn" (click)="increment(item.id)">+</button>
          </div>
          <div class="item-price">${{ (item.price * item.qty).toFixed(2) }}</div>
          <button class="remove-btn" (click)="remove(item.id)">✕</button>
        </div>
      }

      @if (items().length === 0) {
        <div class="empty">🛍️ Your cart is empty</div>
      }

      <div class="cart-summary">
        <div class="summary-row"><span>Subtotal</span><span>${{ subtotal().toFixed(2) }}</span></div>
        <div class="summary-row"><span>Shipping</span><span>Free</span></div>
        <div class="summary-row"><span>Discount</span><span class="discount">−$20.00</span></div>
        <div class="summary-row total"><span>Total</span><span>${{ total().toFixed(2) }}</span></div>
      </div>

      <div class="promo-row">
        <input class="promo-input" type="text" [(ngModel)]="promoCode" placeholder="Promo code..." />
        <button class="promo-apply" (click)="applyPromo()">Apply</button>
      </div>

      @if (promoMsg()) {
        <div class="promo-msg">{{ promoMsg() }}</div>
      }

      <button class="checkout-btn" (click)="checkout()">Proceed to Checkout →</button>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f0f2f5;
      padding: 24px;
      box-sizing: border-box;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .cart {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.10);
      padding: 32px;
      width: 100%;
      max-width: 480px;
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .cart-header h2 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .badge {
      background: #6c63ff;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 20px;
      padding: 3px 12px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .item-img {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .item-info { flex: 1; }

    .item-info .name {
      font-size: 0.92rem;
      font-weight: 600;
      color: #222;
    }

    .item-info .sub {
      font-size: 0.78rem;
      color: #888;
      margin-top: 2px;
    }

    .item-qty {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1.5px solid #e0e0e0;
      background: #fafafa;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #555;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }

    .qty-btn:hover { background: #6c63ff; color: #fff; border-color: #6c63ff; }

    .qty-val {
      font-size: 0.9rem;
      font-weight: 600;
      color: #222;
      min-width: 16px;
      text-align: center;
    }

    .item-price {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1a1a2e;
      min-width: 60px;
      text-align: right;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ccc;
      font-size: 1.1rem;
      cursor: pointer;
      margin-left: 4px;
      transition: color 0.2s;
      padding: 0 4px;
    }

    .remove-btn:hover { color: #ff4d4f; }

    .empty {
      text-align: center;
      padding: 32px 0;
      font-size: 1rem;
      color: #aaa;
    }

    .cart-summary { margin-top: 20px; }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 8px;
    }

    .summary-row.total {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a2e;
      border-top: 1.5px solid #f0f0f0;
      padding-top: 12px;
      margin-top: 4px;
    }

    .discount { color: #6c63ff; font-weight: 600; }

    .promo-row {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .promo-input {
      flex: 1;
      padding: 10px 14px;
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      font-size: 0.85rem;
      outline: none;
      color: #333;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }

    .promo-input:focus { border-color: #6c63ff; }

    .promo-apply {
      padding: 10px 18px;
      background: #f5f3ff;
      color: #6c63ff;
      font-weight: 600;
      font-size: 0.85rem;
      border: 1.5px solid #e0d9ff;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s;
      font-family: 'Inter', sans-serif;
    }

    .promo-apply:hover { background: #ede9ff; }

    .promo-msg {
      font-size: 0.8rem;
      color: #6c63ff;
      margin-top: 6px;
      padding-left: 4px;
    }

    .checkout-btn {
      width: 100%;
      margin-top: 20px;
      padding: 14px;
      background: linear-gradient(135deg, #6c63ff, #48c6ef);
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      letter-spacing: 0.5px;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.2s, transform 0.15s;
    }

    .checkout-btn:hover { opacity: 0.92; transform: translateY(-1px); }
    .checkout-btn:active { transform: translateY(0); }
  `]
})
export class DashboardComponent {
  items = signal<CartItem[]>([
    { id: 1, emoji: '🎧', bg: '#fff3e0', name: 'Wireless Headphones', sub: 'Color: Midnight Black', qty: 1, price: 89.99 },
    { id: 2, emoji: '⌚', bg: '#e8f5e9', name: 'Smart Watch Pro',      sub: 'Size: 44mm',           qty: 1, price: 199.00 },
    { id: 3, emoji: '📱', bg: '#e3f2fd', name: 'Phone Case',           sub: 'Model: iPhone 15 Pro', qty: 2, price: 24.99 },
  ]);

  promoCode = '';
  promoMsg  = signal('');

  totalItems = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  subtotal   = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  total      = computed(() => Math.max(0, this.subtotal() - 20));

  increment(id: number) {
    this.items.update(list => list.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }

  decrement(id: number) {
    this.items.update(list =>
      list.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)
    );
  }

  remove(id: number) {
    this.items.update(list => list.filter(i => i.id !== id));
  }

  applyPromo() {
    if (this.promoCode.trim().toUpperCase() === 'SAVE20') {
      this.promoMsg.set('✅ Promo applied! $20 off your order.');
    } else {
      this.promoMsg.set('❌ Invalid promo code. Try SAVE20.');
    }
  }

  checkout() {
    alert('🎉 Proceeding to checkout!');
  }
}