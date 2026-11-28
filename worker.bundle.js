// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder = new TextEncoder;
var decoder = new TextDecoder;
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var UINT32_RANGE = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0), buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers)
    buf.set(buffer, i), i += buffer.length;
  return buf;
}
var NON_ASCII = /[^\x00-\x7f]/;
function encode(string) {
  if (typeof string == "string" && string.length >= 128) {
    if (NON_ASCII.test(string))
      throw new TypeError("non-ASCII string encountered in encode()");
    return encoder.encode(string);
  }
  const bytes = new Uint8Array(string.length);
  for (let i = 0;i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127)
      throw new TypeError("non-ASCII string encountered in encode()");
    bytes[i] = code;
  }
  return bytes;
}
function decodeBase64(encoded, url = false) {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(encoded, { alphabet: url ? "base64url" : "base64" });
  if (url) {
    if (encoded.includes("+") || encoded.includes("/"))
      throw new TypeError("Invalid base64url");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  }
  const binary = atob(encoded), bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// node_modules/jose/dist/webapi/util/errors.js
class JOSEError extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message, options) {
    super(message, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
}

class JWTClaimValidationFailed extends JOSEError {
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message, payload, claim = "unspecified", reason = "unspecified") {
    super(message, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
}

class JWTExpired extends JOSEError {
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message, payload, claim = "unspecified", reason = "unspecified") {
    super(message, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
}

class JOSEAlgNotAllowed extends JOSEError {
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
}

class JOSENotSupported extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
}
class JWSInvalid extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
}

class JWTInvalid extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
}
class JWKSInvalid extends JOSEError {
  static code = "ERR_JWKS_INVALID";
  code = "ERR_JWKS_INVALID";
}

class JWKSNoMatchingKey extends JOSEError {
  static code = "ERR_JWKS_NO_MATCHING_KEY";
  code = "ERR_JWKS_NO_MATCHING_KEY";
  constructor(message = "no applicable key found in the JSON Web Key Set", options) {
    super(message, options);
  }
}

class JWKSMultipleMatchingKeys extends JOSEError {
  [Symbol.asyncIterator] = async function* () {};
  static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  constructor(message = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message, options);
  }
}

class JWKSTimeout extends JOSEError {
  static code = "ERR_JWKS_TIMEOUT";
  code = "ERR_JWKS_TIMEOUT";
  constructor(message = "request timed out", options) {
    super(message, options);
  }
}

class JWSSignatureVerificationFailed extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message = "signature verification failed", options) {
    super(message, options);
  }
}

// node_modules/jose/dist/webapi/util/base64url.js
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}

// node_modules/jose/dist/webapi/lib/validate.js
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isJwkSet(input) {
  return isObject(input) && Array.isArray(input.keys) && Array.from(input.keys).every(isObject);
}
function isDisjoint(...headers) {
  const parameters = /* @__PURE__ */ new Set;
  for (const header of headers)
    if (header)
      for (const parameter of Object.keys(header)) {
        if (parameters.has(parameter))
          return false;
        parameters.add(parameter);
      }
  return true;
}
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch (cause) {
    throw new ErrorClass(`Failed to base64url decode the ${label}`, { cause });
  }
}
function encodeAsciiMember(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch (cause) {
    throw new ErrorClass(`The ${label} is not a valid base64url string`, { cause });
  }
}
function parseJoseHeader(encodedProtectedHeader, ErrorClass, message) {
  let parsed;
  try {
    parsed = JSON.parse(strictDecoder.decode(decode(encodedProtectedHeader)));
  } catch (cause) {
    throw new ErrorClass(message, { cause });
  }
  if (!isObject(parsed))
    throw new ErrorClass(message);
  return parsed;
}
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s != "string")))
    throw new TypeError(`"${option}" option must be an array of strings`);
  return algorithms === undefined ? undefined : new Set(algorithms);
}
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== undefined && protectedHeader?.crit === undefined)
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!protectedHeader || protectedHeader.crit === undefined)
    return [];
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input != "string" || input.length === 0))
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  const recognized = recognizedOption === undefined ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized))
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === undefined)
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === undefined))
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
  }
  return protectedHeader.crit;
}
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}

// node_modules/jose/dist/webapi/lib/key.js
var tag = (key) => key[Symbol.toStringTag];
var jwkMatchesOp = (entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== undefined) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected)
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
  }
  if (key.kty === "AKP" && key.alg === undefined)
    throw new TypeError('missing "alg" (Algorithm) Parameter value');
  if (key.alg !== undefined && key.alg !== alg)
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp))
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
  }
};
async function prepareKey(entry, key, usage) {
  const { alg, secret } = entry, requiresPrivateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return key;
  let normalized, keyObject;
  if (isObject(key)) {
    if (normalized = normalizeJwk(key), typeof normalized.kty != "string")
      throw invalidKeyType(alg, key, secret);
    if (!(secret ? normalized.kty === "oct" && typeof normalized.k == "string" : normalized.kty !== "oct" && (requiresPrivateKey ? normalized.kty === "AKP" && typeof normalized.priv == "string" || typeof normalized.d == "string" : normalized.d === undefined && normalized.priv === undefined)))
      throw new TypeError(secret ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${requiresPrivateKey ? "private" : "public"} JWK`);
    if (jwkMatchesOp(entry, normalized, usage), normalized.kty === "oct")
      return decode(normalized.k);
    if (!Object.isFrozen(key)) {
      const { key_ops } = key;
      Array.isArray(key_ops) && Object.freeze(key_ops), Object.freeze(key);
    }
  } else {
    if (!isKeyLike(key))
      throw invalidKeyType(alg, key, secret);
    const expectedType = secret ? "secret" : requiresPrivateKey ? "private" : "public";
    if (key.type !== expectedType && (secret || ["secret", "public", "private"].includes(key.type)))
      throw new TypeError(`${tag(key)} instances must be of type "${expectedType}" for the ${alg} algorithm`);
    if (isCryptoKey(key))
      return key;
    if (keyObject = key, keyObject.type === "secret")
      return keyObject.export();
  }
  cache ||= /* @__PURE__ */ new WeakMap;
  const cacheKey = key;
  let cached = cache.get(cacheKey);
  if (cached?.[alg])
    return cached[alg];
  if (cached || cache.set(cacheKey, cached = {}), keyObject && typeof keyObject.toCryptoKey == "function") {
    const isPublic = keyObject.type === "public", crv = nist[keyObject.asymmetricKeyDetails?.namedCurve], params = entry.resolve?.({ crv, asymmetricKeyType: keyObject.asymmetricKeyType }) ?? entry.subtle;
    return cached[alg] = keyObject.toCryptoKey(params, isPublic, entry.usages[isPublic ? 0 : 1]);
  }
  return normalized ??= keyObject.export({ format: "jwk" }), normalized.alg = alg, cached[alg] = await jwkToKey(entry, normalized);
}
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else
    types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name)
    throw unusable(expected.name);
  if (expected.hash && algorithm.hash?.name !== expected.hash)
    throw unusable(expected.hash, "algorithm.hash");
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve)
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  if (expected.length !== undefined && algorithm.length !== expected.length)
    throw unusable(expected.length, "algorithm.length");
  checkUsage(key, usage);
}
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
function normalizeJwk(jwk) {
  const normalized = snapshotJwk(jwk);
  if (normalized.ext !== undefined && typeof normalized.ext != "boolean")
    throw new TypeError('"ext" (Extractable) Parameter must be a boolean');
  if (normalized.key_ops !== undefined) {
    const value = normalized.key_ops, keyOps = Array.isArray(value) ? [...value] : undefined;
    if (!keyOps || keyOps.some((operation) => typeof operation != "string") || new Set(keyOps).size !== keyOps.length)
      throw new TypeError('"key_ops" (Key Operations) Parameter must be an array of unique strings');
    normalized.key_ops = keyOps;
  }
  return normalized;
}
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}

// node_modules/jose/dist/webapi/lib/key_descriptor.js
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}

// node_modules/jose/dist/webapi/lib/jws_algorithms.js
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
function rsa(bits, saltLength) {
  const subtle = { name: saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
function mldsa(parameterSet) {
  const subtle = { name: `ML-DSA-${parameterSet}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
var JWS = table({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = typeof alg == "string" ? JWS[alg] : undefined;
  if (!entry)
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  return entry;
}

// node_modules/jose/dist/webapi/lib/jws_verify.js
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
function parseProtectedHeader(encodedProtectedHeader) {
  return encodedProtectedHeader === undefined ? {} : parseJoseHeader(encodedProtectedHeader, JWSInvalid, "JWS Protected Header is invalid");
}
function encodeCompactUnencodedPayload(payload) {
  try {
    return encode(payload);
  } catch (cause) {
    throw new JWSInvalid("JWS Compact Serialization payload must use only ASCII characters", {
      cause
    });
  }
}
async function verifySignature(jws, shared, key, encodeUnencodedPayload, parsedProtected) {
  const { protected: encodedProtectedHeader, header, payload: inputPayload } = jws, protectedHeader = parsedProtected ?? parseProtectedHeader(encodedProtectedHeader);
  if (!isDisjoint(protectedHeader, header))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...protectedHeader, ...header }, b64 = validateB64(protectedHeader, validateCrit(JWSInvalid, JWS_RECOGNIZED, shared[1], protectedHeader, joseHeader)), { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  if (shared[0] && !shared[0].has(alg))
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  if (b64) {
    if (typeof inputPayload != "string")
      throw new JWSInvalid("JWS Payload must be a string");
  } else if (typeof inputPayload != "string" && !(inputPayload instanceof Uint8Array))
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  const signingPayload = b64 || typeof inputPayload != "string" ? inputPayload : encodeUnencodedPayload(inputPayload);
  let resolvedKey = false;
  typeof key == "function" && (key = await key(protectedHeader, jws), resolvedKey = true);
  const entry = jwsAlgorithm(alg), signingInput = concat(encodedProtectedHeader !== undefined ? encode(encodedProtectedHeader) : new Uint8Array, encode("."), typeof signingPayload == "string" ? shared[2] ??= encodeAsciiMember(signingPayload, "payload", JWSInvalid) : signingPayload), signature = decodeBase64url(jws.signature, "signature", JWSInvalid), verificationKey = await prepareKey(entry, key, "verify"), cryptoKey = await rawKey(verificationKey, entry.subtle, "verify");
  entry.minRsaBits && checkModulusLength(entry.alg, cryptoKey);
  let verified = false;
  try {
    verified = await crypto.subtle.verify(entry.signing, cryptoKey, signature, signingInput);
  } catch (cause) {
    throw new JWSSignatureVerificationFailed(undefined, { cause });
  }
  if (!verified)
    throw new JWSSignatureVerificationFailed;
  const result = { payload: typeof signingPayload == "string" ? decodeBase64url(signingPayload, "payload", JWSInvalid) : signingPayload };
  return encodedProtectedHeader !== undefined && (result.protectedHeader = protectedHeader), header !== undefined && (result.unprotectedHeader = header), resolvedKey ? [{ ...result, key: verificationKey }, b64] : [result, b64];
}
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array && (jws = decoder.decode(jws)), typeof jws != "string")
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3)
    throw new JWSInvalid("Invalid Compact JWS");
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key, encodeCompactUnencodedPayload);
}

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = (date) => Math.floor(date.getTime() / 1000);
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var checkFailed = "check_failed";
function invalidDuration() {
  throw new TypeError("Invalid time period format");
}
function secs(str) {
  typeof str != "string" && invalidDuration();
  const matched = REGEX.exec(str);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), durationSeconds = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(durationSeconds) || invalidDuration(), matched[1] === "-" || matched[4]?.toLowerCase() === "ago" ? -durationSeconds : durationSeconds;
}
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
var normalizeTyp = (value) => {
  const normalized = value.toLowerCase();
  return value.includes("/") ? normalized : `application/${normalized}`;
};
var checkAudiencePresence = (audPayload, audOption) => typeof audPayload == "string" ? audOption.includes(audPayload) : Array.isArray(audPayload) ? audOption.some((aud) => audPayload.includes(aud)) : false;
function validateNumericDate(claimsSet, claim, required = false) {
  const value = claimsSet[claim];
  if (!(value === undefined && !required)) {
    if (typeof value != "number")
      throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, claimsSet, claim, "invalid");
    return value;
  }
}
function unexpectedClaim(claimsSet, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, claimsSet, claim, checkFailed);
}
function validateClaimsSet(protectedHeader, claimsSetBytes, options = {}) {
  let claimsSet;
  try {
    claimsSet = JSON.parse(strictDecoder.decode(claimsSetBytes));
  } catch (cause) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object", { cause });
  }
  if (!isObject(claimsSet))
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  const { typ } = options;
  if (typ !== undefined && (typeof protectedHeader.typ != "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ)))
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', claimsSet, "typ", checkFailed);
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options, presenceCheck = [...requiredClaims];
  maxTokenAge !== undefined && presenceCheck.push("iat"), audience !== undefined && presenceCheck.push("aud"), subject !== undefined && presenceCheck.push("sub"), issuer !== undefined && presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse()))
    if (!Object.hasOwn(claimsSet, claim))
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, claimsSet, claim, "missing");
  issuer !== undefined && !(Array.isArray(issuer) ? issuer : [issuer]).includes(claimsSet.iss) && unexpectedClaim(claimsSet, "iss"), subject !== undefined && claimsSet.sub !== subject && unexpectedClaim(claimsSet, "sub"), audience !== undefined && !checkAudiencePresence(claimsSet.aud, typeof audience == "string" ? [audience] : audience) && unexpectedClaim(claimsSet, "aud");
  const { clockTolerance } = options;
  let tolerance = 0;
  if (typeof clockTolerance == "string")
    tolerance = secs(clockTolerance);
  else if (clockTolerance !== undefined) {
    if (typeof clockTolerance != "number")
      throw new TypeError("Invalid clockTolerance option type");
    tolerance = clockTolerance;
  }
  if (validateInput("clockTolerance option", tolerance), tolerance < 0)
    throw new TypeError("Invalid clockTolerance option input");
  const { currentDate } = options, now = validateInput("currentDate option", epoch(currentDate === undefined ? /* @__PURE__ */ new Date : currentDate)), iat = validateNumericDate(claimsSet, "iat", maxTokenAge !== undefined), nbf = validateNumericDate(claimsSet, "nbf");
  if (nbf !== undefined && nbf > now + tolerance)
    throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', claimsSet, "nbf", checkFailed);
  const exp = validateNumericDate(claimsSet, "exp");
  if (exp !== undefined && exp <= now - tolerance)
    throw new JWTExpired('"exp" claim timestamp check failed', claimsSet, "exp", checkFailed);
  if (maxTokenAge !== undefined) {
    const age = now - iat, max = validateInput("maxTokenAge option", typeof maxTokenAge == "number" ? maxTokenAge : secs(maxTokenAge));
    if (max < 0)
      throw new TypeError("Invalid maxTokenAge option input");
    if (age - tolerance > max)
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', claimsSet, "iat", checkFailed);
    if (age < -tolerance)
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', claimsSet, "iat", checkFailed);
  }
  return claimsSet;
}

