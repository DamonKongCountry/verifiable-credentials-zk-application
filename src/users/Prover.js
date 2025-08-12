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
function Prover({ messages, positions, basePos, allMessages }) {
  // include logic for receiving info and security key
  // include logic for sending data over

  const [sigVerified, setSigVerified] = useState(null);
  const [signature, setSignature] = useState(null);
  const [proofVerified, setProofVerified] = useState(null);

  const [keyPair, setKeyPair] = useState(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
      const pair = await generateBls12381G2KeyPair();
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
      } else if (Object.keys(event.detail.messages).length === 0) {
        console.log("No messages to sign.");
        setSigVerified(false);
        return;
      }
      if (pair.secretKey) {
        try {
          const fMessages = [];
          for (const value of Object.values(event.detail.messages)) {
            fMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
          }
          // console.log("fMessages:", fMessages);

          // create signature
          const signature = await blsSign({ keyPair: pair, messages: fMessages });
          // const seed = randomBytes(32); // seed is optional
          // const keys = ml_dsa65.keygen(seed);
          // const concatMsg = utf8ToBytes(Object.values(messagesRef.current).join(""));
          // const signature = ml_dsa65.sign(keys.secretKey, concatMsg);

          setSignature(signature);
          // console.log("Signature:", signature);

          if (pair.publicKey) {
            try {
              // verify signature
              const event = new CustomEvent('verifySigSend', { detail: { messages: fMessages, publicKey: pair.publicKey, signature: signature } });
              document.dispatchEvent(event);
            } catch (error) {
              console.error("Verification error:", error);
              setSigVerified(false);
              return;
            }
          }
        } catch (error) {
          console.error("Signing error:", error);
          setSigVerified(false);
          return;
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
    const proofHandler = async (event) => {
      setSigVerified(event.detail.isValid.verified);
      console.log("Messages for proof:", messagesRef.current, "\nPositions for proof:", posRef.current);
      // Ensure keyPair and signature are set before proceeding
      if (!event.detail.isValid.verified) {
        console.log("Signature verification failed.");
        setProofVerified(false);
        return;
      }
      if (!event.detail.publicKey) {
        console.log("Key pair not set for proof.");
        setProofVerified(false);
        return;
      }
      if (!event.detail.signature) {
        console.log("Signature not set for proof.");
        setProofVerified(false);
        return;
      }
      if (Object.keys(messagesRef.current).length === 0) {
        console.log("Message not set for proof.");
        setProofVerified(false);
        return;
      }

      try {
        const fMessages = [];
        // get certain messages for exposed portion
        for (const [key, value] of Object.entries(messagesRef.current)) {
          if (basePos[key] !== undefined) {
            console.log("Adding message for proof:", key, value);
            fMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
          }
        }
        if (fMessages.length === 0) {
          console.log("No messages to create proof.");
          return;
        }

        // Get all original messages for proof creation, including non-approved ones
        const allConvMessages = [];
        console.log("all messages = ", allMessagesRef.current);
        for (const value of Object.values(allMessagesRef.current)) {
          allConvMessages.push(Uint8Array.from(Buffer.from(value, "utf-8")));
        }

        //convert positions to array
        const arrPos = [];
        for (const value of Object.values(posRef.current)) {
          arrPos.push(value);
        }
        console.log("signature = ", event.detail.signature, "\nconv = ", allConvMessages, "\npk = ", event.detail.publicKey, "\n pos ref curr = ", posRef.current);
        const proof = await blsCreateProof({
          signature: event.detail.signature,
          publicKey: event.detail.publicKey,
          messages: allConvMessages,  // Use all original messages
          nonce: Uint8Array.from(Buffer.from("nonce", "utf8")),
          revealed: arrPos // Reveal only the specified positions
        });
        console.log("Proof created:", proof);

        const eventToSend = new CustomEvent('verifyProofSend', {
          detail: {
            proof: proof,
            publicKey: event.detail.publicKey,
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

    document.addEventListener('verifySigResult', proofHandler);
    return () => {
      document.removeEventListener('verifySigResult', proofHandler);
    };
  }, [keyPair]);

  return (
    <div className="proverContainer">
      {sigVerified === true && <p>Signature is valid!</p>}
      {sigVerified === false && <p>Signature is invalid!</p>}
      {proofVerified === true && <p>Proof is valid!</p>}
      {proofVerified === false && <p>Proof is invalid!</p>}
    </div>
  )
}

export default Prover;