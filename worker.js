importScripts('./lib/crypto-js.min.js', './lib/elliptic.min.js');

self.onmessage = async (event) => {
    const { rangeStart, rangeEnd, targetHash } = event.data;
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');

    const start = BigInt("0x" + rangeStart);
    const end = BigInt("0x" + rangeEnd);
    const curveN = BigInt("0x" + ec.curve.n.toString(16)); // Ordem da curva

    let found = false;

    // Loop de busca
    for (let i = start; i <= end; i++) {
        const privateKeyHex = i.toString(16).padStart(64, '0');

        // Validar se a chave privada está no intervalo válido
        const privateKeyBigInt = BigInt("0x" + privateKeyHex);
        if (privateKeyBigInt <= 0n || privateKeyBigInt >= curveN) {
            continue; // Ignorar chaves inválidas
        }

        try {
            // Gerar chave pública
            const keyPair = ec.keyFromPrivate(privateKeyHex);
            const publicKey = keyPair.getPublic(true, 'hex'); // Chave pública comprimida

            // Hash da chave pública
            const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();

            // Comparar com o hash alvo
            if (ripemd160Hash === targetHash) {
                self.postMessage({ type: 'found', privateKey: privateKeyHex });
                found = true;
                break; // Para o loop de busca quando encontrar a chave
            }

            // Atualizar progresso a cada 10.000 iterações
            //if (i % 10000n === 0n) {
             //   self.postMessage({ type: 'update', message: `Testing key: ${privateKeyHex}` });
           // }

        } catch (error) {
            console.error(`Error processing key ${privateKeyHex}:`, error);
        }
    }

    if (!found) {
        self.postMessage({ type: 'finished' });
    }
};
