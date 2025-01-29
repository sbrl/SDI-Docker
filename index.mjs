#!/usr/bin/env node
"use strict";

import http from 'http';

import tweetnacl from 'tweetnacl';

/*
 * This program starts a simple HTTP server that respondss with a message. It also uses some fun cryptography to generate a validation code that can be validated on the other end.
 * 
 * Although this mechanism can be bypassed, the validation program on the other end checks whether the Docker containre is indeed running to close that loophole. Using a unique nonce every time here allows us to ensure a static file isn't being served instead.
 */

const key = new Uint8Array(
	atob(`OTgsMjQxLDU3LDE0NCw2NCwxNjUsODYsMjE2LDI4LDEzNiwxNTUsMTkxLDcwLDE4MSwxMjcsNDQsMSwxNDMsMTAxLDE2LDIzOCwyOSwxOTgsMjI3LDIzMCwxMjMsMzUsNjUsMTM2LDE1MCwyMTgsOTU=`).split(`,`).map(el => parseInt(el, 10))
);

const tenc = new TextEncoder();

const port = 3000;

const server = http.createServer((req, res) => {
	const nonce = tweetnacl.randomBytes(tweetnacl.secretbox.nonceLength);
	const msgenc = tenc.encode(JSON.stringify({
		module: `Secure Digital Infrastructure`,
		date: (new Date()).toISOString().replace(/T.*$/, ``),
	}));
	// console.log(`msgenc`, msgenc, `key`, key, `nonce`, nonce);
	const message = btoa(tweetnacl.secretbox(msgenc, nonce, key)) + `|` + btoa(nonce);
	const payload = `Hello, world! This is a request that was handled by a Docker container. The code on the line below is used for validation purposes.\n${message}`;
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', Buffer.byteLength(payload));
	res.setHeader(`x-sbrl-test`, `heya this is an easter egg do not change this header`);
	res.end(payload);
	console.log(`[${new Date().toISOString()}] ${req.method ?? `UNKNOWN`} from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
});

server.listen(port, () => {
	console.log(`Server listening on http://0.0.0.0:${port}/`);
});