// node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const [verified, b64] = await verifyCompact(jwt, prepareVerify(options), key);
  if (!b64)
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  return { ...verified, payload };
}

// node_modules/jose/dist/webapi/jwks/local.js
function isUsableJWK(jwk, entry, alg, kid) {
  const { kty, key_ops: keyOps, ext, kid: jwkKid, alg: jwkAlg, use, crv } = jwk;
  return (ext === undefined || typeof ext == "boolean") && (keyOps === undefined || Array.isArray(keyOps) && keyOps.every((operation, index) => typeof operation == "string" && keyOps.indexOf(operation) === index) && keyOps.includes("verify")) && entry.kty.includes(kty) && (kid === undefined || typeof kid == "string" && kid === jwkKid) && (jwkAlg === undefined ? kty !== "AKP" : alg === jwkAlg) && (use === undefined || use === "sig") && (!entry.crv || crv === entry.crv);
}
async function importWithAlgCache(cache, jwk, entry) {
  const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk), { alg } = entry;
  if (cached[alg] === undefined) {
    const pending = jwkToKey(entry, jwk, true).then((key) => {
      if (key.type !== "public")
        throw new JWKSInvalid("JSON Web Key Set members must be public keys");
      return cached[alg] = key, key;
    }).catch((error) => {
      throw cached[alg] === pending && delete cached[alg], error;
    });
    cached[alg] = pending;
  }
  return cached[alg];
}
function createLocalJWKSet(jwks) {
  let snapshot;
  try {
    snapshot = structuredClone(jwks);
  } catch (cause) {
    throw new JWKSInvalid("JSON Web Key Set malformed", { cause });
  }
  if (!isJwkSet(snapshot))
    throw new JWKSInvalid("JSON Web Key Set malformed");
  const metadata = snapshot.keys.map((jwk) => {
    const normalized = snapshotJwk(jwk);
    return Array.isArray(normalized.key_ops) && (normalized.key_ops = [...normalized.key_ops]), normalized;
  }), cached = /* @__PURE__ */ new WeakMap;
  return Object.defineProperty(async (protectedHeader, token) => {
    const { alg, kid } = { ...protectedHeader, ...token?.header }, entry = typeof alg == "string" ? JWS[alg] : undefined;
    if (!entry || entry.secret)
      throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    const candidates = snapshot.keys.filter((_, index) => isUsableJWK(metadata[index], entry, alg, kid)), { 0: jwk, length } = candidates;
    if (!length)
      throw new JWKSNoMatchingKey;
    if (length !== 1) {
      const error = new JWKSMultipleMatchingKeys;
      throw error[Symbol.asyncIterator] = async function* () {
        for (const jwk2 of candidates)
          try {
            yield await importWithAlgCache(cached, jwk2, entry);
          } catch {}
      }, error;
    }
    return importWithAlgCache(cached, jwk, entry);
  }, "jwks", {
    value: () => structuredClone(snapshot)
  });
}

// node_modules/jose/dist/webapi/jwks/remote.js
function isCloudflareWorkers() {
  return typeof WebSocketPair < "u" || typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime < "u" && EdgeRuntime === "vercel";
}
var USER_AGENT;
(typeof navigator > "u" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (USER_AGENT = "jose/v6.2.18");
var customFetch = /* @__PURE__ */ Symbol();
async function fetchJwks(url, headers, signal, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "GET",
    signal,
    redirect: "manual",
    headers
  }).catch((err) => {
    throw err.name === "TimeoutError" ? new JWKSTimeout(undefined, { cause: err }) : err;
  });
  if (response.status !== 200)
    throw new JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
  try {
    return await response.json();
  } catch (cause) {
    throw signal.aborted ? new JWKSTimeout(undefined, { cause }) : new JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON", { cause });
  }
}
var jwksCache = /* @__PURE__ */ Symbol();
function isFreshFor(timestamp, duration) {
  return Number.isFinite(timestamp) && Date.now() < timestamp + duration;
}
function validateDuration(value, fallback, option) {
  if (Number.isNaN(value))
    throw new TypeError(`"${option}" option must not be NaN`);
  if (typeof value == "number" && value < 0)
    throw new TypeError(`"${option}" option must not be negative`);
  return typeof value == "number" ? value : fallback;
}
function createRemoteJWKSet(url, options) {
  if (!(url instanceof URL))
    throw new TypeError("url must be an instance of URL");
  const href = new URL(url.href).href, opts = options ?? {}, timeoutOption = opts.timeoutDuration;
  if (typeof timeoutOption == "number" && (!Number.isInteger(timeoutOption) || timeoutOption < 0))
    throw new TypeError('"timeoutDuration" option must be a non-negative integer');
  const timeoutDuration = typeof timeoutOption == "number" ? timeoutOption : 5000, cooldownDuration = validateDuration(opts.cooldownDuration, 30000, "cooldownDuration"), cacheMaxAge = validateDuration(opts.cacheMaxAge, 600000, "cacheMaxAge"), headers = new Headers(opts.headers);
  USER_AGENT && !headers.has("User-Agent") && headers.set("User-Agent", USER_AGENT), headers.has("accept") || headers.set("accept", "application/json, application/jwk-set+json");
  const fetchImpl = opts[customFetch], cache = opts[jwksCache];
  let jwksTimestamp, pendingFetch, reloadSequence = 0, appliedSequence = 0, local;
  if (cache && typeof cache == "object") {
    const { uat, jwks } = cache;
    isFreshFor(uat, cacheMaxAge) && isJwkSet(jwks) && (jwksTimestamp = uat, local = createLocalJWKSet(jwks));
  }
  const reload = async () => {
    if (pendingFetch && isCloudflareWorkers() && (pendingFetch = undefined), !pendingFetch) {
      const sequence = ++reloadSequence, current = pendingFetch = fetchJwks(href, headers, AbortSignal.timeout(timeoutDuration), fetchImpl).then((json) => {
        const next = createLocalJWKSet(json);
        if (sequence <= appliedSequence)
          return;
        local = next;
        const updatedAt = Date.now();
        cache && (cache.uat = updatedAt, cache.jwks = json), jwksTimestamp = updatedAt, appliedSequence = sequence;
      }).finally(() => {
        pendingFetch === current && (pendingFetch = undefined);
      });
    }
    await pendingFetch;
  };
  return Object.defineProperties(async (protectedHeader, token) => {
    (!local || !isFreshFor(jwksTimestamp, cacheMaxAge)) && await reload();
    try {
      return await local(protectedHeader, token);
    } catch (err) {
      if (err instanceof JWKSNoMatchingKey && !isFreshFor(jwksTimestamp, cooldownDuration))
        return await reload(), local(protectedHeader, token);
      throw err;
    }
  }, {
    coolingDown: {
      get: () => isFreshFor(jwksTimestamp, cooldownDuration),
      enumerable: true
    },
    fresh: {
      get: () => isFreshFor(jwksTimestamp, cacheMaxAge),
      enumerable: true
    },
    reload: {
      value: reload,
      enumerable: true
    },
    reloading: {
      get: () => !!pendingFetch,
      enumerable: true
    },
    jwks: {
      value: () => local?.jwks(),
      enumerable: true
    }
  });
}

