/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
  blsVerify,
  blsVerifyProof,
} from "@mattrglobal/bbs-signatures";
 */

// the proof is made by the user and verified here
const { blsVerifyProof } = require('@mattrglobal/bbs-signatures');

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log('EVENT RAW:', JSON.stringify(event || {}, null, 2));

  const getHeader = (h, name) => {
    if (!h) return undefined;
    const key = Object.keys(h).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? h[key] : undefined;
  };

  const parseMultipart = (raw, contentType) => {
    const boundaryMatch = contentType && contentType.match(/boundary=(.*)$/);
    const boundary = boundaryMatch ? boundaryMatch[1] : (raw.split('\r\n')[0] || '').replace(/^--/, '');
    if (!boundary) return null;

    const parts = raw.split(`--${boundary}`).map(p => p.trim()).filter(Boolean);
    const result = {};
    for (const part of parts) {
      // skip final boundary marker
      if (part === '--' || part === '--\r\n') {
        continue;
      }
      // header / body split
      const [rawHeaders, ...bodyLines] = part.split('\r\n\r\n');
      if (!rawHeaders || bodyLines.length === 0) {
        continue;
      }
      const headers = rawHeaders.split('\r\n');
      const nameMatch = rawHeaders.match(/name="([^"]+)"/);
      if (!nameMatch) {
        continue;
      }
      const name = nameMatch[1];
      // rejoin body lines and trim trailing boundary markers
      let value = bodyLines.join('\r\n\r\n').replace(/\r\n--$/, '').replace(/\r\n$/, '');
      // trim pure CRLFs
      value = value.replace(/^\r\n/, '').replace(/\r\n$/, '');
      result[name] = value;
    }
    return result;
  };

  // NOTE
  // ==========================================================================
  // until we get the body/post method sorted out, I will be using query params
  // ==========================================================================

  // let payload = null;
  // try {
  //   if (event && event.body != null) {
  //     const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  //     const contentType = getHeader(event.headers, 'content-type') || getHeader(event.headers, 'Content-Type') || '';

  //     if (contentType.includes('multipart/form-data') || (typeof raw === 'string' && raw.startsWith('----'))) {
  //       payload = parseMultipart(raw, contentType);
  //     } else {
  //       // fall back to JSON
  //       payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
  //     }
  //   }
  // } catch (err) {
  //   console.error('parse error', err, 'sample raw:', event && event.body);
  //   return {
  //     statusCode: 400,
  //     headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"},
  //     body: JSON.stringify({ error: 'Invalid payload', details: err.message }),
  //   };
  // }

  // used to check values (lambda crashes if we call values directly for some reason)

  const pMessages = JSON.parse(event.queryStringParameters.messages);
  const pPublicKey = event.queryStringParameters.publicKey.split(',').map((i) => Number(i));
  const pProof = event.queryStringParameters.proof.split(',').map((i) => Number(i));
  const pNonce = event.queryStringParameters.nonce.split(',').map((i) => Number(i));



  // this block of code is causing errors
  // if (!payload || !pMessages || !pPublicKey || !pProof) {
  //   return {
  //     statusCode: 401,
  //     headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "OPTIONS,POST,GET" },
  //     body: JSON.stringify({ error: 'Missing body request parameters' }),
  //   };
  // }
  const arrMessages = pMessages.map(obj => Uint8Array.from(Object.values(obj)));
  // convert proof into {"0": 64, "1": 123, etc.}

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify(event.queryStringParameters.localVerified),
  }

  // this will always be invalid due to type mismatching (for now)
  const isValid = await blsVerifyProof({ messages: pMessages, publicKey: pPublicKey, proof: pProof, nonce: pNonce });

  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify(isValid.verified),
  };
};
