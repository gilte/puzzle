/*importScripts('./lib/crypto-js.min.js', './lib/elliptic.min.js');

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
        const minStep = 1000000000000000n; // Valor mínimo do passo
        const maxStep = 9000000000000000n; // Valor máximo do passo
        return BigInt(Math.floor(Math.random() * Number(maxStep - minStep)) + Number(minStep));
    }

    let step = getRandomStep(); // Inicializa com um passo aleatório
    console.log(`Initial step: ${step}`); // Loga o valor inicial de step

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

importScripts('./lib/crypto-js.min.js', './lib/elliptic.min.js');

self.onmessage = async (event) => {
    const { rangeStart, rangeEnd, targetHash } = event.data;
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');

    const start = BigInt("0x" + rangeStart);
    const end = BigInt("0x" + rangeEnd);
    const curveN = BigInt("0x" + ec.curve.n.toString(16));

    const step = 4882812500n; 
    let currentStep = start;

    while (true) { // Loop infinito
        const privateKeyHex = currentStep.toString(16).padStart(64, '0');
        

        const privateKeyBigInt = BigInt("0x" + privateKeyHex);
        if (privateKeyBigInt <= 0n || privateKeyBigInt >= curveN) {
            currentStep += step;
            if (currentStep > end) currentStep = start; // Reinicia ao ultrapassar o intervalo
            continue;
        }
        //loop

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
        }
    }
}; */


importScripts('./lib/crypto-js.min.js', './lib/elliptic.min.js');

self.onmessage = async (event) => {
    const { rangeStart, rangeEnd, targetHash, digitStart, digitEnd } = event.data;
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');

    const start = BigInt("0x" + rangeStart);
    const end = BigInt("0x" + rangeEnd);
    const curveN = BigInt("0x" + ec.curve.n.toString(16));

    let currentStep = start;

    // Função para gerar um número aleatório usando apenas os dígitos permitidos
    function getRandomStep(digitStart, digitEnd, length = 2) {
        const allowedDigits = [];
        for (let i = digitStart; i <= digitEnd; i++) {
            allowedDigits.push(i.toString());
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allowedDigits.length);
            result += allowedDigits[randomIndex];
        }

        return BigInt(result); // Retorna como BigInt
    }

    let step = getRandomStep(digitStart, digitEnd); // Inicializa com um passo personalizado
    console.log(`Initial step: ${step}`); // Loga o valor inicial de step

    while (true) {
        const privateKeyHex = currentStep.toString(16).padStart(64, '0');

        const privateKeyBigInt = BigInt("0x" + privateKeyHex);
        if (privateKeyBigInt <= 0n || privateKeyBigInt >= curveN) {
            currentStep += step;
            if (currentStep > end) {
                currentStep = start; // Reinicia ao ultrapassar o intervalo
                step = getRandomStep(digitStart, digitEnd); // Atualiza o passo personalizado
            }
            continue;
        }

        try {
            const keyPair = ec.keyFromPrivate(privateKeyHex);
            const publicKey = keyPair.getPublic(true, 'hex');
            const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();

            if (ripemd160Hash === targetHash) {
                self.postMessage({ type: 'found', privateKey: privateKeyHex });
                break; // Encerra o loop ao encontrar o hash
            }

            if (currentStep % 1000n === 0n) {
                self.postMessage({ type: 'update', message: `Testing key: ${step}` });
            }
        } catch (error) {
            console.error(`Error processing key ${privateKeyHex}:`, error);
        }

        currentStep += step;

        if (currentStep > end) {
            currentStep = start; // Reinicia ao ultrapassar o intervalo
            step = getRandomStep(digitStart, digitEnd); // Atualiza o passo personalizado
             // Loga o novo valor de step
        }
    }
};

