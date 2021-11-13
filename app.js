require("dotenv-json")();
const http = require("http");
const PORT = process.env.PORT || 5000;

const {initializeApp, cert} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');

const serviceAccount = {
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    auth_uri: process.env.auth_uri,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    client_x509_cert_url: process.env.client_x509_cert_url,
    private_key: process.env.private_key,
    private_key_id: process.env.private_key_id,
    project_id: process.env.project_id,
    token_uri: process.env.token_uri,
    type: process.env.type,
}

initializeApp({
    credential: cert((serviceAccount))
});

const createResMsg = (message) => ({message})

const db = getFirestore();

const server = http.createServer(async(req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('x-powered-by');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if(req.url === "/api/new_click" && req.method === "POST") {
        const cityRef = db.collection('click').doc('CHECKID');
        try {
            await db.runTransaction(async(t) => {
                const doc = await t.get(cityRef);
                const count = doc.data().count + 1;
                t.update(cityRef, {count});
            });

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(createResMsg('Transaction success!')));
        } catch(e) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify(createResMsg("Error!")));
            console.log('Transaction failure:', e);
        }
    } else {
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify(createResMsg("Route not found")));
    }
});

server.listen(PORT, () => {
    console.log(`server started on port: http://localhost:${PORT}`);
});