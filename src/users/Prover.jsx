import './../App.css';
import {
  generateBls12381G2KeyPair,
  blsSign,
  blsCreateProof,
} from "@mattrglobal/bbs-signatures";

// import { ml_dsa44, ml_dsa65, ml_dsa87 } from '@noble/post-quantum/ml-dsa.js';
// import { utf8ToBytes, randomBytes } from '@noble/post-quantum/utils.js';

import { useState, useEffect, useRef } from 'react';

// make this a more specific prover later
function Prover({ positions, allMessages, basePos, mode }) {
  // include logic for receiving info and security key
  // include logic for sending data over

  const [sigVerified, setSigVerified] = useState(null);
  const [signature, setSignature] = useState(null);
  const [proofVerified, setProofVerified] = useState(null);

  const [keyPair, setKeyPair] = useState(null);

  const allMessagesRef = useRef(allMessages);
  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  const posRef = useRef(positions);
  useEffect(() => {
    posRef.current = positions;
  }, [positions]);

  const KPRef = useRef(keyPair);
  useEffect(() => {
    KPRef.current = keyPair;
  }, [keyPair]);

  const sigRef = useRef(signature);
  useEffect(() => {
    sigRef.current = signature;
  }, [signature]);

  useEffect(() => {
    const sigHandler = async (event) => {
      console.log("arrived")
      const pair = await generateBls12381G2KeyPair()
      console.log("Key Pair Generated:", pair);
      setKeyPair(pair);
      setSigVerified(null);
      setProofVerified(null);
      console.log("Received messages for signing:", event.detail.messages, "\nPositions for signing:", event.detail.positions);

      // use all messages in email
      if (!pair) {
        console.log("Key pair not set.");
        setSigVerified(false);
        return;
      }

      if (pair.secretKey) {
        try {
          const fMessages = [];
          for (const value of Object.values(event.detail.messages)) {
            fMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
          }

          // create signature
          const signature = await blsSign({ keyPair: pair, messages: fMessages })
          try {
            if (pair.publicKey) {
              setSignature(signature);
              // verify signature
              console.log(pair, signature)
              const verifySigEvent = new CustomEvent('verifySigSend', { detail: { messages: event.detail.messages, publicKey: pair.publicKey, signature: signature } });
              document.dispatchEvent(verifySigEvent);
            }
          } catch (error) {
            console.error("Proof verification error:", error);
            setSigVerified(false);
          }
        } catch (error) {
          console.error("Proof creation error:", error);
          setSigVerified(false);
        }
      }
    };

    const resHandler = async (event) => {
      setProofVerified(event.detail.isValid.verified);
    };

    document.addEventListener('sendMessages', sigHandler);
    document.addEventListener('verifyProofResult', resHandler);
    return () => {
      document.removeEventListener('sendMessages', sigHandler);
      document.removeEventListener('verifyProofResult', resHandler);
    };
  }, []);

  useEffect(() => {
    keyPair !== null && localStorage.setItem("keyPair", JSON.stringify(keyPair));
  }, [keyPair])

  useEffect(() => {
    signature !== null && localStorage.setItem("signature", JSON.stringify(signature));
  }, [signature])

  useEffect(() => {
    const loginHandler = (event) => {
      setSigVerified(event.detail.verified);
      const result = event.detail.verified;

      const loginEvent = new CustomEvent('loginSuccessful', { detail: { result } });
      document.dispatchEvent(loginEvent);
    }

    const proofHandler = async () => {
      console.log("Messages for proof:", allMessagesRef.current, "\nPositions for proof:", posRef.current);
      // Ensure keyPair and signature are set before proceeding
      const keyPairLocal = JSON.parse(localStorage.getItem("keyPair"));
      keyPairLocal.publicKey = Uint8Array.from(Object.values(keyPairLocal.publicKey));
      const signatureLocal = Uint8Array.from(Object.values(JSON.parse(localStorage.getItem("signature"))));
      console.log(keyPairLocal, signatureLocal)
      if (!keyPairLocal.publicKey) {
        console.log("Key pair not set for proof.");
        setProofVerified(false);
        return;
      }
      if (!signatureLocal) {
        console.log("Signature not set for proof.");
        setProofVerified(false);
        return;
      }
      if (Object.keys(allMessagesRef.current).length === 0) {
        console.log("Message not set for proof.");
        setProofVerified(false);
        return;
      }

      try {
        const fMessages = [];

        // get certain messages for exposed portion
        for (const index in Object.values(allMessagesRef.current)) {
          console.log(posRef.current, " ", parseInt(index))
          if (posRef.current.indexOf(parseInt(index)) !== -1) {
            console.log("Adding message ", Object.values(allMessagesRef.current)[index], " from position ", index);
            fMessages.push(Uint8Array.from(Buffer.from(Object.values(allMessagesRef.current)[index], "utf-8")));
          }
        }
        if (fMessages.length === 0) {
          console.log("No messages to create proof.");
          setProofVerified(false);
          return;
        }

        // Get all original messages for proof creation, including non-approved ones
        const allConvMessages = [];
        console.log("all messages = ", allMessagesRef.current);
        for (const value of Object.values(allMessagesRef.current)) {
          allConvMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
        }

        //convert positions to array
        console.log("signature = ", signatureLocal, "\nconv = ", allConvMessages, "\npk = ", keyPairLocal.publicKey, "\n pos ref curr = ", posRef.current);
        console.log("fMessages = ", fMessages);
        const proof = await blsCreateProof({
          signature: signatureLocal,
          publicKey: keyPairLocal.publicKey,
          messages: allConvMessages,  // Use all original messages
          nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
          revealed: posRef.current // Reveal only the specified positions
        });
        // console.log("Proof created:", proof);

        const eventToSend = new CustomEvent('verifyProofSend', {
          detail: {
            proof: proof,
            publicKey: keyPairLocal.publicKey,
            messages: fMessages,  // Only the revealed messages
            nonce: Uint8Array.from(Buffer.from("nonce", "utf8"))
          }
        });
        document.dispatchEvent(eventToSend);
      } catch (error) {
        console.error("Proof creation error:", error);
        setProofVerified(false);
        return;
      }
    };
    document.addEventListener('verifySigResult', loginHandler);
    document.addEventListener('verifyMessages', proofHandler);
    return () => {
      document.removeEventListener('verifyMessages', proofHandler);
      document.removeEventListener('verifySigResult', loginHandler);
    };
  }, [keyPair]);

  return (
    <div className="proverContainer">
      {proofVerified === true && mode === "verify" && <h3 className='proverMsg'>Messages verified!</h3>}
      {proofVerified === false && mode === "verify" && <h3 className='proverMsg'>Messages not verified!</h3>}
    </div>
  )
}

export default Prover;