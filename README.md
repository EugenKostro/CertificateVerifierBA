## 1. UVOD  

Certifikat DApp je decentralizirana aplikacija razvijena za upravljanje certifikatima na Ethereum blockchainu.  
Aplikacija omogućuje dodavanje, provjeru i uklanjanje certifikata kroz jednostavno web sučelje povezano s MetaMask walletom.  

Backend je napisan u Solidityju, a frontend koristi HTML, CSS i JavaScript uz Web3.js biblioteku za komunikaciju s blockchainom.  

---

## 2. FUNKCIONALNOSTI  

Aplikacija korisnicima omogućuje dodavanje novih certifikata unosom jedinstvenog identifikatora. Svaki certifikat se sprema na blockchain i ostaje trajno dostupan za provjeru. Ako certifikat više nije važeći, moguće ga je ukloniti.  

Uz osnovne operacije, aplikacija omogućuje i dodatne funkcionalnosti:  

- pregled svih certifikata s blockchaina kroz listu,  
- pretragu i filtriranje certifikata unutar liste,  
- ispis cijele liste certifikata putem opcije za print,  
- generiranje QR koda za svaki certifikat koji vodi na provjeru u aplikaciji,  
- prikaz statusa svake transakcije i njenog hash-a radi transparentnosti.  

---

## 3. STRUKTURA PROJEKTA 

Projekt je podijeljen u dva glavna dijela: pametni ugovor i frontend aplikaciju.  

- Pametni ugovor `CertificateVerifier.sol` nalazi se u direktoriju `contracts` i definira osnovne funkcionalnosti sustava.  
- Skripta `deploy.js` u direktoriju `scripts` koristi se za postavljanje ugovora na mrežu pomoću Hardhat-a.  
- Frontend se nalazi u direktoriju `frontend` i sastoji se od `index.html` za korisničko sučelje, `style.css` za stilizaciju i `app.js` za logiku i komunikaciju s blockchainom.  

---

## 4. TEHNOLOGIJE  

Za razvoj aplikacije korištene su sljedeće tehnologije i alati:  

- Solidity za razvoj pametnog ugovora,  
- Hardhat za lokalno testiranje i deploy,  
- Web3.js za povezivanje frontenda s blockchainom,  
- MetaMask za upravljanje walletima i autentifikaciju korisnika,  
- QRCode.js za generiranje QR kodova u frontend dijelu aplikacije.  

---

## 5. INSTALACIJE I POKRETANJE

### 5.1 POKRETANJE LOKALNOG BLOCKCHAINA
Pokretanje Hardhat lokalnog nodea koji simulira blockchain okruženje:
```bash
npx hardhat node
```
### 5.2 KOMPAJLIRANJE I DEPLOY UGOVORA
Kompajliranje i postavljanje ugovora na lokalni node
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```
Kada se pokrenu navedene komande konzola ispiše nešto poput ovoga
```bash
Deployed to: 0xAbC1234567890abcdef...
```
### 5.3 KONFIGURACIJA APP.JS

U `frontend/app.js` mijenja se adresa ugovora sa varijablom `contractAddress`:
```bash
const contractAddress = "0xAbC1234567890abcdef...";
```

### 5.4 POKRETANJE FRONTENDA

Frontend mora biti pokrenut preko lokalnog servera:

```bash
cd frontend
npx live-server
```
Nakon toga aplikacija će biti dostupna na:
```bash
http://localhost:8080
```

## 6. METAMASK KONFIGURACIJA

Kako bi se aplikacija povezala s lokalnim blockchainom, potrebno je konfigurirati MetaMask:

RPC URL: `http://127.0.0.1:8545`

Chain ID: `31337`

Naziv mreže: Hardhat Localhost

Nakon dodavanja mreže potrebno je uvesti jedan od računa koje je Hardhat generirao prilikom pokretanja node-a. Privatni ključevi tih računa prikazani su u konzoli, a računi imaju dovoljno testnih sredstava za transakcije.

## 7. KOD

### 7.1 PAMETNI UGOVOR

Pametni ugovor `CertificateVerifier.sol` sadrži osnovnu logiku aplikacije.
U njemu se koristi `mapping` za spremanje statusa certifikata (`true` ili `false`) i `array` koji pamti sve dodane certifikate radi kasnijeg dohvaćanja.
Ključne funkcije su:

`addCertificate` – dodaje novi certifikat i sprema ga u `mapping` i u listu.

`verifyCertificate` – provjerava postoji li certifikat i vraća `true` ili `false`.

`removeCertificate` – uklanja certifikat postavljanjem vrijednosti na `false`.

`getAllCertificates` – vraća cijeli popis certifikata.

Time ugovor omogućuje osnovni CRUD (`Create`, `Read`, `Delete`) za certifikate.
```bash
mapping(string => bool) public certificates;
string[] private allCertificates;

function addCertificate(string memory certId) public {
    require(!certificates[certId], "Certifikat vec postoji");
    certificates[certId] = true;
    allCertificates.push(certId);
}

function verifyCertificate(string memory certId) public view returns (bool) {
    return certificates[certId];
}

function removeCertificate(string memory certId) public {
    require(certificates[certId], "Certifikat NE postoji");
    certificates[certId] = false;
}

function getAllCertificates() public view returns (string[] memory) {
    return allCertificates;
}
```

