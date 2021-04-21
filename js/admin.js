const orderPageList = document.querySelector('.orderPage-table-tbody');

let orderData = [];
function init() {
  getOrderData()
}
init();

//取得訂單資料
function getOrderData() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/a4545109/orders`, {
    headers: {
      "authorization": token
    }
  }).then(function (res) {
    orderData = res.data.orders;
    renderOrder()
  }).catch(function (error) {
    console.log(error);
  })
}

//渲染訂單
function renderOrder(){
  let str = '';
  let productStr = '';
  orderData.forEach(function(item){
    // 組時間字串
    const timestamp = new Date(item.createdAt*1000);
    const time = `${timestamp.getFullYear()}/${timestamp.getMonth()+1}/${timestamp.getDate()}`

    // 組多品項字串
    item.products.forEach(function(productItem){
      productStr+=`
        <p>${productItem.title} x ${productItem.quantity}</p>
      `;
    })
    // 訂單狀態
    let orderStatus = '';
    if(item.paid == true){
      orderStatus = '已處理';
    }else{
      orderStatus = '未處理';
    }

    str+=`
    <tr>
      <td>${item.id}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td class="orderProducts">${productStr}</td>
      <td>${time}</td>
      <td>
        <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
      </td>
  </tr>
    `;
  })
  orderPageList.innerHTML = str;
  renderChart();
}

//監聽狀態、刪除按鈕
orderPageList.addEventListener('click', function(e){
  e.preventDefault();
  let orderId = e.target.getAttribute('data-id');
  let targetClass = e.target.getAttribute('class');
  let targetStatus = e.target.getAttribute('data-status');

  if(targetClass == 'delSingleOrder-Btn'){
    deleteOrderItem(orderId)
    return;
  }
  if(targetClass == 'orderStatus'){
    updateOrderStatus(orderId, targetStatus);
    return;
  }
});

//更新訂單狀態
function updateOrderStatus(orderId, status){
  let newStatus;
  if(status == "true"){
    newStatus = false;
    console.log(newStatus);
  }else{
    newStatus = true;
    console.log(newStatus);
  }
  
  axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/a4545109/orders`,
    {
      "data":{
        "id": orderId,
        "paid": newStatus
      }
    },
    {
      headers:{
        'authorization': token
      }
  })
  .then(function(res){
    getOrderData();
  })
  .catch(function(error){
    console.log(error);
  })
}

//刪除單一訂單
function deleteOrderItem(orderId){
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/a4545109/orders/${orderId}`,{
    headers:{
      'authorization': token
    }
  })
  .then(function(res){
    getOrderData();
  })
  .catch(function(error){
    console.log(error);
  })
}

//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
function deleteAllOrder(e){
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/a4545109/orders`,{
    headers:{
      'authorization': token
    }
  })
  .then(function(res){
    getOrderData();
  })
  .catch(function(error){
    console.log(error);
  })
}
discardAllBtn.addEventListener('click', deleteAllOrder)

//渲染圖表
function renderChart(){
  let orderTotalObj = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(orderTotalObj[productItem.category] == undefined){
        orderTotalObj[productItem.category] = productItem.price * productItem.quantity;
      }else{
        orderTotalObj[productItem.category] += productItem.price * productItem.quantity;
      }
    })
  })
  console.log(orderTotalObj);
  let newAry = [];
  let orderTotalAry = Object.keys(orderTotalObj);
  orderTotalAry.forEach(function(item){
    let Ary = [];
    Ary.push(item);
    Ary.push(orderTotalObj[item]);
    newAry.push(Ary);
  })
  
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: newAry,
      colors: {
        "Louvre 雙人床架": "#DACBFF",
        "Antony 雙人床架": "#9D7FEA",
        "Anty 雙人床架": "#5434A7",
        "其他": "#301E5F",
      }
    },
  });
}

