import './App.css';
import {
  generateBls12381G2KeyPair,
  blsSign,
  blsVerify,
  blsCreateProof,
  blsVerifyProof,
  sign,
} from "@mattrglobal/bbs-signatures";
import React, { useState, useEffect } from 'react';

// run on powershell  
function App() {
  const [keyPair, setKeyPair] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processMessage = async () => {
      if (!keyPair || !message) {
        console.log("Key pair or message not set.");
        return null;
      }
      const signature = null;
      if (keyPair.secretKey) {
        try {
          const messages = [Uint8Array.from(Buffer.from(message, "utf-8"))];
          const signature = await blsSign({keyPair, messages: messages});
          console.log("Signature:", signature);
          if (keyPair.publicKey) {
            try {
              const isValid = await blsVerify({messages: messages, publicKey: keyPair.publicKey, signature});
              console.log("Signature valid:", isValid);
            } catch (error) {
              console.error("Verification error:", error);
              return null;
            }
          }
        } catch (error) {
          console.error("Signing error:", error);
          return null;
        }
      }
      
      return signature;
    };

    const processProof = async (signature) => {
      if (!keyPair || !message) {
        console.log("Key pair or message not set for proof.");
        return false;
      }
      if (keyPair.secretKey) {
        try {
          const proof = await blsCreateProof(signature, keyPair.secretKey);
          console.log("Proof created:", proof);
          if (keyPair.publicKey) {
            try {
              const isProofValid = await blsVerifyProof(message, keyPair.publicKey, proof);
              console.log("Proof valid:", isProofValid);
            } catch (error) {
              console.error("Proof verification error:", error);
              return false;
            }
          }
        } catch (error) {
          console.error("Proof creation error:", error);
          return false;
        }
      }
      return true;
    };
    
    let proof = processMessage();
    if (proof) {
      processProof(proof).then((result) => {
        console.log("Proof is Done:", result);
      });
    }
    
  }, [keyPair, message]);

  const keyGenerated = async () => {
    const pair = await generateBls12381G2KeyPair();
    console.log("Key Pair Generated:", pair);
    setKeyPair(pair);
  };

  return (
    <div className="App">
      <h1>Enter your asge:</h1>
      <input type="text" onChange={(e) => setMessage(e.target.value)}/>
      <input type="submit" value="Submit" onClick={async (e) => keyGenerated()}/>
    </div>
  );
}

export default App;