### 7.2 FRONTEND POVEZIVANJE

U `app.js` implementirano je spajanje na blockchain.
Funkcija `connectWallet` koristi `Web3.js` i `MetaMask` kako bi dohvatila korisnički wallet i instancirala ugovor s pomoću `ABI-ja` i adrese ugovora.
Nakon spajanja, odmah se poziva funkcija `loadAllCertificates` koja dohvaća sve certifikate sa blockchaina i prikazuje ih u sučelju.
Ovaj dio koda predstavlja most između blockchaina i korisničkog sučelja
```bash
async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: 'eth_requestAccounts' });
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(abi, contractAddress);
    alert("Povezan!");
    loadAllCertificates();
  }
}
```

### 7.3 DODAVANJE CERTIFIKATA

Dodavanje certifikata funkcionira tako da korisnik unese ID u polje i klikne gumb.
Funkcija `addCertificate` šalje transakciju na blockchain, a nakon što je transakcija potvrđena, isti `ID` se dodaje u `HTML` listu na stranici.
Na taj način korisnik odmah vidi novi certifikat bez ponovnog učitavanja stranice.

```bash
async function addCertificate() {
  const certId = document.getElementById("certIdAdd").value.trim();
  const tx = await contract.methods.addCertificate(certId).send({ from: accounts[0] });
  addCertToList(certId);
}
```

### 7.4 PRIKAZ CERTIFIKATA U LISTI

Prikaz liste certifikata radi kroz funkciju `addCertToList`.
Za svaki certifikat dinamički se kreira `HTML` element koji sadrži:

ID certifikata (tekstualni prikaz),

gumb "Ukloni" koji poziva funkciju za brisanje certifikata,

QR kod koji se generira pomoću biblioteke `QRCode.js`, a vodi na provjeru tog certifikata.

Na taj način svaki unos postaje interaktivan i odmah pruža sve opcije – provjeru, uklanjanje i jednostavno dijeljenje putem QR koda.
```bash
function addCertToList(certId) {
  const list = document.getElementById("certList");
  const li = document.createElement("li");

  const info = document.createElement("div");
  info.innerText = certId;

  const removeBtn = document.createElement("button");
  removeBtn.innerText = "Ukloni";
  removeBtn.onclick = () => removeCertificate(certId, li);

  const qrDiv = document.createElement("div");
  new QRCode(qrDiv, { text: window.location.origin + "/?verify=" + certId });

  li.appendChild(info);
  li.appendChild(removeBtn);
  li.appendChild(qrDiv);
  list.appendChild(li);
}
```

## 8. PRIMJERI KORIŠTENJA

Primjer tipične upotrebe izgleda ovako:

1. Pokrene se aplikacija i poveže se MetaMask wallet.
2. Korisnik unese ID certifikata, npr. ID123, i doda ga na blockchain.
3. Certifikat se prikazuje u listi zajedno s QR kodom i gumbom za uklanjanje.
4. Provjera certifikata unosom istog ID-a vraća informaciju da on postoji.
5. Klikom na gumb "Ukloni" certifikat se briše iz blockchaina i više se ne prikazuje.
6. Lista se može filtrirati unosom pojma u polje za pretragu.
7. Klikom na gumb "Printaj listu" otvara se dijalog za ispis cijele liste.

## 9. MOGUĆE NADOGRADNJE

Aplikaciju je moguće nadograditi na više načina:

Implementacija uloga (administrator, izdavatelj, ovjeravatelj).
Deployment aplikacije na Ethereum testnet mreže (Sepolia, Goerli).
Dodavanje dodatnih metapodataka za certifikate, poput izdavatelja, datuma izdavanja i vlasnika.

## 10. Zaključak  

Projekt Certifikat DApp pokazuje kako se blockchain tehnologija može koristiti za jednostavnu, ali sigurnu pohranu i provjeru certifikata.  
Pametni ugovor napisan u Solidityju osigurava nepromjenjivost podataka, dok frontend izrađen u HTML-u, CSS-u i JavaScriptu omogućuje korisniku jednostavno upravljanje certifikatima kroz pregledno web sučelje.  

Realizacijom ovog projekta stečeno je iskustvo u razvoju pametnih ugovora, radu s Hardhat okruženjem, povezivanju putem Web3.js i integraciji s MetaMask walletom.  
Osim toga, implementirane funkcionalnosti poput QR kodova, ispisa liste i filtriranja unosa pokazuju kako se klasične web tehnike mogu kombinirati s blockchain tehnologijom da bi se dobio praktičan i primjenjiv sustav.  

Iako aplikacija u trenutnoj verziji pokriva osnovne potrebe za upravljanje certifikatima, buduće nadogradnje kao što su uvođenje korisničkih uloga, dodavanje metapodataka i deployment na javne testne mreže mogu je dovesti na višu razinu i približiti stvarnim scenarijima primjene u obrazovanju, poslovanju i industriji.  
