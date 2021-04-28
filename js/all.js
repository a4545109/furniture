// token : 6GflP0TvVQSetvMCA2CUA7crPC93
// API_PATH : a4545109
// API 文件 : https://hexschoollivejs.herokuapp.com/api-docs/
const productWrap = document.querySelector('.productWrap');
const shoppingCartTable = document.querySelector('.shoppingCart-table-tbody');
const productSelect = document.querySelector('.productSelect');
const totalPrice = document.querySelector('.totalPrice');

let data = [];
let newData = [];
let cartData = [];
let finalTotal;

//初始化
function init(){
  getData();
  getCartData();
}

//取得產品資料
function getData(){
  axios.get(`${baseUrl}/customer/${api_path}/products`)
    .then(function(res){
      data = res.data.products;
      renderProduct(data);
    })
    .catch(function(error){
      console.log(error);
    })
}

//取得購物車資料
function getCartData(){
  axios.get(`${baseUrl}/customer/${api_path}/carts`)
    .then(function(res){
      cartData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCart();
    })
    .catch(function(error){
      console.log(error);
    })
}

//過濾品項
function filterCategory(e){
  const category = e.target.value;
  //方法一
  data.forEach(function(item){
    if(category == "全部"){
      newData.push(item);
      renderProduct(newData);
    }else if(category == item.category){
      newData.push(item);
      renderProduct(newData);
    }
  })
  newData = [];

  //方法二-在使用函式消除重複內容
  // if(category == "全部"){
  //   renderProduct(data);
  //   return;
  // }
  // let str = '';
  // data.forEach(function(item){
  //   if(category == item.category){
  //     str +=`
  //     <li class="productCard">
  //       <h4 class="productType">${item.category}</h4>
  //       <img src="${item.images}" alt="">
  //       <a href="#" id="addCardBtn" data-id="${item.id}">加入購物車</a>
  //       <h3>Antony 雙人床架／雙人加大</h3>
  //       <del class="originPrice">NT$${item.origin_price}</del>
  //       <p class="nowPrice">NT$${item.price}</p>
  //     </li>
  //     `;
  //   }
  // })
  // productWrap.innerHTML = str;
}
productSelect.addEventListener('change', filterCategory);

//渲染產品清單
function renderProduct(filterData){
  let str = '';
  filterData.forEach(function(item){
    str +=`
    <li class="productCard">
      <h4 class="productType">${item.category}</h4>
      <img src="${item.images}" alt="">
      <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$${item.origin_price}</del>
      <p class="nowPrice">NT$${item.price}</p>
    </li>
    `;
  })
  productWrap.innerHTML = str;
} 

//渲染購物車
function renderCart(){
  let str = '';
  cartData.forEach(function(item){
    str +=`
    <tr>
      <td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>${item.product.price}</td>
      <td>${item.quantity}</td>
      <td>NT$${item.product.price * item.quantity}</td>
      <td class="discardBtn">
        <a href="#" class="material-icons" data-id="${item.id}">
          clear
        </a>
      </td>
    </tr>
    `;
  })
  shoppingCartTable.innerHTML = str;
  totalPrice.textContent = finalTotal;
  // calculateTotalPrice();
}

//加入購入車
function addCart(e){
  e.preventDefault();
  if(e.target.getAttribute('class') !== 'addCardBtn'){
    return;
  }
  let productId = e.target.getAttribute('data-id');
  let numCheck = 1;
  cartData.forEach(function(item){
    if(item.product.id === productId){
      numCheck = item.quantity+=1;
    }
  })
  // console.log(cartData);
  axios.post(`${baseUrl}/customer/${api_path}/carts`,
  {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function(){
      alert("已經加入購物車")
      renderCart();
    })
    .catch(function(error){
      console.log(error);
    })
}
productWrap.addEventListener('click', addCart);

//刪除所有清單
const discardAllBtn = document.querySelector('.discardAllBtn');
function deleteAllData(e){
  e.preventDefault();
  axios.delete(`${baseUrl}/customer/${api_path}/carts`)
    .then(function(res){
      renderCart()
    })
    .catch(function(error){
      console.log(error);
    })
}
discardAllBtn.addEventListener('click', deleteAllData)

//刪除單筆產品
function deleteSingleData(e){
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  if(e.target.getAttribute('class') !== 'material-icons'){
    return;
  }
  axios.delete(`${baseUrl}/customer/${api_path}/carts/${cartId}`)
    .then(function(res){
      alert("已經刪除此筆資料");
      renderCart()
    })
    .catch(function(error){
      alert("購物車已清空");
    })
}
shoppingCartTable.addEventListener('click', deleteSingleData);

//計算總金額
function calculateTotalPrice(){
  let totalMoney = 0;
  cartData.forEach(function(item){
    let Money = item.product.price * item.quantity;
    totalMoney+=Money;
  })
  totalPrice.innerHTML = totalMoney;
}

//填寫訂單
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
const sendOrder = document.querySelector('.orderInfo-btn');

function sendOrderInfo(e){
  e.preventDefault();
  let orderData = {
    data: {
      user: {
        name: customerName.value,
        tel: customerPhone.value,
        email: customerEmail.value,
        address: customerAddress.value,
        payment: tradeWay.value
      }
    }
  };
  if(cartData.length ==0){
    alert("請加入購物車")
    return;
  }
  if(customerName.value=='' ||
    customerPhone.value=='' ||
    customerEmail.value=='' ||
    customerAddress.value=='' ||
    tradeWay.value==''){
      alert("請填寫完整資料")
      return
    }
  axios.post(`${baseUrl}/customer/${api_path}/orders`, orderData)
  .then(function(res){
    alert("訂單建立成功");
    customerName.value = '';
    customerPhone.value = '';
    customerEmail.value = '';
    customerAddress.value = '';
    tradeWay.value = 'ATM';
    getCartData();
  })
  .catch(function(error){
    console.log(error);
  })
}
sendOrder.addEventListener('click', sendOrderInfo);

init();




