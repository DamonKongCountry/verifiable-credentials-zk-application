import { blsCreateProof, blsVerifyProof, blsSign, blsVerify, generateBls12381G2KeyPair } from "@mattrglobal/bbs-signatures";


const testObj = [{ 0: 50, 1: 51 }, { 1: 49 }];
const testArr = testObj.map(obj => Uint8Array.from(Object.values(obj)));
console.log(testArr);

const testStr = "61,62,63";
const strArr = Uint8Array.from(testStr.split(',')).map(s => parseInt(s));
console.log(strArr);

//test buffer from is similar to the wMsgs layout
console.log(Buffer.from("aa", "utf-8"));
console.log([Uint8Array.from(Buffer.from("aa", "utf-8"))]);
console.log([Uint8Array.from([97, 97])]);

const keyPair = await generateBls12381G2KeyPair();

//Set of messages we wish to sign
const messages = [
  Uint8Array.from(Buffer.from("message1", "utf-8")),
  Uint8Array.from(Buffer.from("message2", "utf-8")),
];

const signature = await blsSign({
  keyPair,
  messages: messages,
});

console.log("Signature:", signature);
keyPair.publicKey && console.log("Public Key:", keyPair.publicKey);
console.log("Messages:", messages);

const wMsg1 = {
  "0": 100,
  "1": 97,
  "2": 109,
  "3": 111,
  "4": 110,
  "5": 46,
  "6": 107,
  "7": 46,
  "8": 99,
  "9": 114,
  "10": 111,
  "11": 119,
  "12": 108,
  "13": 101,
  "14": 121,
  "15": 64,
  "16": 103,
  "17": 109,
  "18": 97,
  "19": 105,
  "20": 108,
  "21": 46,
  "22": 99,
  "23": 111,
  "24": 109
}
const wMsg2 = {
  "0": 50,
  "1": 49
};
const wMsg3 = {
  "0": 68,
  "1": 97,
  "2": 109,
  "3": 111,
  "4": 110,
  "5": 32,
  "6": 75,
  "7": 104,
  "8": 111,
  "9": 114,
  "10": 32,
  "11": 67,
  "12": 114,
  "13": 111,
  "14": 119,
  "15": 108,
  "16": 101,
  "17": 121
}

const wMsg4 = {
  "0": 116,
  "1": 114,
  "2": 117,
  "3": 101
}

const wMsg5 = {
  "0": 65,
  "1": 117,
  "2": 115,
  "3": 116,
  "4": 114,
  "5": 97,
  "6": 108,
  "7": 105,
  "8": 97
}

const wPk = { 0: 145, 1: 154, 2: 109, 3: 208, 4: 245, 5: 214, 6: 138, 7: 235, 8: 253, 9: 7, 10: 2, 11: 49, 12: 143, 13: 141, 14: 115, 15: 36, 16: 130, 17: 201, 18: 90, 19: 63, 20: 151, 21: 93, 22: 14, 23: 32, 24: 142, 25: 120, 26: 27, 27: 149, 28: 30, 29: 95, 30: 110, 31: 41, 32: 250, 33: 163, 34: 220, 35: 234, 36: 115, 37: 37, 38: 108, 39: 230, 40: 53, 41: 195, 42: 103, 43: 174, 44: 170, 45: 2, 46: 44, 47: 161, 48: 21, 49: 236, 50: 37, 51: 88, 52: 186, 53: 197, 54: 161, 55: 89, 56: 33, 57: 126, 58: 191, 59: 11, 60: 26, 61: 73, 62: 76, 63: 111, 64: 164, 65: 206, 66: 134, 67: 147, 68: 199, 69: 88, 70: 42, 71: 41, 72: 114, 73: 219, 74: 82, 75: 81, 76: 185, 77: 64, 78: 178, 79: 37, 80: 85, 81: 163, 82: 71, 83: 68, 84: 188, 85: 44, 86: 103, 87: 131, 88: 160, 89: 215, 90: 174, 91: 166, 92: 26, 93: 93, 94: 168, 95: 104 }
const wSig = { 0: 164, 1: 231, 2: 131, 3: 117, 4: 170, 5: 206, 6: 201, 7: 250, 8: 196, 9: 47, 10: 236, 11: 255, 12: 106, 13: 145, 14: 46, 15: 72, 16: 6, 17: 80, 18: 75, 19: 166, 20: 84, 21: 208, 22: 93, 23: 199, 24: 197, 25: 106, 26: 214, 27: 11, 28: 238, 29: 56, 30: 121, 31: 15, 32: 241, 33: 187, 34: 53, 35: 157, 36: 69, 37: 162, 38: 105, 39: 55, 40: 13, 41: 149, 42: 2, 43: 17, 44: 211, 45: 100, 46: 88, 47: 171, 48: 97, 49: 65, 50: 229, 51: 41, 52: 252, 53: 220, 54: 112, 55: 78, 56: 38, 57: 239, 58: 6, 59: 153, 60: 202, 61: 130, 62: 196, 63: 144, 64: 18, 65: 197, 66: 136, 67: 173, 68: 160, 69: 231, 70: 132, 71: 54, 72: 139, 73: 224, 74: 157, 75: 181, 76: 128, 77: 96, 78: 13, 79: 217, 80: 20, 81: 14, 82: 202, 83: 20, 84: 45, 85: 32, 86: 76, 87: 112, 88: 125, 89: 76, 90: 192, 91: 97, 92: 240, 93: 118, 94: 55, 95: 215, 96: 166, 97: 87, 98: 69, 99: 52, 100: 90, 101: 199, 102: 23, 103: 31, 104: 200, 105: 2, 106: 242, 107: 213, 108: 158, 109: 44, 110: 158, 111: 49 }
console.log("wSig", Uint8Array.from(Object.values(wSig)))
console.log("wPk", Uint8Array.from(Object.values(wPk)))
console.log("wMsg1", Uint8Array.from(Object.values(wMsg1)))
console.log("wMsg2", Uint8Array.from(Object.values(wMsg2)))

//const wMsgs = [Uint8Array.from(Object.values(wMsg1)), Uint8Array.from(Object.values(wMsg2)), Uint8Array.from(Object.values(wMsg3)), Uint8Array.from(Object.values(wMsg4)), Uint8Array.from(Object.values(wMsg5))]

const proofWorking = await blsCreateProof({
  signature: Uint8Array.from(Object.values(wSig)),
  publicKey: Uint8Array.from(Object.values(wPk)),
  messages: [Uint8Array.from(Object.values(wMsg1)), Uint8Array.from(Object.values(wMsg2)), Uint8Array.from(Object.values(wMsg3)), Uint8Array.from(Object.values(wMsg4)), Uint8Array.from(Object.values(wMsg5))],
  revealed: [0, 2, 3],
  nonce: Uint8Array.from(Buffer.from("nonce", "utf8"))
})

const verifyProofWorking = await blsVerifyProof({
  proof: proofWorking,
  publicKey: Uint8Array.from(Object.values(wPk)),
  messages: [Uint8Array.from(Object.values(wMsg1)), Uint8Array.from(Object.values(wMsg3)), Uint8Array.from(Object.values(wMsg4))],
  nonce: Uint8Array.from(Buffer.from("nonce", "utf8"))
})
console.log("Proof valid:", verifyProofWorking.verified);