

const mp = new MercadoPago("TEST-8781130299222630-062108-dd426f59e4bbe176b6b9fed1df852807-114070078", {
  locale: "pt-BR"
});

  

  document.getElementById("checkout").addEventListener("click", () => {
    const container = document.getElementById("meioPagamento");
    container.style.display = "block";
    container.innerHTML = `
      <h6>Escolha como deseja pagar</h6>
      <div class="d-grid gap-2 my-3">
        <button class="btn btn-success" id="pagarPix">Pix</button>
        <button class="btn btn-secondary" id="pagarCartao">Cartão de Crédito</button>
      </div>
      <div id="resultadoPagamento" class="mt-3"></div>
    `;
const amountInput = document.getElementById("amount");
const btnCheckout = document.getElementById("checkout");

amountInput.addEventListener("input", () => {
  const valor = parseFloat(amountInput.value);
  btnCheckout.disabled = !valor || valor <= 0;
});
    // Listeners para os botões
    setTimeout(() => {
      document.getElementById("pagarPix").addEventListener("click", pagarComPix);
      document.getElementById("pagarCartao").addEventListener("click", mostrarFormCartao);
    }, 100);
  });


  async function pagarComPix() {

    const email = "TESTUSER20529787@testuser.com"; // você pode conectar com o input de mensagem
    const valorDigitado = parseFloat(document.getElementById("amount").value);

    if (!valorDigitado || valorDigitado <= 0) {
    alert("Por favor, digite um valor válido para o presente.");
    return;
}


    const res = await fetch("http://localhost:3000/create_payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_method: "pix",
        amount: valorDigitado,
        description: "Presente via Pix",
        email
      })
    });

    const data = await res.json();
    console.log("Pix gerado:", data);
    const result = document.getElementById("resultadoPagamento");

    if (data.point_of_interaction) {
      const qr = data.point_of_interaction.transaction_data.qr_code;
      const qrImg = data.point_of_interaction.transaction_data.qr_code_base64;

      result.innerHTML = `
        <p>Pix Copia e Cola:</p>
        <textarea class="form-control">${qr}</textarea>
        <img src="${qrImg}" class="img-fluid mt-2" style="max-width: 200px;" />
      `;
    } else {
      result.innerHTML = "<p class='text-danger'>Erro ao gerar Pix</p>";
    }
  }

  function mostrarFormCartao() {
    const result = document.getElementById("resultadoPagamento");
    result.innerHTML = `
      <form id="formCartao" class="mt-3">
        <input type="text" id="cardNumber" class="form-control mb-2" placeholder="Número do cartão" />
        <div class="d-flex gap-2">
          <input type="text" id="cardExpirationMonth" class="form-control" placeholder="Mês" />
          <input type="text" id="cardExpirationYear" class="form-control" placeholder="Ano" />
        </div>
        <input type="text" id="securityCode" class="form-control my-2" placeholder="CVV" />
        <input type="text" id="cardholderName" class="form-control mb-2" placeholder="Nome no cartão" />
        <input type="text" id="docNumber" class="form-control mb-2" placeholder="CPF" />
        <button class="btn btn-primary w-100">Confirmar pagamento</button>
      </form>
    `;

    setTimeout(() => {
      document.getElementById("formCartao").addEventListener("submit", pagarComCartao);
    }, 100);
  }

  async function pagarComCartao(e) {
    e.preventDefault();
    const valorDigitado = parseFloat(document.getElementById("amount").value);

    if (!valorDigitado || valorDigitado <= 0) {
    alert("Por favor, digite um valor válido para o presente.");
    return;
    }
    const tokenResponse = await mp.createCardToken({
      cardNumber: document.getElementById("cardNumber").value,
      cardholderName: document.getElementById("cardholderName").value,
      securityCode: document.getElementById("securityCode").value,
      cardExpirationMonth: document.getElementById("cardExpirationMonth").value,
      cardExpirationYear: document.getElementById("cardExpirationYear").value,
      identificationType: "CPF",
      identificationNumber: document.getElementById("docNumber").value
    });

    const token = tokenResponse.id;

    const res = await fetch("http://localhost:3000/create_payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        payment_method: "visa", // ou outro, depende do cartão
        description: "Presente via Cartão",
        amount: valorDigitado, 
        email
        
      })
    });

    const data = await res.json();

    document.getElementById("resultadoPagamento").innerHTML =
      `<p>Status: <strong>${data.status}</strong></p>`;
  }