// node_modules/@freebuff/auth/dist/index.js
var DEFAULT_ISSUER = "https://freebuff.com/oidc";
var AUTH_ROUTE_PREFIX = "/auth/freebuff";
var TRANSACTION_TTL = 600;
var SESSION_COOKIE_TTL = 30 * 86400;
var REFRESH_SKEW_SECONDS = 30;
var MAX_COOKIE_LENGTH = 4000;
var FETCH_TIMEOUT_MS = 8000;
var LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
var ALL_SCOPES = ["openid", "email", "profile"];
var PROMPTS = new Set(["login", "consent", "select_account"]);
var NO_STORE = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
};
function checkedUrl(value, allowLoopback, what) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${what} must be an absolute URL.`);
  }
  const loopbackHttp = allowLoopback && LOOPBACK.has(url.hostname) && url.protocol === "http:";
  if (url.protocol !== "https:" && !loopbackHttp || url.username || url.password || url.search || url.hash) {
    throw new Error(`${what} must be an https URL without credentials, query or fragment (http is allowed only for localhost with allowInsecureLocalhost).`);
  }
  return url;
}
function base64url(bytes) {
  let binary = "";
  for (const byte of bytes)
    binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomToken() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
async function pkceChallenge(verifier) {
  const bytes = new TextEncoder().encode(verifier);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)));
}
function isSameOriginRequest(request, origin) {
  const header = request.headers.get("origin");
  if (header && header !== "null")
    return header === origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}
function timingSafeEqual(left, right) {
  if (left.length !== right.length)
    return false;
  let diff = 0;
  for (let i = 0;i < left.length; i++)
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}
function readCookie(header, name) {
  const values = (header ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (values.length !== 1)
    return null;
  const value = values[0].slice(name.length + 1);
  return value && value.length <= MAX_COOKIE_LENGTH ? value : null;
}
function safeReturnTo(value) {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) {
    return "/";
  }
  const base = "https://return-to.invalid";
  let url;
  try {
    url = new URL(value, base);
  } catch {
    return "/";
  }
  if (url.origin !== base || url.pathname === AUTH_ROUTE_PREFIX || url.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)) {
    return "/";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
function userFrom(claims, scopes) {
  if (typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 255)
    return null;
  const user = { sub: claims.sub };
  if (scopes.includes("email")) {
    if (typeof claims.email === "string" && claims.email.length <= 320)
      user.email = claims.email;
    if (typeof claims.email_verified === "boolean")
      user.email_verified = claims.email_verified;
  }
  if (scopes.includes("profile")) {
    if (typeof claims.name === "string" && claims.name.length <= 200)
      user.name = claims.name;
    if (typeof claims.picture === "string" && claims.picture.startsWith("https://") && claims.picture.length <= 1024) {
      user.picture = claims.picture;
    }
  }
  return user;
}
function json(body, status = 200, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "application/json; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}
function redirect(location, cookies = []) {
  const headers = new Headers({ ...NO_STORE, Location: location });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}
function problem(status, message, cookies = []) {
  const headers = new Headers({ ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" });
  for (const cookie of cookies)
    headers.append("Set-Cookie", cookie);
  return new Response(message, { status, headers });
}
async function readJson(response) {
  const text = await response.text();
  if (text.length > 65536)
    throw new Error("Freebuff response too large");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected Freebuff response");
  return value;
}
function createFreebuffAuth(options) {
  const allowLoopback = options.allowInsecureLocalhost === true;
  const issuer = (options.issuer ?? DEFAULT_ISSUER).replace(/\/$/, "");
  const issuerUrl = checkedUrl(issuer, allowLoopback, "issuer");
  const base = checkedUrl(options.baseUrl, allowLoopback, "baseUrl");
  if (base.pathname !== "/")
    throw new Error("baseUrl must be an origin, without a path.");
  const origin = base.origin;
  const clientId = options.clientId;
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(clientId ?? "")) {
    throw new Error("clientId is missing or malformed; use the ID from Freebuff provisioning.");
  }
  const scopes = ALL_SCOPES.filter((scope) => scope === "openid" || (options.scopes ?? ALL_SCOPES).includes(scope));
  const now = options.now ?? Date.now;
  const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const secure = base.protocol === "https:";
  const cookiePrefix = secure ? "__Host-" : "";
  const sessionCookie = `${cookiePrefix}freebuff_session`;
  const transactionCookie = (state) => `${cookiePrefix}freebuff_txn-${state.slice(0, 16)}`;
  const callbackUrl = `${origin}${AUTH_ROUTE_PREFIX}/callback`;
  const setCookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
  const clearCookie = (name) => setCookie(name, "", 0);
  const sessionCookieFor = (session) => {
    const value = `v1~${session.accessToken}~${session.refreshToken}`;
    if (value.length > MAX_COOKIE_LENGTH)
      throw new Error("Freebuff session is too large for a cookie");
    return setCookie(sessionCookie, value, SESSION_COOKIE_TTL);
  };
  async function freebuffFetch(input, init = {}) {
    const response = await fetcher(input, {
      ...init,
      redirect: "manual",
      credentials: "omit",
      signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw new Error("Freebuff endpoint returned a redirect");
    }
    return response;
  }
  let discovery;
  function endpoints() {
    discovery ??= (async () => {
      const response = await freebuffFetch(`${issuer}/.well-known/openid-configuration`, {
        headers: { accept: "application/json" }
      });
      if (!response.ok)
        throw new Error(`Freebuff discovery failed: ${response.status}`);
      const document = await readJson(response);
      if (document.issuer !== issuer)
        throw new Error("Freebuff discovery named a different issuer");
      const endpoint = (name, required = true) => {
        const value = document[name];
        if (typeof value !== "string") {
          if (required)
            throw new Error(`Freebuff discovery is missing ${name}`);
          return null;
        }
        const url = checkedUrl(value, allowLoopback, name);
        if (url.origin !== issuerUrl.origin)
          throw new Error(`Freebuff ${name} left the issuer origin`);
        return url.href;
      };
      return {
        authorization: endpoint("authorization_endpoint"),
        token: endpoint("token_endpoint"),
        revocation: endpoint("revocation_endpoint", false),
        keys: createRemoteJWKSet(new URL(endpoint("jwks_uri")), {
          [customFetch]: (url, init) => freebuffFetch(url, init),
          timeoutDuration: FETCH_TIMEOUT_MS
        })
      };
    })().catch((error) => {
      discovery = undefined;
      throw error;
    });
    return discovery;
  }
  function readSession(request) {
    const value = readCookie(request.headers.get("cookie"), sessionCookie);
    const match = value ? /^v1~([A-Za-z0-9._-]+)~(fbrt_[A-Za-z0-9_-]+)$/.exec(value) : null;
    return match ? { accessToken: match[1], refreshToken: match[2] } : null;
  }
  async function verifyAccessToken(token) {
    try {
      const { payload } = await jwtVerify(token, (await endpoints()).keys, {
        issuer,
        audience: clientId,
        algorithms: ["RS256"],
        typ: "at+jwt",
        requiredClaims: ["sub", "exp", "iat", "client_id"],
        clockTolerance: 5,
        currentDate: new Date(now())
      });
      if (payload.client_id !== clientId)
        return null;
      const user = userFrom(payload, scopes);
      if (!user)
        return null;
      if (payload.exp <= Math.floor(now() / 1000) + REFRESH_SKEW_SECONDS)
        return "expired";
      return { user, expiresAt: payload.exp };
    } catch (error) {
      return error instanceof JWTExpired ? "expired" : null;
    }
  }
  async function refresh(refreshToken) {
    let response;
    try {
      response = await freebuffFetch((await endpoints()).token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: refreshToken })
      });
    } catch {
      return "unavailable";
    }
    const body = await readJson(response).catch(() => null);
    if (!response.ok) {
      return body?.error === "invalid_grant" || body?.error === "invalid_client" ? "invalid" : "unavailable";
    }
    if (typeof body?.access_token !== "string" || typeof body.refresh_token !== "string")
      return "unavailable";
    const verified = await verifyAccessToken(body.access_token);
    if (!verified || verified === "expired")
      return "unavailable";
    return { accessToken: body.access_token, refreshToken: body.refresh_token, user: verified.user };
  }
  async function authenticate(request) {
    const session = readSession(request);
    if (!session)
      return { user: null, cookies: [] };
    const verified = await verifyAccessToken(session.accessToken);
    if (verified && verified !== "expired")
      return { user: verified.user, cookies: [] };
    if (verified === null) {
      return { user: null, cookies: [] };
    }
    const refreshed = await refresh(session.refreshToken);
    if (refreshed === "invalid")
      return { user: null, cookies: [clearCookie(sessionCookie)] };
    if (refreshed === "unavailable")
      return { user: null, cookies: [] };
    return { user: refreshed.user, cookies: [sessionCookieFor(refreshed)] };
  }
  const contexts = new WeakMap;
  async function getUser(request) {
    const context = contexts.get(request);
    if (context) {
      context.result ??= authenticate(request);
      return (await context.result).user;
    }
    const session = readSession(request);
    if (!session)
      return null;
    const verified = await verifyAccessToken(session.accessToken);
    return verified && verified !== "expired" ? verified.user : null;
  }
  async function signIn(url) {
    let authorization;
    try {
      authorization = (await endpoints()).authorization;
    } catch {
      return problem(503, "Sign in with Freebuff is temporarily unavailable. Please try again.");
    }
    const state = randomToken();
    const nonce = randomToken();
    const verifier = randomToken();
    const target = new URL(authorization);
    target.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: scopes.join(" "),
      state,
      nonce,
      code_challenge: await pkceChallenge(verifier),
      code_challenge_method: "S256"
    }).toString();
    const prompt = url.searchParams.get("prompt");
    if (prompt && PROMPTS.has(prompt))
      target.searchParams.set("prompt", prompt);
    const transaction = base64url(new TextEncoder().encode(JSON.stringify({ s: state, n: nonce, v: verifier, r: safeReturnTo(url.searchParams.get("returnTo")) })));
    return redirect(target.href, [setCookie(transactionCookie(state), transaction, TRANSACTION_TTL)]);
  }
  function readTransaction(request, state) {
    const raw = readCookie(request.headers.get("cookie"), transactionCookie(state));
    if (!raw)
      return null;
    try {
      const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))));
      if (typeof decoded.s !== "string" || typeof decoded.n !== "string" || typeof decoded.v !== "string" || !timingSafeEqual(decoded.s, state)) {
        return null;
      }
      return { nonce: decoded.n, verifier: decoded.v, returnTo: safeReturnTo(typeof decoded.r === "string" ? decoded.r : "/") };
    } catch {
      return null;
    }
  }
  async function callback(request, url) {
    const params = url.searchParams;
    const state = params.get("state") ?? "";
    if (!/^[A-Za-z0-9_-]{43}$/.test(state) || [...params.keys()].some((key) => params.getAll(key).length > 1)) {
      return problem(400, "This sign-in link is invalid. Please sign in again.");
    }
    const transaction = readTransaction(request, state);
    const clearTransaction = clearCookie(transactionCookie(state));
    if (!transaction) {
      return problem(400, "This sign-in expired or was started in another browser. Please sign in again.", [clearTransaction]);
    }
    if (params.get("iss") !== issuer) {
      return problem(400, "Sign-in response came from an unexpected issuer.", [clearTransaction]);
    }
    const error = params.get("error");
    if (error) {
      if (error === "access_denied")
        return redirect(transaction.returnTo, [clearTransaction]);
      return problem(400, "Sign in with Freebuff did not complete. Please try again.", [clearTransaction]);
    }
    const code = params.get("code");
    if (!code || code.length > 512) {
      return problem(400, "This sign-in link is invalid. Please sign in again.", [clearTransaction]);
    }
    try {
      const { token, keys } = await endpoints();
      const response = await freebuffFetch(token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          redirect_uri: callbackUrl,
          code_verifier: transaction.verifier
        })
      });
      const tokens = await readJson(response);
      if (!response.ok || typeof tokens.id_token !== "string" || typeof tokens.access_token !== "string" || typeof tokens.refresh_token !== "string") {
        throw new Error("token exchange failed");
      }
      const { payload } = await jwtVerify(tokens.id_token, keys, {
        issuer,
        audience: clientId,
        algorithms: ["RS256"],
        requiredClaims: ["sub", "exp", "iat", "nonce"],
        maxTokenAge: TRANSACTION_TTL,
        clockTolerance: 5,
        currentDate: new Date(now())
      });
      if (typeof payload.nonce !== "string" || !timingSafeEqual(payload.nonce, transaction.nonce) || payload.azp !== undefined && payload.azp !== clientId) {
        throw new Error("ID token is not bound to this sign-in");
      }
      const access = await verifyAccessToken(tokens.access_token);
      if (!access || access === "expired" || access.user.sub !== payload.sub) {
        throw new Error("access token does not match the ID token");
      }
      return redirect(transaction.returnTo, [
        sessionCookieFor({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
        clearTransaction
      ]);
    } catch {
      return problem(400, "Sign in with Freebuff could not be completed. Please try again.", [clearTransaction]);
    }
  }
  async function signOut(request, url) {
    if (!isSameOriginRequest(request, origin)) {
      return problem(403, "Sign-out must be submitted from this site.");
    }
    const session = readSession(request);
    if (session) {
      try {
        const { revocation } = await endpoints();
        if (revocation) {
          await freebuffFetch(revocation, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: clientId, token: session.refreshToken, token_type_hint: "refresh_token" })
          });
        }
      } catch {}
    }
    let returnTo = url.searchParams.get("returnTo");
    const type = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!returnTo && type === "application/x-www-form-urlencoded") {
      const text = await request.text().catch(() => "");
      if (text.length <= 4096)
        returnTo = new URLSearchParams(text).get("returnTo");
    }
    return redirect(safeReturnTo(returnTo), [clearCookie(sessionCookie)]);
  }
  async function handle(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`))
      return null;
    const route = url.pathname.slice(AUTH_ROUTE_PREFIX.length);
    const method = request.method;
    switch (route) {
      case "/signin":
        return method === "GET" ? signIn(url) : problem(405, "Use GET.");
      case "/callback":
        return method === "GET" ? callback(request, url) : problem(405, "Use GET.");
      case "/signout":
        return method === "POST" ? signOut(request, url) : problem(405, "Use POST.");
      case "/session": {
        if (method !== "GET")
          return problem(405, "Use GET.");
        const { user, cookies } = await authenticate(request);
        return json({ user }, 200, cookies);
      }
      default:
        return null;
    }
  }
  function wrap(handler) {
    return async (request, ...rest) => {
      const own = await handle(request);
      if (own)
        return own;
      const context = {};
      contexts.set(request, context);
      const response = await handler(request, ...rest);
      const cookies = context.result ? (await context.result).cookies : [];
      if (cookies.length === 0 || response.status === 101)
        return response;
      const headers = new Headers(response.headers);
      for (const cookie of cookies)
        headers.append("Set-Cookie", cookie);
      headers.set("Cache-Control", "private, no-store");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    };
  }
  return { issuer, clientId, handle, authenticate, getUser, wrap };
}

