async function fetchProducts() {
  try {
    // Skeleton ၄ ကွက်စာ အတန်းလိုက် ပေါ်နေစေရန်
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

    const response = await fetch('https://dummyjson.com/products');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    products = data.products.map(item => ({
      id: item.id,
      name: item.title,
      price: item.price,
      qty: 0,
      image: item.thumbnail
    }));

    addProduct(); 
  } catch (error) {
    console.error('Error fetching products:', error);
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


const productGrid = document.getElementById('productGrid');
let currentTotal = 0; 

function addProduct() {
    productGrid.innerHTML = ''; 
    
    products.forEach(product => {
        const productCart = document.createElement('div');
        productCart.className = 'rounded flex flex-col justify-between items-start text-left bg-white w-full md:border-0 md:p-0 md:shadow-none';
        
        productCart.innerHTML = `
          <span class="text-[11px] uppercase tracking-wider mb-1 text-black-500 w-full text-left">
              ${product.name}
          </span>
          <div class="w-full h-36 my-1 flex items-center justify-center bg-transparent">
              <img src="${product.image}" alt="${product.name}" class="max-h-full max-w-full object-contain">
          </div>
          <div class="w-full flex justify-between items-center mt-1 text-xs">
              <span class="">${product.price.toFixed(2)} USDC</span>
              <div class="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button onclick="updateQty('${product.id}', -1)" class="px-2.5 py-1 hover:bg-gray-100 border-r border-gray-300 cursor-pointer">-</button>
                  <span id="qty-${product.id}" class="px-3 py-1">${product.qty}</span>
                  <button onclick="updateQty('${product.id}', 1)" class="px-2.5 py-1 hover:bg-gray-100 border-l border-gray-300 cursor-pointer">+</button>
              </div>
          </div>
        `;
        productGrid.appendChild(productCart);
    });
}

fetchProducts();

function updateQty(productId, change) {
    const product = products.find(p => p.id === String(productId) || p.id === Number(productId));
    if (product) {
        product.qty += change;
        if (product.qty < 0) {
           product.qty = 0; 
        }
        
        const qtySpan = document.getElementById(`qty-${productId}`);
        if (qtySpan) {
          qtySpan.innerText = product.qty;
        }

        updateTotal();

        if (cartModal.style.display === 'flex') {
            updateCartModal();
        }
    }
}

function updateTotal() {
    currentTotal = 0; 
    products.forEach(product => {
        currentTotal += product.price * product.qty;
    });
    
    const totalPriceElement = document.querySelector('#total-price h2');
    if (totalPriceElement) {
      totalPriceElement.innerText = `TOTAL ${currentTotal.toFixed(2)} USDC`;
    }
}

const payCryptoBtn = document.getElementById('payCryptoBtn');
const cartModal = document.getElementById('cartModal');
const modalXBtn = document.getElementById('modalXBtn'); 
const bottomCloseBtn = document.getElementById('closeModalBtn'); 
const cartItemsContainer = document.getElementById('cartItemsContainer');
const modalTotalPrice = document.getElementById('totalPrice');

cartModal.style.display = 'none';

function updateCartModal() {
  const selectedProducts = products.filter(p => p.qty > 0);
  
  if (selectedProducts.length === 0) {
    cartModal.style.display = 'none';
    return;
  }

  cartItemsContainer.innerHTML = '';

  selectedProducts.forEach(item => {
    let itemTotal = item.price * item.qty;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'flex flex-row items-center justify-between py-3 border-b border-gray-200 text-xs w-full gap-4';
    itemDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center p-1 shrink-0 border border-gray-100">
            <img src="${item.image}" alt="${item.name}" class="max-h-full max-w-full object-contain">
        </div>
        <div>
          <p class="text-gray-900">${item.name}</p>
          <p class="text-gray-500 mt-0.5">Qty: ${item.qty}</p>
        </div>
      </div>
      <div class="flex items-center gap-4 shrink-0">
        <span class="text-gray-900">${itemTotal.toFixed(2)} USDC</span>
        <button onclick="updateQty('${item.id}', -1)" class="border border-gray-300 px-2.5 py-1 rounded text-gray-600 bg-gray-50 hover:bg-gray-200 cursor-pointer">-</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  modalTotalPrice.innerText = currentTotal.toFixed(2);
}

payCryptoBtn.addEventListener('click', () => {
  const selectedProducts = products.filter(p => p.qty > 0);
  
  if (selectedProducts.length === 0) {
    alert('ကျေးဇူးပြု၍ ပစ္စည်း အနည်းဆုံး တစ်ခု ရွေးချယ်ပါ');
    return;
  }

  updateCartModal();
  cartModal.style.display = 'flex';
});

if (modalXBtn) {
  modalXBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });
}

if (bottomCloseBtn) {
  bottomCloseBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });
}

cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
  }
});