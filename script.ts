import type { IProduct, IProductWithQuantity, ApiResponse } from './type';


declare global {
  interface Window {
    updateQty: (productId: number, change: number) => void;
    fetchProducts: () => Promise<void>;
  }
}

let products: IProductWithQuantity[] = [];
let currentTotal: number = 0;

const productGrid = document.getElementById('productGrid') as HTMLElement;
const payCryptoBtn = document.getElementById('payCryptoBtn') as HTMLButtonElement;
const cartModal = document.getElementById('cartModal') as HTMLElement;
const modalXBtn = document.getElementById('modalXBtn') as HTMLButtonElement | null; 
const bottomCloseBtn = document.getElementById('closeModalBtn') as HTMLButtonElement | null; 
const cartItemsContainer = document.getElementById('cartItemsContainer') as HTMLElement;
const modalTotalPrice = document.getElementById('totalPrice') as HTMLElement;

if (cartModal) {
  cartModal.style.display = 'none';
}

async function fetchProducts(): Promise<void> {
  try {
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="animate-pulse flex flex-col justify-between bg-gray-100 rounded p-4 h-56 w-full">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-24 bg-gray-200 rounded w-full my-2"></div>
          <div class="flex justify-between items-center mt-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div class="animate-pulse flex flex-col justify-between bg-gray-100 rounded p-4 h-56 w-full">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-24 bg-gray-200 rounded w-full my-2"></div>
          <div class="flex justify-between items-center mt-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div class="animate-pulse flex flex-col justify-between bg-gray-100 rounded p-4 h-56 w-full">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-24 bg-gray-200 rounded w-full my-2"></div>
          <div class="flex justify-between items-center mt-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div class="animate-pulse flex flex-col justify-between bg-gray-100 rounded p-4 h-56 w-full">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-24 bg-gray-200 rounded w-full my-2"></div>
          <div class="flex justify-between items-center mt-2">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      `;
    }

    const response = await fetch('https://dummyjson.com/products');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ApiResponse = await response.json();
    
    products = data.products.map((item: IProduct): IProductWithQuantity => ({
      ...item,
      quantity: 0 
    }));

    addProduct(); 
  } catch (error) {
    console.error('Error fetching products:', error);
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-xs text-red-500 font-bold mb-2">Network ချိတ်ဆက်မှု အဆင်မပြေပါ သို့မဟုတ် နှေးကွေးနေပါသည်</p>
          <button onclick="fetchProducts()" class="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition cursor-pointer">
            ပြန်လည် ကြိုးစားမည် (Retry)
          </button>
        </div>
      `;
    }
  }
}

function addProduct(): void {
    if (!productGrid) return;
    productGrid.innerHTML = ''; 
    
    products.forEach((product: IProductWithQuantity) => {
        const productCart = document.createElement('div');
        productCart.className = 'rounded flex flex-col justify-between items-start text-left bg-white w-full md:border-0 md:p-0 md:shadow-none';
        
        productCart.innerHTML = `
          <span class="text-[11px] uppercase tracking-wider mb-1 text-black-500 w-full text-left">
              ${product.title}
          </span>
          <div class="w-full h-36 my-1 flex items-center justify-center bg-transparent">
              <img src="${product.thumbnail}" alt="${product.title}" class="max-h-full max-w-full object-contain">
          </div>
          <div class="w-full flex justify-between items-center mt-1 text-xs">
              <span class="">${product.price.toFixed(2)} USDC</span>
              <div class="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button onclick="updateQty(${product.id}, -1)" class="px-2.5 py-1 hover:bg-gray-100 border-r border-gray-300 cursor-pointer">-</button>
                  <span id="qty-${product.id}" class="px-3 py-1">${product.quantity}</span>
                  <button onclick="updateQty(${product.id}, 1)" class="px-2.5 py-1 hover:bg-gray-100 border-l border-gray-300 cursor-pointer">+</button>
              </div>
          </div>
        `;
        productGrid.appendChild(productCart);
    });
}

fetchProducts();

window.updateQty = function(productId: number, change: number): void {
    const product = products.find((p: IProductWithQuantity) => p.id === Number(productId));
    if (product) {
        product.quantity += change;
        if (product.quantity < 0) {
           product.quantity = 0; 
        }
        
        const qtySpan = document.getElementById(`qty-${productId}`);
        if (qtySpan) {
          qtySpan.innerText = product.quantity.toString();
        }

        updateTotal();

        if (cartModal && cartModal.style.display === 'flex') {
            updateCartModal();
        }
    }
};

function updateTotal(): void {
    currentTotal = 0; 
    products.forEach((product: IProductWithQuantity) => {
        currentTotal += product.price * product.quantity;
    });
    
    const totalPriceElement = document.querySelector('#total-price h2') as HTMLElement | null;
    if (totalPriceElement) {
      totalPriceElement.innerText = `TOTAL ${currentTotal.toFixed(2)} USDC`;
    }
}

function updateCartModal(): void {
  const selectedProducts = products.filter((p: IProductWithQuantity) => p.quantity > 0);
  
  if (selectedProducts.length === 0) {
    if (cartModal) cartModal.style.display = 'none';
    return;
  }

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = '';

    selectedProducts.forEach((item: IProductWithQuantity) => {
      let itemTotal = item.price * item.quantity;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex flex-row items-center justify-between py-3 border-b border-gray-200 text-xs w-full gap-4';
      itemDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center p-1 shrink-0 border border-gray-100">
              <img src="${item.thumbnail}" alt="${item.title}" class="max-h-full max-w-full object-contain">
          </div>
          <div>
            <p class="text-gray-900">${item.title}</p>
            <p class="text-gray-500 mt-0.5">Qty: ${item.quantity}</p>
          </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span class="text-gray-900">${itemTotal.toFixed(2)} USDC</span>
          <button onclick="updateQty(${item.id}, -1)" class="border border-gray-300 px-2.5 py-1 rounded text-gray-600 bg-gray-50 hover:bg-gray-200 cursor-pointer">-</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemDiv);
    });
  }

  if (modalTotalPrice) {
    modalTotalPrice.innerText = currentTotal.toFixed(2);
  }
}

if (payCryptoBtn) {
  payCryptoBtn.addEventListener('click', () => {
    const selectedProducts = products.filter((p: IProductWithQuantity) => p.quantity > 0);
    
    if (selectedProducts.length === 0) {
      alert('ကျေးဇူးပြု၍ ပစ္စည်း အနည်းဆုံး တစ်ခု ရွေးချယ်ပါ');
      return;
    }

    updateCartModal();
    if (cartModal) cartModal.style.display = 'flex';
  });
}

if (modalXBtn) {
  modalXBtn.addEventListener('click', () => {
    if (cartModal) cartModal.style.display = 'none';
  });
}

if (bottomCloseBtn) {
  bottomCloseBtn.addEventListener('click', () => {
    if (cartModal) cartModal.style.display = 'none';
  });
}

if (cartModal) {
  cartModal.addEventListener('click', (e: MouseEvent) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
    }
  });
}

window.fetchProducts = fetchProducts;