// node_modules/uint8array-extras/index.js
var objectToString = Object.prototype.toString;
var uint8ArrayStringified = "[object Uint8Array]";
var arrayBufferStringified = "[object ArrayBuffer]";
function isType(value, typeConstructor, typeStringified) {
  if (!value) {
    return false;
  }
  if (value.constructor === typeConstructor) {
    return true;
  }
  return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
  return isType(value, Uint8Array, uint8ArrayStringified);
}
function isArrayBuffer(value) {
  return isType(value, ArrayBuffer, arrayBufferStringified);
}
function isUint8ArrayOrArrayBuffer(value) {
  return isUint8Array(value) || isArrayBuffer(value);
}
function toUint8ArrayIfArrayBuffer(value) {
  return isArrayBuffer(value) ? new Uint8Array(value) : value;
}
function assertUint8ArrayOrArrayBuffer(value) {
  if (!isUint8ArrayOrArrayBuffer(value)) {
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
  }
}
function toUint8Array(value) {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  throw new TypeError(`Unsupported value, got \`${typeof value}\`.`);
}
function concatUint8Arrays(arrays, totalLength) {
  if (arrays.length === 0) {
    return new Uint8Array(0);
  }
  totalLength ??= arrays.reduce((accumulator, currentValue) => accumulator + currentValue.byteLength, 0);
  const returnValue = new Uint8Array(totalLength);
  let offset = 0;
  for (let array of arrays) {
    assertUint8ArrayOrArrayBuffer(array);
    array = toUint8ArrayIfArrayBuffer(array);
    returnValue.set(array, offset);
    offset += array.length;
  }
  return returnValue;
}
var cachedDecoders = {
  utf8: new globalThis.TextDecoder("utf8")
};
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
  }
}
var cachedEncoder = new globalThis.TextEncoder;
function stringToUint8Array(string) {
  assertString(string);
  return cachedEncoder.encode(string);
}
function base64ToBase64Url(base64) {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function base64UrlToBase64(base64url) {
  const base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
  const padding = (4 - base64.length % 4) % 4;
  return base64 + "=".repeat(padding);
}
var MAX_BLOCK_SIZE = 65535;
function uint8ArrayToBase64(array, { urlSafe = false } = {}) {
  assertUint8ArrayOrArrayBuffer(array);
  array = toUint8ArrayIfArrayBuffer(array);
  let base64 = "";
  for (let index = 0;index < array.length; index += MAX_BLOCK_SIZE) {
    const chunk = array.subarray(index, index + MAX_BLOCK_SIZE);
    base64 += globalThis.btoa(String.fromCodePoint.apply(undefined, chunk));
  }
  return urlSafe ? base64ToBase64Url(base64) : base64;
}
function base64ToUint8Array(base64String) {
  assertString(base64String);
  return Uint8Array.from(globalThis.atob(base64UrlToBase64(base64String)), (x) => x.codePointAt(0));
}
var byteToHexLookupTable = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));

// node_modules/@block65/webcrypto-web-push/dist/lib/utils.js
function encodeRecordSize(size) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, size);
  return bytes;
}
function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// node_modules/@block65/webcrypto-web-push/dist/lib/client-keys.js
async function deriveClientKeys(sub) {
  const bytes = base64ToUint8Array(sub.keys.p256dh);
  const authSecretBytes = base64ToUint8Array(sub.keys.auth);
  invariant(bytes.byteLength === 65 && bytes[0] === 4, "Subscription p256dh is not an uncompressed P-256 point");
  invariant(authSecretBytes.byteLength === 16, "Subscription auth secret is not 16 bytes");
  return {
    publicKeyBytes: bytes,
    publicKey: await crypto.subtle.importKey("raw", bytes, {
      name: "ECDH",
      namedCurve: "P-256"
    }, false, []),
    authSecretBytes
  };
}

// node_modules/@block65/webcrypto-web-push/dist/lib/hkdf.js
function createHMAC(data) {
  const keyPromise = crypto.subtle.importKey("raw", data, {
    name: "HMAC",
    hash: "SHA-256"
  }, false, ["sign"]);
  return {
    hash: async (input) => {
      const k = await keyPromise;
      return crypto.subtle.sign("HMAC", k, input);
    }
  };
}
async function hkdf(salt, ikm) {
  const prkhPromise = createHMAC(salt).hash(ikm).then((prk) => createHMAC(prk));
  return {
    extract: async (info, len) => {
      const prkh = await prkhPromise;
      const blocks = await Array.from({ length: Math.ceil(len / 32) }, (_, i) => i).reduce(async (acc, i) => {
        const previous = await acc;
        const hash = await prkh.hash(new Uint8Array([...previous.at(-1) ?? [], ...info, i + 1]));
        return [...previous, new Uint8Array(hash)];
      }, Promise.resolve([]));
      return concatUint8Arrays(blocks).slice(0, len);
    }
  };
}

// node_modules/@block65/webcrypto-web-push/dist/lib/info.js
function createKeyInfo(clientPublic, serverPublic) {
  return new Uint8Array([
    ...stringToUint8Array("WebPush: info\x00"),
    ...clientPublic,
    ...serverPublic
  ]);
}
function createInfo(type) {
  return stringToUint8Array(`Content-Encoding: ${type}\x00`);
}

