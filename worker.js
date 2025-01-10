importScripts('./lib/crypto-js.min.js', './lib/elliptic.min.js');

self.onmessage = async (event) => {
    const { rangeStart, rangeEnd, targetHash } = event.data;
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');

    const start = BigInt("0x" + rangeStart);
    const end = BigInt("0x" + rangeEnd);
    const curveN = BigInt("0x" + ec.curve.n.toString(16));

    let currentStep = start;

    // Função para gerar um valor aleatório para o step
    function getRandomStep() {
        const minStep = 81935412126341n; // Valor mínimo do passo
        const maxStep = 91935412126341n; // Valor máximo do passo
        return BigInt(Math.floor(Math.random() * Number(maxStep - minStep)) + Number(minStep));
    }

    let step = getRandomStep(); // Inicializa com um passo aleatório
    //console.log(`Initial step: ${step}`); // Loga o valor inicial de step

    while (true) {
        const privateKeyHex = currentStep.toString(16).padStart(64, '0');

        const privateKeyBigInt = BigInt("0x" + privateKeyHex);
        if (privateKeyBigInt <= 0n || privateKeyBigInt >= curveN) {
            currentStep += step;
            if (currentStep > end) {
                currentStep = start; // Reinicia ao ultrapassar o intervalo
                step = getRandomStep(); // Atualiza o passo aleatório
               // console.log(`New step after range reset: ${step}`); // Loga o novo valor de step
            }
            continue;
        }

        try {
            const keyPair = ec.keyFromPrivate(privateKeyHex);
            const publicKey = keyPair.getPublic(true, 'hex');
            const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
            //console.log(`Generated RIPEMD160: ${ripemd160Hash}`);

            if (ripemd160Hash === targetHash) {
                self.postMessage({ type: 'found', privateKey: privateKeyHex });
                break; // Encerra o loop ao encontrar o hash
            }

            if (currentStep % 1000n === 0n) {
                self.postMessage({ type: 'update', message: `Testing key: ${privateKeyHex}` });
            }
        } catch (error) {
            console.error(`Error processing key ${privateKeyHex}:`, error);
        }

        currentStep += step;

        if (currentStep > end) {
            currentStep = start; // Reinicia ao ultrapassar o intervalo
            step = getRandomStep(); // Atualiza o passo aleatório
            //console.log(`New step after range reset: ${step}`); // Loga o novo valor de step
        }
    }
};
