import base64
import hashlib
import hmac
import os
import struct
import time
import urllib.parse


def generate_secret() -> str:
    return base64.b32encode(os.urandom(10)).decode("utf-8")


def _hotp(secret_b32: str, counter: int) -> str:
    key = base64.b32decode(secret_b32.upper())
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code = (struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF) % 1_000_000
    return f"{code:06d}"


def verify_totp(secret_b32: str, code: str, window: int = 1) -> bool:
    if not secret_b32 or not code:
        return False
    counter = int(time.time() // 30)
    for delta in range(-window, window + 1):
        if _hotp(secret_b32, counter + delta) == code.strip():
            return True
    return False


def otpauth_uri(secret_b32: str, email: str, issuer: str = "Kale Hospital") -> str:
    label = urllib.parse.quote(f"{issuer}:{email}")
    return f"otpauth://totp/{label}?secret={secret_b32}&issuer={urllib.parse.quote(issuer)}&digits=6&period=30"