// node_modules/@block65/webcrypto-web-push/dist/lib/local-keys.js
async function generateLocalKeys() {
  const keyPair = await crypto.subtle.generateKey({
    name: "ECDH",
    namedCurve: "P-256"
  }, false, ["deriveBits"]);
  return {
    privateKey: keyPair.privateKey,
    publicKeyBytes: new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey))
  };
}

// node_modules/@block65/webcrypto-web-push/dist/lib/salt.js
async function getSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

// node_modules/@block65/webcrypto-web-push/dist/lib/encrypt.js
var recordSize = 4096;
var headerSize = 21 + 65;
var maxPlaintextSize = recordSize - headerSize - 17;
async function encryptNotification(subscription, plaintext, options = {}) {
  invariant(plaintext.byteLength <= maxPlaintextSize, `Payload is ${plaintext.byteLength} bytes, the maximum is ${maxPlaintextSize}`);
  const clientKeys = await deriveClientKeys(subscription);
  const salt = await getSalt();
  const localKeys = await generateLocalKeys();
  const sharedSecret = await crypto.subtle.deriveBits({
    name: "ECDH",
    public: clientKeys.publicKey
  }, localKeys.privateKey, 256);
  const keyInfo = createKeyInfo(clientKeys.publicKeyBytes, localKeys.publicKeyBytes);
  const cekInfo = createInfo("aes128gcm");
  const nonceInfo = createInfo("nonce");
  const ikmHkdf = await hkdf(clientKeys.authSecretBytes, sharedSecret);
  const ikm = await ikmHkdf.extract(keyInfo, 32);
  const messageHkdf = await hkdf(salt, ikm);
  const cekBytes = await messageHkdf.extract(cekInfo, 16);
  const nonceBytes = await messageHkdf.extract(nonceInfo, 12);
  const cekCryptoKey = await crypto.subtle.importKey("raw", cekBytes, {
    name: "AES-GCM",
    length: 128
  }, false, ["encrypt"]);
  const padTo = options.pad ?? true ? maxPlaintextSize : plaintext.byteLength;
  const padded = new Uint8Array(padTo + 1);
  padded.set(plaintext);
  padded[plaintext.byteLength] = 2;
  const encrypted = await crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: nonceBytes
  }, cekCryptoKey, padded);
  return new Uint8Array([
    ...salt,
    ...encodeRecordSize(recordSize),
    localKeys.publicKeyBytes.byteLength,
    ...localKeys.publicKeyBytes,
    ...new Uint8Array(encrypted)
  ]);
}
// node_modules/@block65/webcrypto-web-push/dist/lib/base64.js
function encodeBase64Url(value) {
  return uint8ArrayToBase64(toUint8Array(value), { urlSafe: true });
}
function objectToBase64Url(obj) {
  return encodeBase64Url(stringToUint8Array(JSON.stringify(obj)));
}

// node_modules/@block65/webcrypto-web-push/dist/lib/jwt.js
async function sign(payload, key) {
  const headerStr = objectToBase64Url({
    typ: "JWT",
    alg: "ES256"
  });
  const payloadStr = objectToBase64Url({
    iat: Math.floor(Date.now() / 1000),
    ...payload
  });
  const dataStr = `${headerStr}.${payloadStr}`;
  const signature = await crypto.subtle.sign({
    name: "ECDSA",
    hash: "SHA-256"
  }, key, stringToUint8Array(dataStr));
  return `${dataStr}.${encodeBase64Url(signature)}`;
}

// node_modules/@block65/webcrypto-web-push/dist/lib/vapid.js
async function vapidHeaders(subscription, vapid) {
  invariant(vapid.subject, "Vapid subject is empty");
  invariant(vapid.privateKey, "Vapid private key is empty");
  invariant(vapid.publicKey, "Vapid public key is empty");
  const endpoint = new URL(subscription.endpoint);
  invariant(endpoint.protocol === "https:", `Subscription endpoint is not https: ${endpoint.protocol}`);
  const vapidPublicKeyBytes = base64ToUint8Array(vapid.publicKey);
  const publicKey = await crypto.subtle.importKey("jwk", {
    kty: "EC",
    crv: "P-256",
    x: encodeBase64Url(vapidPublicKeyBytes.slice(1, 33)),
    y: encodeBase64Url(vapidPublicKeyBytes.slice(33, 65)),
    d: vapid.privateKey
  }, {
    name: "ECDSA",
    namedCurve: "P-256"
  }, false, ["sign"]);
  const jwt = await sign({
    aud: endpoint.origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: vapid.subject
  }, publicKey);
  return {
    headers: {
      authorization: `vapid t=${jwt}, k=${vapid.publicKey}`
    }
  };
}
// node_modules/@block65/webcrypto-web-push/dist/lib/payload.js
async function buildPushPayload(message, subscription, vapid) {
  const { headers } = await vapidHeaders(subscription, vapid);
  const body = await encryptNotification(subscription, stringToUint8Array(typeof message.data === "string" || typeof message.data === "number" ? message.data.toString() : JSON.stringify(message.data)));
  return {
    headers: {
      ...headers,
      ttl: (message.options?.ttl || 60).toString(),
      ...message.options?.urgency && {
        urgency: message.options.urgency
      },
      ...message.options?.topic && {
        topic: message.options.topic
      },
      "content-encoding": "aes128gcm",
      "content-length": body.byteLength.toString(),
      "content-type": "application/octet-stream"
    },
    method: "post",
    body
  };
}
// worker.js
var GOOGLE_CLIENT_ID = "129549290403-62sdrnpefi8o12v2p1e22sutogl8pgiv.apps.googleusercontent.com";
var SESSION_DAYS = 30;
var auth;
var app;
var dbReady;
var jwks = { keys: [], exp: 0 };
function setup(env) {
  auth ??= createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN
  });
  const a = auth;
  app ??= a.wrap(async (request, env) => {
    const url = new URL(request.url);
    if (request.method === "POST" && Number(request.headers.get("content-length") || 0) > 262144) {
      return harden(json2({ error: "too-large" }, 413), request, url);
    }
    const res = url.pathname.startsWith("/api/") ? await api(request, env, a) : await serve(request, env, url);
    return harden(res, request, url);
  });
  return app;
}
var CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self' https://freebuff.site https://*.freebuff.site",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://connect.facebook.net https://www.gstatic.com https://static.cloudflareinsights.com",
  "connect-src 'self' https:",
  "frame-src https://accounts.google.com https://connect.facebook.net"
].join("; ");
function harden(res, request, url) {
  try {
    const h = new Headers(res.headers);
    h.set("x-content-type-options", "nosniff");
    h.set("referrer-policy", "strict-origin-when-cross-origin");
    h.set("permissions-policy", "geolocation=(), camera=(), microphone=(), payment=()");
    if (!h.has("content-security-policy"))
      h.set("content-security-policy", CSP);
    if (url.pathname.startsWith("/api/"))
      h.set("x-robots-tag", "noindex");
    if (url.protocol === "https:")
      h.set("strict-transport-security", "max-age=15552000; includeSubDomains");
    if (request.method === "HEAD" || res.status === 204 || res.status === 304 || !res.body) {
      return new Response(null, { status: res.status, statusText: res.statusText, headers: h });
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  } catch (e) {
    return res;
  }
}
var rlHits = new Map;
function throttled(key, max, windowMs) {
  const now = Date.now();
  const arr = (rlHits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    rlHits.set(key, arr);
    return true;
  }
  arr.push(now);
  rlHits.set(key, arr);
  if (rlHits.size > 3000)
    rlHits.clear();
  return false;
}
var clientIp = (req) => (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
var json2 = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
});
var getCookie = (req, name) => {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name)
      return decodeURIComponent(v.join("="));
  }
  return null;
};
var sha256hex = async (s) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
async function timingSafeEqual2(a, b) {
  const [x, y] = await Promise.all([sha256hex(String(a || "")), sha256hex(String(b || ""))]);
  let d = 0;
  for (let i = 0;i < x.length; i++)
    d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}
