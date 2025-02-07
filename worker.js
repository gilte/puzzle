importScripts("https://cdnjs.cloudflare.com/ajax/libs/elliptic/6.5.4/elliptic.min.js");
importScripts("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js");

const ec = new elliptic.ec('secp256k1');

self.onmessage = function(event) {
    const { rangeStart, rangeEnd, targetHash, minStep, maxStep } = event.data;

    let start = BigInt("0x" + rangeStart);
    let end = BigInt("0x" + rangeEnd);
    let stepMin = BigInt(minStep);
    let stepMax = BigInt(maxStep);
    let currentStep = start;

    function getRandomStep() {
        return BigInt(Math.floor(Math.random() * (Number(stepMax - stepMin) + 1)) + Number(stepMin));
    }

    while (true) {
        if (currentStep > end) currentStep = start;

        const privateKeyHex = currentStep.toString(16).padStart(64, '0');
        const privateKeyBigInt = BigInt("0x" + privateKeyHex);

        if (privateKeyBigInt <= 0n || privateKeyBigInt >= ec.curve.n) {
            currentStep += getRandomStep();
            continue;
        }

        try {
            const keyPair = ec.keyFromPrivate(privateKeyHex);
            const publicKey = keyPair.getPublic(true, 'hex');
            const sha256Hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();

            self.postMessage({
                type: 'update',
                message: `Base Key: ${privateKeyHex.replace(/^0+/, '')}`,
            });

            if (ripemd160Hash.startsWith('7')) {
                if (ripemd160Hash === targetHash) {
                    self.postMessage({ type: 'found', privateKey: privateKeyHex });
                    break;
                }
            }
        } catch (error) {
            self.postMessage({
                type: 'error',
                message: `Error at step ${privateKeyHex}: ${error.message}`,
            });
        }

        currentStep += getRandomStep();
    }
};
