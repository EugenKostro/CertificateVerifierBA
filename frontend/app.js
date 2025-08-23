let web3;
let contract;
let accounts;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  {
    "inputs":[{"internalType":"string","name":"certId","type":"string"}],
    "name":"addCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"string","name":"","type":"string"}],
    "name":"certificates","outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"internalType":"string","name":"certId","type":"string"}],
    "name":"verifyCertificate","outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"internalType":"string","name":"certId","type":"string"}],
    "name":"removeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[],"name":"getAllCertificates","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],
    "stateMutability":"view","type":"function"
  }
];

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: 'eth_requestAccounts' });
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(abi, contractAddress);
    alert("Povezan!");
    loadAllCertificates();
  } else {
    alert("MetaMask nije pronađen.");
  }
}

async function addCertificate() {
  const certId = document.getElementById("certIdAdd").value.trim();
  if (!certId) return alert("Unesi ID certifikata!");

  try {
    showResult("⌛ Čekam potvrdu...", "info");
    const tx = await contract.methods.addCertificate(certId).send({ from: accounts[0] });
    showResult(`Certifikat dodan! Tx hash: ${tx.transactionHash}`, "success");
    addCertToList(certId);
    document.getElementById("certIdAdd").value = "";
  } catch (err) {
    showResult("Greška: " + err.message, "error");
  }
}

async function verifyCertificate() {
  const certId = document.getElementById("certIdVerify").value.trim();
  if (!certId) return alert("Unesi ID certifikata!");
  try {
    const result = await contract.methods.verifyCertificate(certId).call();
    showResult(result ? "Certifikat postoji" : "Ne postoji", result ? "success" : "error");
  } catch (err) {
    showResult("Greška: " + err.message, "error");
  }
}

async function removeCertificate(certId, li) {
  try {
    showResult("Uklanjam...", "info");
    await contract.methods.removeCertificate(certId).send({ from: accounts[0] });
    showResult("Uklonjen certifikat: " + certId, "success");
    li.remove();
  } catch (err) {
    showResult("Greška: " + err.message, "error");
  }
}

// Dodavanje certifikata i qr kodova
function addCertToList(certId) {
  const list = document.getElementById("certList");
  const li = document.createElement("li");

  const info = document.createElement("div");
  info.className = "cert-info";
  info.innerText = certId;

  const actions = document.createElement("div");
  actions.className = "cert-actions";

  const removeBtn = document.createElement("button");
  removeBtn.innerText = "UKLONI";
  removeBtn.onclick = () => removeCertificate(certId, li);

  const qrDiv = document.createElement("div");
  qrDiv.className = "cert-qr";
  new QRCode(qrDiv, {
    text: window.location.origin + "/?verify=" + certId,
    width: 60,
    height: 60
  });

  actions.appendChild(removeBtn);
  actions.appendChild(qrDiv);

  li.appendChild(info);
  li.appendChild(actions);

  list.appendChild(li);
}

// Search
function filterList() {
  const filter = document.getElementById("searchBox").value.toLowerCase();
  const lis = document.getElementById("certList").getElementsByTagName("li");
  for (let li of lis) {
    const text = li.innerText.toLowerCase();
    li.style.display = text.includes(filter) ? "" : "none";
  }
}

// Print
function printList() {
  const listHtml = document.getElementById("certList").innerHTML;
  const win = window.open("", "", "width=600,height=800");
  win.document.write("<h1>Lista certifikata</h1>");
  win.document.write("<ul>" + listHtml + "</ul>");
  win.print();
  win.close();
}

// Učitavanje sa certifikata 
async function loadAllCertificates() {
  try {
    const certs = await contract.methods.getAllCertificates().call();
    document.getElementById("certList").innerHTML = "";
    certs.forEach(certId => {
      if (certId) addCertToList(certId);
    });
  } catch (err) {
    console.error("Ne mogu učitati listu:", err.message);
  }
}

function showResult(msg, type) {
  const el = document.getElementById("result");
  el.className = type;
  el.innerText = msg;
}