var b64urlToBytes = (s) => {
  const t = String(s).replace(/-/g, "+").replace(/_/g, "/");
  const pad = t.length % 4 ? "=".repeat(4 - t.length % 4) : "";
  return Uint8Array.from(atob(t + pad), (c) => c.charCodeAt(0));
};
async function googleKeys() {
  if (Date.now() < jwks.exp && jwks.keys.length)
    return jwks.keys;
  const r = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!r.ok)
    throw new Error("jwks");
  const j = await r.json();
  jwks = { keys: j.keys || [], exp: Date.now() + 3600 * 1000 };
  return jwks.keys;
}
async function verifyGoogle(token, clientId) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3)
    throw new Error("bad-token");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  if (header.alg !== "RS256")
    throw new Error("bad-alg");
  const keys = await googleKeys();
  const jwk = keys.find((k) => k.kid === header.kid) || keys[0];
  if (!jwk)
    throw new Error("no-key");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok)
    throw new Error("bad-signature");
  const now = Math.floor(Date.now() / 1000);
  if (!(payload.exp > now))
    throw new Error("expired");
  if (payload.aud !== clientId)
    throw new Error("bad-aud");
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss))
    throw new Error("bad-iss");
  if (!payload.sub)
    throw new Error("no-sub");
  return payload;
}
async function ensureDb(env) {
  if (!dbReady) {
    dbReady = (async () => {
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS profiles (sub TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, sub TEXT NOT NULL, name TEXT, email TEXT, picture TEXT, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS push_subs (sub TEXT PRIMARY KEY, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, teams TEXT, names TEXT, comps TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)").run();
      try {
        await env.DB.prepare("ALTER TABLE push_subs ADD COLUMN prefs TEXT").run();
      } catch (e) {}
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS push_sent (sub TEXT NOT NULL, k TEXT NOT NULL, sent_at INTEGER NOT NULL, PRIMARY KEY (sub, k))").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS kv_meta (k TEXT PRIMARY KEY, v TEXT)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, game TEXT NOT NULL, host TEXT NOT NULL, state TEXT NOT NULL, version INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS room_players (code TEXT NOT NULL, sub TEXT NOT NULL, name TEXT, picture TEXT, seat INTEGER NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (code, sub))").run();
    })().catch((e) => {
      dbReady = null;
      throw e;
    });
  }
  return dbReady;
}
var publicUser = (u) => ({ sub: u.sub, name: u.name || "", email: u.email || "", picture: u.picture || "", via: u.via || "" });
async function resolveUser(request, env, a) {
  try {
    const fb = await a.getUser(request);
    if (fb && fb.sub)
      return { sub: fb.sub, name: fb.name, email: fb.email, picture: fb.picture, via: "freebuff" };
  } catch (e) {}
  const sid = getCookie(request, "snaces_sid");
  if (!sid)
    return null;
  await ensureDb(env);
  const tokenHash = await sha256hex(sid);
  const row = await env.DB.prepare("SELECT * FROM sessions WHERE token_hash = ?").bind(tokenHash).first();
  if (!row)
    return null;
  if (row.expires_at < Date.now()) {
    try {
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    } catch (e) {}
    return null;
  }
  return { sub: row.sub, name: row.name, email: row.email, picture: row.picture, via: "google" };
}
var safeArr = (s) => {
  try {
    const a = JSON.parse(s || "[]");
    return Array.isArray(a) ? a : [];
  } catch (e) {
    return [];
  }
};
var safeObj = (s) => {
  try {
    const o = JSON.parse(s || "{}");
    return o && typeof o === "object" ? o : {};
  } catch (e) {
    return {};
  }
};
var normName = (s) => String(s || "").toLowerCase().replace(/[أإآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^a-z0-9\u0600-\u06FF]/g, "");
async function fetchCompGames(ids) {
  if (!ids.length)
    return [];
  const qs = "appTypeId=5&langId=1&competitions=" + ids.join(",");
  const get = (u) => fetch(u).then((r) => r.ok ? r.json() : null).catch(() => null);
  const [cur, past] = await Promise.all([
    get(`https://webws.365scores.com/web/games/current/?${qs}`),
    get(`https://webws.365scores.com/web/games/results/?${qs}&showOdds=false`)
  ]);
  const out = [];
  const seen = new Set;
  const add = (g) => {
    if (!g || seen.has(g.id))
      return;
    const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
    if (!h.id || !a.id)
      return;
    seen.add(g.id);
    const t = String(g.statusText || "");
    const status = /ended|final|ft/i.test(t) ? "FINISHED" : /live|half|1st|2nd|in progress/i.test(t) ? "IN_PLAY" : "TIMED";
    const hs = Number(h.score), as = Number(a.score);
    const scored = status !== "TIMED" && Number.isFinite(hs) && Number.isFinite(as);
    out.push({
      id: g.id,
      comp: Number(g.competitionId) || 0,
      date: g.startTime,
      status,
      hg: scored ? hs : null,
      ag: scored ? as : null,
      h: { id: String(h.id), name: h.name || "" },
      a: { id: String(a.id), name: a.name || "" }
    });
  };
  (cur && cur.games || []).forEach(add);
  (past && past.games || []).forEach(add);
  return out;
}
async function pushDispatch(env) {
  const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv } = env;
  if (!pub || !priv)
    return { ok: false, error: "push-not-configured" };
  await ensureDb(env);
  const rows = (await env.DB.prepare("SELECT * FROM push_subs").all()).results || [];
  if (!rows.length)
    return { ok: true, subs: 0, sent: 0 };
  const subs = rows.map((r) => ({
    ...r,
    teams: safeArr(r.teams).map(String),
    names: safeArr(r.names).map(normName).filter(Boolean),
    comps: safeArr(r.comps).map(Number).filter(Boolean),
    prefs: safeObj(r.prefs)
  }));
  const comps = [...new Set(subs.flatMap((s) => s.comps))].slice(0, 15);
  const games = await fetchCompGames(comps);
  if (!games.length)
    return { ok: true, subs: subs.length, sent: 0 };
  const vapid = { subject: env.VAPID_SUBJECT || "https://snaces-football-uiulk2.freebuff.site", publicKey: pub, privateKey: priv };
  const now = Date.now();
  let sent = 0, removed = 0;
  for (const s of subs) {
    const teams = new Set(s.teams);
    const names = new Set(s.names);
    const tPrefs = s.prefs.t || {};
    const cPrefs = s.prefs.c || {};
    for (const g of games) {
      const rel = teams.has(g.h.id) || teams.has(g.a.id) || names.has(normName(g.h.name)) || names.has(normName(g.a.name));
      if (!rel)
        continue;
      const cm = cPrefs[String(g.comp)] || "all";
      if (cm === "off")
        continue;
      const modes = [];
      if (teams.has(g.h.id))
        modes.push(tPrefs[g.h.id] || "all");
      if (teams.has(g.a.id))
        modes.push(tPrefs[g.a.id] || "all");
      if (modes.length && modes.every((m) => m === "off"))
        continue;
      const allowKick = !modes.length || modes.some((m) => m !== "off");
      const allowRes = cm === "all" && (!modes.length || modes.some((m) => m === "all"));
      const t = Date.parse(g.date) || 0;
      let kind = "", title = "", body = "";
      if (allowKick && g.status === "IN_PLAY" && now - t < 3 * 3600000) {
        kind = "kick";
        title = "⚽ بدأت المباراة";
        body = `${g.h.name} × ${g.a.name}`;
      } else if (allowRes && g.status === "FINISHED" && g.hg != null && g.ag != null && now - t < 12 * 3600000) {
        kind = "res";
        title = "\uD83C\uDFC1 انتهت المباراة";
        body = `${g.h.name} ${g.hg} - ${g.ag} ${g.a.name}`;
      }
      if (!kind)
        continue;
      if (sent >= 60)
        break;
      const k = kind + ":" + g.id;
      const already = await env.DB.prepare("SELECT 1 FROM push_sent WHERE sub = ? AND k = ?").bind(s.sub, k).first();
      if (already)
        continue;
      try {
        const payload = await buildPushPayload({ data: JSON.stringify({ title, body, url: "/#/matches" }), options: { ttl: 3600, urgency: "high" } }, { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } }, vapid);
        const res = await fetch(s.endpoint, payload);
        if (res.status === 404 || res.status === 410) {
          await env.DB.prepare("DELETE FROM push_subs WHERE sub = ?").bind(s.sub).run();
          removed++;
          break;
        }
        if (res.ok) {
          sent++;
          await env.DB.prepare("INSERT OR IGNORE INTO push_sent (sub, k, sent_at) VALUES (?, ?, ?)").bind(s.sub, k, now).run();
        }
      } catch (e) {}
    }
  }
  await env.DB.prepare("DELETE FROM push_sent WHERE sent_at < ?").bind(now - 3 * 86400000).run();
  return { ok: true, subs: subs.length, sent, removed };
}
var ROOM_TTL = 6 * 3600000;
var ONLINE_MS = 25000;
var ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeRoomCode() {
  const r = crypto.getRandomValues(new Uint8Array(5));
  let s = "";
  for (const x of r)
    s += ROOM_CODE_ALPHABET[x % ROOM_CODE_ALPHABET.length];
  return s;
}
var roomNorm = (s) => String(s || "").toLowerCase().replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/[^a-z0-9\u0600-\u06FF]/g, "");
var ACT_WORDS = [
  ["محمد صلاح", "لاعبين"],
  ["رونالدو", "لاعبين"],
  ["ميسي", "لاعبين"],
  ["أوباميانج", "لاعبين"],
  ["حارس المرمى", "كورة"],
  ["هدف", "كورة"],
  ["ضربة جزاء", "كورة"],
  ["إنذار", "كورة"],
  ["تسلل", "كورة"],
  ["ركلات ترجيح", "كورة"],
  ["الأهلي", "أندية"],
  ["ريال مدريد", "أندية"],
  ["برشلونة", "أندية"],
  ["مانشستر يونايتد", "أندية"],
  ["ريفر بليت", "أندية"],
  ["كورة قدم", "كورة"],
  ["ملعب", "كورة"],
  ["مدرب", "كورة"],
  ["شبكة المرمى", "كورة"],
  ["VAR", "كورة"],
  ["تمساح", "حيوانات"],
  ["قرش", "حيوانات"],
  ["بطريق", "حيوانات"],
  ["قرد", "حيوانات"],
  ["قطة", "حيوانات"],
  ["زرافة", "حيوانات"],
  ["بطة", "حيوانات"],
  ["عقرب", "حيوانات"],
  ["أرنب", "حيوانات"],
  ["خروف", "حيوانات"],
  ["طبيب", "مهن"],
  ["كهربائي", "مهن"],
  ["طيار", "مهن"],
  ["ممرضة", "مهن"],
  ["حلاق", "مهن"],
  ["شرطي", "مهن"],
  ["طباخ", "مهن"],
  ["مبرمج", "مهن"],
  ["نجار", "مهن"],
  ["صياد", "مهن"],
  ["كشري", "أكل"],
  ["فطير", "أكل"],
  ["بيتزا", "أكل"],
  ["شاورما", "أكل"],
  ["بطيخ", "أكل"],
  ["آيس كريم", "أكل"],
  ["قهوة", "أكل"],
  ["شاي", "أكل"],
  ["مكرونة", "أكل"],
  ["فول وطعمية", "أكل"],
  ["تليفون", "أشياء"],
  ["ساعة", "أشياء"],
  ["جزمة", "أشياء"],
  ["مفتاح", "أشياء"],
  ["فرشة أسنان", "أشياء"],
  ["نظارة", "أشياء"],
  ["شنطة", "أشياء"],
  ["مرايا", "أشياء"],
  ["مقص", "أشياء"],
  ["مروحة", "أشياء"],
  ["نادي رياضي", "أماكن"],
  ["مستشفى", "أماكن"],
  ["بحر", "أماكن"],
  ["حلوان", "أماكن"],
  ["المدرسة", "أماكن"],
  ["سوبر ماركت", "أماكن"],
  ["برج إيفل", "أماكن"],
  ["الهرم", "أماكن"],
  ["مطار", "أماكن"],
  ["قهوة بلدي", "أماكن"],
  ["تيتانيك", "سينما"],
  ["باب الحارة", "سينما"],
  ["مقدمة", "سينما"],
  ["ساعي البريد", "سينما"],
  ["علاء الدين", "سينما"],
  ["كابوريا", "سينما"],
  ["الفيل الأزرق", "سينما"],
  ["سبايدرمان", "سينما"],
  ["رامي", "سينما"],
  ["ليلة سعيدة", "سينما"]
];
function c4Winner(b) {
  const at = (r, c) => b[r * 7 + c];
  for (let r = 0;r < 6; r++)
    for (let c = 0;c < 7; c++) {
      const v = at(r, c);
      if (!v)
        continue;
      if (c + 3 < 7 && at(r, c + 1) === v && at(r, c + 2) === v && at(r, c + 3) === v)
        return v;
      if (r + 3 < 6 && at(r + 1, c) === v && at(r + 2, c) === v && at(r + 3, c) === v)
        return v;
      if (r + 3 < 6 && c + 3 < 7 && at(r + 1, c + 1) === v && at(r + 2, c + 2) === v && at(r + 3, c + 3) === v)
        return v;
      if (r + 3 < 6 && c - 3 >= 0 && at(r + 1, c - 1) === v && at(r + 2, c - 2) === v && at(r + 3, c - 3) === v)
        return v;
    }
  return 0;
}
function actNewWord(st) {
  const used = new Set(st.used || []);
  const pool = ACT_WORDS.filter((w) => !used.has(w[0]));
  const pick = (pool.length ? pool : ACT_WORDS)[Math.floor(Math.random() * (pool.length || ACT_WORDS.length))];
  st.word = pick[0];
  st.cat = pick[1];
  st.used = [...st.used || [], pick[0]].slice(-55);
  st.guesses = [];
  st.phase = "play";
}
function roomInit(game) {
  if (game === "act") {
    const st = { actor: 1, round: 1, score: [0, 0], skips: 0, guesses: [], used: [] };
    actNewWord(st);
    return st;
  }
  return { b: new Array(42).fill(0), t: 1, w: 0, d: 0, n: 0 };
}
function roomAct(game, st, seat, action) {
  if (game === "c4") {
    if (action && action.a === "reset") {
      st.b = new Array(42).fill(0);
      st.t = 1;
      st.w = 0;
      st.d = 0;
      st.n = 0;
      return {};
    }
    if (st.w || st.d)
      return { error: "finished" };
    if (st.t !== seat)
      return { error: "not-your-turn" };
    const col = Number(action && action.c);
    if (!(col >= 0 && col <= 6))
      return { error: "bad-move" };
    let row = -1;
    for (let r = 5;r >= 0; r--)
      if (!st.b[r * 7 + col]) {
        row = r;
        break;
      }
    if (row < 0)
      return { error: "column-full" };
    st.b[row * 7 + col] = seat;
    st.n = (st.n || 0) + 1;
    const w = c4Winner(st.b);
    if (w)
      st.w = w;
    else if (st.n >= 42)
      st.d = 1;
    st.t = seat === 1 ? 2 : 1;
    return {};
  }
  if (!action)
    return { error: "bad-action" };
  if (action.a === "reset") {
    st.score = [0, 0];
    st.actor = 1;
    st.round = 1;
    st.skips = 0;
    actNewWord(st);
    return {};
  }
  if (action.a === "skip") {
    if (seat !== st.actor)
      return { error: "actor-only" };
    if (st.phase !== "play")
      return { error: "wait-next" };
    st.skips = (st.skips || 0) + 1;
    actNewWord(st);
    return {};
  }
  if (action.a === "next") {
    if (st.phase !== "done")
      return { error: "not-finished" };
    st.round = (st.round || 1) + 1;
    st.actor = st.actor === 1 ? 2 : 1;
    actNewWord(st);
    return {};
  }
  if (action.a === "guess") {
    if (st.phase !== "play")
      return { error: "finished" };
    if (seat === st.actor)
      return { error: "actor-cannot-guess" };
    const text = String(action.text || "").trim().slice(0, 60);
    if (!text)
      return { error: "empty" };
    const g = roomNorm(text), w = roomNorm(st.word);
    const ok = !!w && (g === w || w.length >= 4 && g.length >= 3 && (w.includes(g) || g.includes(w)));
    st.guesses = [...st.guesses || [], { seat, text, ok }].slice(-12);
    if (ok) {
      st.score[seat - 1] = (st.score[seat - 1] || 0) + 1;
      st.phase = "done";
    }
    return {};
  }
  return { error: "bad-action" };
}
function roomPublicState(game, st, seat) {
  if (game === "c4")
    return { b: st.b, t: st.t, w: st.w, d: st.d, n: st.n };
  return {
    actor: st.actor,
    round: st.round,
    score: st.score,
    skips: st.skips,
    guesses: st.guesses || [],
    phase: st.phase,
    cat: st.cat,
    word: seat === st.actor || st.phase === "done" ? st.word : ""
  };
}
async function roomPlayers(env, code, viewerSub) {
  const now = Date.now();
  const rows = (await env.DB.prepare("SELECT sub, name, picture, seat, last_seen FROM room_players WHERE code = ? ORDER BY seat").bind(code).all()).results || [];
  return rows.map((r) => ({
    sub: r.sub,
    name: r.name || "لاعب",
    picture: r.picture || "",
    seat: r.seat,
    online: now - Number(r.last_seen || 0) < ONLINE_MS,
    seen: Number(r.last_seen || 0),
    me: r.sub === viewerSub
  }));
}
async function roomDrop(env, code) {
  try {
    await env.DB.prepare("DELETE FROM room_players WHERE code = ?").bind(code).run();
  } catch (e) {}
  try {
    await env.DB.prepare("DELETE FROM rooms WHERE code = ?").bind(code).run();
  } catch (e) {}
}
async function roomApi(request, env, a, url) {
  const user = await resolveUser(request, env, a);
  if (!user)
    return json2({ error: "sign-in-required" }, 401);
  await ensureDb(env);
  const now = Date.now();
  const p = url.pathname;
  if (p === "/api/room/create" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const game = body.game === "act" ? "act" : "c4";
    try {
      await env.DB.prepare("DELETE FROM rooms WHERE updated_at < ?").bind(now - ROOM_TTL).run();
    } catch (e) {}
    const mine = await env.DB.prepare("SELECT code FROM rooms WHERE host = ?").bind(user.sub).first();
    if (mine && mine.code)
      await roomDrop(env, mine.code);
    let code = "";
    for (let i = 0;i < 8; i++) {
      const c = makeRoomCode();
      const ex = await env.DB.prepare("SELECT 1 AS x FROM rooms WHERE code = ?").bind(c).first();
      if (!ex) {
        code = c;
        break;
      }
    }
    if (!code)
      return json2({ error: "busy" }, 503);
    await env.DB.prepare("INSERT INTO rooms (code, game, host, state, version, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)").bind(code, game, user.sub, JSON.stringify(roomInit(game)), now, now).run();
    await env.DB.prepare("INSERT OR REPLACE INTO room_players (code, sub, name, picture, seat, last_seen) VALUES (?, ?, ?, ?, 1, ?)").bind(code, user.sub, user.name || "لاعب", user.picture || "", now).run();
    return json2({ ok: true, code, game });
  }
  if (p === "/api/room/join" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (!code)
      return json2({ error: "bad-code" }, 400);
    const room = await env.DB.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first();
    if (!room)
      return json2({ error: "not-found" }, 404);
    const already = await env.DB.prepare("SELECT seat FROM room_players WHERE code = ? AND sub = ?").bind(code, user.sub).first();
    if (already) {
      await env.DB.prepare("UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?").bind(now, code, user.sub).run();
      return json2({ ok: true, code, game: room.game, seat: already.seat });
    }
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM room_players WHERE code = ?").bind(code).first();
    if (Number(count && count.n) >= 2)
      return json2({ error: "full" }, 409);
    await env.DB.prepare("INSERT INTO room_players (code, sub, name, picture, seat, last_seen) VALUES (?, ?, ?, ?, 2, ?)").bind(code, user.sub, user.name || "لاعب", user.picture || "", now).run();
    return json2({ ok: true, code, game: room.game, seat: 2 });
  }
  if (p === "/api/room" && request.method === "GET") {
    const code = String(url.searchParams.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const room = code && await env.DB.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first();
    if (!room)
      return json2({ error: "not-found" }, 404);
    const me = await env.DB.prepare("SELECT * FROM room_players WHERE code = ? AND sub = ?").bind(code, user.sub).first();
    if (!me)
      return json2({ error: "not-member" }, 403);
    await env.DB.prepare("UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?").bind(now, code, user.sub).run();
    let st = {};
    try {
      st = JSON.parse(room.state);
    } catch (e) {
      st = roomInit(room.game);
    }
    const players = await roomPlayers(env, code, user.sub);
    return json2({
      ok: true,
      code,
      game: room.game,
      version: room.version,
      host: room.host === user.sub,
      seat: me.seat,
      players,
      state: roomPublicState(room.game, st, me.seat)
    });
  }
  if (p === "/api/room/act" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const room = code && await env.DB.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first();
    if (!room)
      return json2({ error: "not-found" }, 404);
    const me = await env.DB.prepare("SELECT * FROM room_players WHERE code = ? AND sub = ?").bind(code, user.sub).first();
    if (!me)
      return json2({ error: "not-member" }, 403);
    if (Number(body.v) !== Number(room.version))
      return json2({ error: "stale", version: room.version }, 409);
    const players = await roomPlayers(env, code, user.sub);
    if (players.length < 2)
      return json2({ error: "waiting" }, 409);
    let st = {};
    try {
      st = JSON.parse(room.state);
    } catch (e) {
      st = roomInit(room.game);
    }
    const r = roomAct(room.game, st, me.seat, body.action || {});
    if (r.error)
      return json2({ error: r.error, version: room.version }, 409);
    const v = Number(room.version) + 1;
    await env.DB.prepare("UPDATE rooms SET state = ?, version = ?, updated_at = ? WHERE code = ?").bind(JSON.stringify(st), v, now, code).run();
    await env.DB.prepare("UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?").bind(now, code, user.sub).run();
    return json2({ ok: true, version: v, state: roomPublicState(room.game, st, me.seat) });
  }
  if (p === "/api/room/leave" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const room = code && await env.DB.prepare("SELECT host FROM rooms WHERE code = ?").bind(code).first();
    if (!room)
      return json2({ ok: true });
    if (room.host === user.sub)
      await roomDrop(env, code);
    else
      await env.DB.prepare("DELETE FROM room_players WHERE code = ? AND sub = ?").bind(code, user.sub).run();
    return json2({ ok: true });
  }
  return json2({ error: "not-found" }, 404);
}
async function api(request, env, a) {
  const url = new URL(request.url);
  const mutation = request.method !== "GET" && request.method !== "HEAD";
  const cron = url.pathname === "/api/push/check" && !!request.headers.get("x-push-key");
  if (mutation && !cron && !isSameOriginRequest(request, env.APP_ORIGIN)) {
    return new Response(null, { status: 403 });
  }
  if (url.pathname.startsWith("/api/room") && throttled("room:" + clientIp(request), 150, 60000)) {
    return json2({ error: "slow-down" }, 429);
  }
  if (!cron && (url.pathname.startsWith("/api/auth") || url.pathname === "/api/sync" || url.pathname.startsWith("/api/push") || url.pathname === "/api/account/delete")) {
    if (throttled("acct:" + clientIp(request), 90, 60000))
      return json2({ error: "slow-down" }, 429);
  }
  if (url.pathname.startsWith("/api/room"))
    return roomApi(request, env, a, url);
  if (url.pathname === "/api/auth/google" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null);
    let p;
    try {
      p = await verifyGoogle(body && body.credential, GOOGLE_CLIENT_ID);
    } catch (e) {
      return json2({ error: "invalid-token" }, 401);
    }
    await ensureDb(env);
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const now = Date.now();
    const exp = now + SESSION_DAYS * 24 * 3600 * 1000;
    await env.DB.prepare("INSERT INTO sessions (token_hash, sub, name, email, picture, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(await sha256hex(token), "g:" + p.sub, p.name || "", p.email || "", p.picture || "", now, exp).run();
    const secure = url.protocol === "https:" ? " Secure;" : "";
    return new Response(JSON.stringify({
      ok: true,
      user: { sub: "g:" + p.sub, name: p.name || "", email: p.email || "", picture: p.picture || "", via: "google" }
    }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "private, no-store",
        "set-cookie": `snaces_sid=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 3600}`
      }
    });
  }
  if (url.pathname === "/api/auth/signout" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const sid = getCookie(request, "snaces_sid");
    if (sid) {
      await ensureDb(env);
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256hex(sid)).run();
    }
    const secure = url.protocol === "https:" ? " Secure;" : "";
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "private, no-store",
        "set-cookie": `snaces_sid=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`
      }
    });
  }
  if (url.pathname === "/api/me") {
    const user = await resolveUser(request, env, a);
    if (!user)
      return json2({ error: "sign-in-required" }, 401);
    return json2({ user: publicUser(user) });
  }
  if (url.pathname === "/api/sync" && request.method === "GET") {
    const user = await resolveUser(request, env, a);
    if (!user)
      return json2({ error: "sign-in-required" }, 401);
    await ensureDb(env);
    const row = await env.DB.prepare("SELECT data, updated_at FROM profiles WHERE sub = ?").bind(user.sub).first();
    let data = null;
    if (row && row.data) {
      try {
        data = JSON.parse(row.data);
      } catch (e) {
        data = null;
      }
    }
    return json2({ user: publicUser(user), data, updatedAt: row ? row.updated_at : 0 });
  }
  if (url.pathname === "/api/account/delete" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const user = await resolveUser(request, env, a);
    if (!user)
      return json2({ error: "sign-in-required" }, 401);
    await ensureDb(env);
    try {
      await env.DB.prepare("DELETE FROM profiles WHERE sub = ?").bind(user.sub).run();
    } catch (e) {}
    try {
      await env.DB.prepare("DELETE FROM push_subs WHERE sub = ?").bind(user.sub).run();
    } catch (e) {}
    try {
      await env.DB.prepare("DELETE FROM push_sent WHERE sub = ?").bind(user.sub).run();
    } catch (e) {}
    try {
      await env.DB.prepare("DELETE FROM sessions WHERE sub = ?").bind(user.sub).run();
    } catch (e) {}
    try {
      const hosted = (await env.DB.prepare("SELECT code FROM rooms WHERE host = ?").bind(user.sub).all()).results || [];
      for (const r of hosted) {
        await env.DB.prepare("DELETE FROM room_players WHERE code = ?").bind(r.code).run();
        await env.DB.prepare("DELETE FROM rooms WHERE code = ?").bind(r.code).run();
      }
      await env.DB.prepare("DELETE FROM room_players WHERE sub = ?").bind(user.sub).run();
    } catch (e) {}
    return json2({ ok: true });
  }
  if (url.pathname === "/api/sync" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const user = await resolveUser(request, env, a);
    if (!user)
      return json2({ error: "sign-in-required" }, 401);
    const body = await request.json().catch(() => null);
    const data = body && body.data;
    if (!data || typeof data !== "object" || Array.isArray(data))
      return json2({ error: "bad-data" }, 400);
    const text = JSON.stringify(data);
    if (text.length > 200000)
      return json2({ error: "too-large" }, 413);
    await ensureDb(env);
    const now = Date.now();
    await env.DB.prepare("INSERT INTO profiles (sub, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(sub) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(user.sub, text, now).run();
    return json2({ ok: true, updatedAt: now });
  }
  if (url.pathname === "/api/push/key") {
    if (!env.VAPID_PUBLIC_KEY)
      return json2({ error: "push-not-configured" }, 503);
    return new Response(JSON.stringify({ key: env.VAPID_PUBLIC_KEY }), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" }
    });
  }
  if (url.pathname === "/api/push/subscribe" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const endpoint = String(body.endpoint || "");
    const p256dh = String(body.keys && body.keys.p256dh || "");
    const authKey = String(body.keys && body.keys.auth || "");
    if (!/^https:\/\//.test(endpoint) || !p256dh || !authKey)
      return json2({ error: "bad-subscription" }, 400);
    const user = await resolveUser(request, env, a);
    const device = String(body.device || "").replace(/[^a-z0-9-]/gi, "").slice(0, 40);
    const sub = user ? user.sub : device ? "d:" + device : "";
    if (!sub)
      return json2({ error: "device-required" }, 400);
    await ensureDb(env);
    if (user && device)
      await env.DB.prepare("DELETE FROM push_subs WHERE sub = ?").bind("d:" + device).run();
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO push_subs (sub, endpoint, p256dh, auth, teams, names, comps, prefs, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(sub) DO UPDATE SET endpoint=excluded.endpoint, p256dh=excluded.p256dh, auth=excluded.auth,
         teams=excluded.teams, names=excluded.names, comps=excluded.comps, prefs=excluded.prefs, updated_at=excluded.updated_at`).bind(sub, endpoint, p256dh, authKey, JSON.stringify((body.teams || []).slice(0, 30)), JSON.stringify((body.names || []).slice(0, 30)), JSON.stringify((body.comps || []).slice(0, 12)), JSON.stringify(body.prefs && typeof body.prefs === "object" ? body.prefs : {}), now, now).run();
    return json2({ ok: true, scope: user ? "user" : "device" });
  }
  if (url.pathname === "/api/push/unsubscribe" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null) || {};
    const user = await resolveUser(request, env, a);
    const device = String(body.device || "").replace(/[^a-z0-9-]/gi, "").slice(0, 40);
    const sub = user ? user.sub : device ? "d:" + device : "";
    if (!sub)
      return json2({ error: "device-required" }, 400);
    await ensureDb(env);
    await env.DB.prepare("DELETE FROM push_subs WHERE sub = ?").bind(sub).run();
    return json2({ ok: true });
  }
  if (url.pathname === "/api/fpl/prices" && request.method === "GET") {
    await ensureDb(env);
    const row = await env.DB.prepare("SELECT v FROM kv_meta WHERE k = 'fpl_prices'").first();
    if (row && row.v) {
      try {
        const c = JSON.parse(row.v);
        if (Date.now() - c.t < 20 * 60000)
          return json2(c.d);
      } catch (e) {}
    }
    try {
      const r = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/", {
        headers: { "user-agent": "Mozilla/5.0 SNACES", accept: "application/json" }
      });
      if (!r.ok)
        throw new Error("HTTP " + r.status);
      const b = await r.json();
      const prices = (b.elements || []).map((p) => [
        p.id,
        p.now_cost || 0,
        p.cost_change_start || 0,
        p.cost_change_event || 0,
        p.cost_change_start_fall || 0,
        p.cost_change_event_fall || 0,
        p.transfers_in_event || 0,
        p.transfers_out_event || 0
      ]);
      const cur = (b.events || []).find((e) => e.is_current) || (b.events || []).find((e) => e.is_next) || null;
      const d = { updated: new Date().toISOString(), event: cur ? { id: cur.id, name: cur.name, deadline_time: cur.deadline_time } : null, prices };
      await env.DB.prepare("INSERT INTO kv_meta (k, v) VALUES ('fpl_prices', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(JSON.stringify({ t: Date.now(), d })).run();
      return json2(d);
    } catch (e) {
      if (row && row.v) {
        try {
          return json2(JSON.parse(row.v).d);
        } catch (e2) {}
      }
      return json2({ error: "fpl-unavailable" }, 503);
    }
  }
  if (url.pathname === "/api/push/test" && request.method === "POST") {
    if (!isSameOriginRequest(request, env.APP_ORIGIN))
      return new Response(null, { status: 403 });
    const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv } = env;
    if (!pub || !priv)
      return json2({ error: "push-not-configured" }, 503);
    const body = await request.json().catch(() => null) || {};
    const user = await resolveUser(request, env, a);
    const device = String(body.device || "").replace(/[^a-z0-9-]/gi, "").slice(0, 40);
    const sub = user ? user.sub : device ? "d:" + device : "";
    if (!sub)
      return json2({ error: "device-required" }, 400);
    await ensureDb(env);
    const row = await env.DB.prepare("SELECT * FROM push_subs WHERE sub = ?").bind(sub).first();
    if (!row)
      return json2({ error: "not-subscribed" }, 404);
    try {
      const payload = await buildPushPayload({ data: JSON.stringify({ title: "إشعار تجريبي \uD83D\uDD14", body: "لو وصلت، يبقى إشعارات SNACES شغالة على الجهاز ده.", url: "/#/notifications" }), options: { ttl: 120, urgency: "high" } }, { endpoint: row.endpoint, expirationTime: null, keys: { p256dh: row.p256dh, auth: row.auth } }, { subject: env.VAPID_SUBJECT || "https://snaces-football-uiulk2.freebuff.site", publicKey: pub, privateKey: priv });
      const res = await fetch(row.endpoint, payload);
      if (res.status === 404 || res.status === 410) {
        await env.DB.prepare("DELETE FROM push_subs WHERE sub = ?").bind(sub).run();
        return json2({ error: "subscription-expired" }, 410);
      }
      if (!res.ok)
        return json2({ error: "push-failed", status: res.status }, 502);
      return json2({ ok: true });
    } catch (e) {
      return json2({ error: "push-failed" }, 502);
    }
  }
  if (url.pathname === "/api/push/check" && request.method === "POST") {
    const secret = request.headers.get("x-push-key") || "";
    const cron = !!(env.PUSH_TRIGGER_KEY && await timingSafeEqual2(secret, env.PUSH_TRIGGER_KEY));
    if (!cron) {
      if (!isSameOriginRequest(request, env.APP_ORIGIN))
        return new Response(null, { status: 403 });
      await ensureDb(env);
      const row = await env.DB.prepare("SELECT v FROM kv_meta WHERE k = 'push_run'").first();
      if (row && Date.now() - Number(row.v) < 240000)
        return json2({ ok: true, skipped: true });
      await env.DB.prepare("INSERT INTO kv_meta (k, v) VALUES ('push_run', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(String(Date.now())).run();
    }
    try {
      return json2(await pushDispatch(env));
    } catch (e) {
      return json2({ ok: false, error: "push-failed" }, 500);
    }
  }
  return json2({ error: "not-found" }, 404);
}
async function serve(request, env, url) {
  const res = await env.ASSETS.fetch(request);
  if (res.status !== 404)
    return res;
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
  }
  return res;
}
var worker_default = {
  async fetch(request, env) {
    try {
      return await setup(env)(request, env);
    } catch (e) {
      return new Response(JSON.stringify({ error: "server-error" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
      });
    }
  }
};
export {
  worker_default as default
};
