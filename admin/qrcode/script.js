// const params = new URLSearchParams(location.search);
let qr_cards = "";
let qr_body;
let startIndex;
let endIndex;
let qrPage = "";
let pageIndex;
let qrNumber;
let qrIds = [];
let laoder = document.getElementById("loader");
function onButtonClick() {
  let start = document.getElementById("pageStart").value;
  let end = document.getElementById("pageEnd").value;
  console.log("start", start);
  console.log("end", end);
  if (!start || !end) {
    alert("Invalid entry");
    return;
  }
  if (start == 0 || end == 0) {
    alert("Invalid entry");
    return;
  }
  laoder.style.display = "inline-block";
  qr_body = document.getElementById("body");
  startIndex = start;
  endIndex = end;
  pageIndex = startIndex;
  qrNumber = 100 + (startIndex * 9 - 9);
  qrIds = [];
  qrPage = "";
  createPage();
}
function createPage() {
  for (let i = startIndex; i <= endIndex; i++) {
    qrPage = qrPage + `<div id="qrpage-${i}" class="a4-page">${i}</div>`;
  }
  //qrPage = qrPage + `<p class="print-hide"> <button onclick="window.print()">Download/Print</button> </p>`;
  qr_body.innerHTML = qrPage;
  addQrCards();
}
function addQrCards() {
  let qrStartIndex = (startIndex - 1) * 9 + 1;
  let qrEndIndex = endIndex * 9;
  console.log("qrStartIndex", qrStartIndex);
  console.log("qrEndIndex", qrEndIndex);
  for (let i = qrStartIndex; i <= qrEndIndex; i++) {
    qrNumber++;
    const randomString = Math.random().toString(36).substring(2, 20);
    let qID = randomString + qrNumber;
    qrIds.push(qID);
    let qrId = "https://api.carecode.in/carecode/" + qID;
    qr_cards =
      qr_cards +
      `<div class="card-container"> <div class="image-holder"> <img src="./qrcodebg.jpg" alt=""> </div> <div class="card-content"> <div class="qr-code" id="qrcode-${i}" qr-id="${qrId}"></div> </div> </div>`;
    if (i % 9 == 0) {
      setQrCards(pageIndex, i, qr_cards);
      pageIndex++;
    }
  }
  //this.saveCodesLocal(qrIds);
  //laoder.style.display = "none";
  this.saveCodesRemote(qrIds);
}

function saveCodesLocal(codes) {
  if (localStorage.getItem("qrid")) {
    let existingIds = JSON.parse(localStorage.getItem("qrid"));
    existingIds = existingIds.concat(codes);
    let newIds = JSON.stringify(existingIds);
    localStorage.setItem("qrid", newIds);
  } else {
    let ids = JSON.stringify(codes);
    localStorage.setItem("qrid", ids);
  }
}

async function saveCodesRemote(codes) {
  //console.log("qr codes", codes);
  let ids = JSON.stringify(codes);
  //console.log("qr ids", ids);
  var url = "https://api.carecode.in/carecode/add-qrid";
  //var url = "http://localhost:1337/carecode/add-qrid";
  let options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ids:codes}),
  }
  console.log('options', options);
  try {
    var response = await fetch(url, options);
  } catch (error) {
    laoder.style.display = "none";
    console.log('error::', error);
    alert(error);
    return;
  }
  laoder.style.display = "none";
  if (!response) {
    alert("Server error, Try again later");
    return;
  }
  var respData = await response.json();
  if (respData.code && respData.code == "error") {
    if(respData.message){
      alert("" + respData.message);
    }else{
    alert("Server error, Qr ids not saved in DB");
    }
    return;
  }
}

function setQrCards(page, index, cards) {
  let p = document.getElementById("qrpage-" + page);
  p.innerHTML = cards;
  qr_cards = "";
  setQrCodes(index - 8, index);
}

function setQrCodes(start, end) {
  for (let j = start; j <= end; j++) {
    let elem = document.getElementById("qrcode-" + j);
    if (!elem) {
      continue;
    }
    let qrIdValue = elem.getAttribute("qr-id");
    if (!qrIdValue) {
      continue;
    }
    new QRCode(elem, qrIdValue);
  }
}
