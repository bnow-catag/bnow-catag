(function(){

  // Helpers
  const $ = sel => document.querySelector(sel);
  const CLP = new Intl.NumberFormat('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits:0});
  const formatCLP = n => CLP.format(n).replace(/\s/g,'');

  // Selectores
  const productGrid = $('#productGrid');
  const pagination = $('#pagination');
  const searchInput = $('#searchInput');
  let searchQuery = '';
  let currentPage = 1;
  const perPage = 12;

  // Render productos
  function cardTemplate(p){
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt=""></div>
      <div class="body">
        <h3 class="title">${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="meta"><span class="chip">${p.brand}</span><span class="price">${formatCLP(p.price)}</span></div>
        <div class="actions">
          <div class="qty-control">
            <button class="minus" type="button">-</button>
            <input type="number" value="1" min="1" class="qty">
            <button class="plus" type="button">+</button>
          </div>
          <button class="btn primary addCart" type="button">Agregar</button>
        </div>
      </div>`;
    const qtyInput = article.querySelector('.qty');
    article.querySelector('.plus').addEventListener('click',()=> qtyInput.value=(+qtyInput.value||1)+1);
    article.querySelector('.minus').addEventListener('click',()=> qtyInput.value=Math.max(1,(+qtyInput.value||1)-1));
    article.querySelector('.addCart').addEventListener('click',()=>{
      const qty=Math.max(1,parseInt(qtyInput.value)||1);
      addToCart(p,qty);
    });
    return article;
  }

  function getFiltered(){
    if(!searchQuery) return window.ALL_PRODUCTS;
    const q = searchQuery.toLowerCase();
    return window.ALL_PRODUCTS.filter(p => (p.name+' '+p.desc).toLowerCase().includes(q));
  }

  function renderProducts(){
    const filtered=getFiltered();
    const totalPages=Math.max(1,Math.ceil(filtered.length/perPage));
    if(currentPage>totalPages) currentPage=totalPages;
    const start=(currentPage-1)*perPage;
    const pageItems=filtered.slice(start,start+perPage);
    productGrid.innerHTML='';
    pageItems.forEach(p=>productGrid.appendChild(cardTemplate(p)));
    renderPagination(filtered.length,totalPages);
  }

  function renderPagination(totalItems,totalPages){
    pagination.innerHTML='';
    if(totalItems<=perPage) return;
    for(let i=1;i<=totalPages;i++){
      const btn=document.createElement('button');
      btn.textContent=i;
      if(i===currentPage) btn.classList.add('active');
      btn.addEventListener('click',()=>{currentPage=i;renderProducts();});
      pagination.appendChild(btn);
    }
  }

  searchInput.addEventListener('input',()=>{
    searchQuery=searchInput.value.trim();
    currentPage=1;
    renderProducts();
  });

  // -------------------------
  // Carrito
  // -------------------------
  let cart=[];
  const cartBtn=$('#toggleCart');
  const cartBox=$('#cart');
  const cartItems=$('#cartItems');
  const cartTotal=$('#cartTotal');
  const copyCart=$('#copyCart');
  const clearCart=$('#clearCart');
  const cartClose=$('#cartClose');

  function addToCart(product,qty=1){
    const found=cart.find(i=>i.name===product.name);
    if(found){found.qty+=qty;}
    else{cart.push({name:product.name,price:product.price,qty});}
    renderCart();
    cartBox.style.display='flex';
  }

  function renderCart(){
    cartItems.innerHTML='';
    let total=0;
    cart.forEach((item,idx)=>{
      const subtotal=item.price*item.qty;
      total+=subtotal;
      const li=document.createElement('li');
      li.innerHTML=`
        <div>
          <strong>${item.name}</strong><br>
          Unitario: ${formatCLP(item.price)}<br>
          Cantidad: ${item.qty}<br>
          Total: ${formatCLP(subtotal)}
        </div>
        <div class="line-controls">
          <button class="small-btn" data-act="minus" data-idx="${idx}">-</button>
          <input type="number" class="lineQty" min="1" value="${item.qty}" data-idx="${idx}">
          <button class="small-btn" data-act="plus" data-idx="${idx}">+</button>
          <button class="small-btn" data-act="remove" data-idx="${idx}">x</button>
        </div>`;
      cartItems.appendChild(li);
    });
    cartTotal.textContent=formatCLP(total);

    cartItems.querySelectorAll('button.small-btn').forEach(btn=>{
      const idx=+btn.dataset.idx;
      btn.onclick=()=>{
        const act=btn.dataset.act;
        if(act==='minus'){cart[idx].qty=Math.max(1,cart[idx].qty-1);}
        if(act==='plus'){cart[idx].qty+=1;}
        if(act==='remove'){cart.splice(idx,1);}
        renderCart();
      };
    });
    cartItems.querySelectorAll('input.lineQty').forEach(inp=>{
      inp.onchange=()=>{
        const idx=+inp.dataset.idx;
        const val=Math.max(1,parseInt(inp.value)||1);
        cart[idx].qty=val;
        renderCart();
      };
    });
  }

  clearCart.addEventListener('click',()=>{cart=[];renderCart();});
  cartBtn.addEventListener('click',()=>{cartBox.style.display=cartBox.style.display==='flex'?'none':'flex';});
  cartClose.addEventListener('click',()=>{cartBox.style.display='none';});

  copyCart.addEventListener('click',()=>{
    if(cart.length===0){ showToast('El carrito está vacío ❌'); return; }
    const lines=cart.map(i=>`${i.name} — Cantidad: ${i.qty}, Unitario: ${formatCLP(i.price)}, Total: ${formatCLP(i.price*i.qty)}`);
    const total=cart.reduce((sum,i)=>sum+i.price*i.qty,0);
    const text=`Mi cotización:\n${lines.join('\n')}\n\nTotal: ${formatCLP(total)}`;
    navigator.clipboard.writeText(text).then(()=> showToast('Carrito copiado al portapapeles, pegalo en  WhatsApp ✅'));
  });

  // -------------------------
  // Toast
  // -------------------------
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(()=> toast.classList.remove("show"), 3000);
  }

  // -------------------------
  // Footer WhatsApp
  // -------------------------
  (function(){
    const encoded = "NTY5ODQ3Njg2MDY=";
    const number = atob(encoded); 
    const link = document.createElement("a");
    link.href = "https://wa.me/" + number;
    link.target = "_blank";
    link.style.marginLeft = "8px";
    link.style.color = "white";
    link.style.textDecoration = "none";
    link.innerHTML = '<img src="https://img.icons8.com/color/24/000000/whatsapp.png" alt="WhatsApp" style="vertical-align:middle;margin-right:5px;"> WhatsApp';
    document.getElementById("whatsappLink").appendChild(link);
  })();

  // -------------------------
  // Iniciar renderizado
  // -------------------------
  console.log('main.js cargado. Productos disponibles:', window.ALL_PRODUCTS?.length);
  renderProducts();

})();
