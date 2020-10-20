# How to use HTTPS in local environnement


## About this repository 

Repository used to illustrate talk "Stop your local dev without HTTPS" 

Two parts :

* standalone node js api with manual certificate generation
* add reverse proxy and use mkcert tool to genrate certificate


## Part One  


We will run node API with HTTPS : `https://api.myproject.local:5000`


> Nb: add entry to the domain in `/etc/hosts`


## Configuration 

### Setup Certificate

Two options to generate certificate

* manual : step by step
* automatic with mkcert tools


### A) Manual creation

make sure certificates exists

```bash
mkdir -p certificates
```

#### 1. Create Certificate Signing Request (CSR)



Create private key

```bash
openssl genrsa -out ./certificates/api.myproject.key 2048
```

Create certificate with new private key

```bash
openssl req -new -key ./certificates/api.myproject.key -out ./certificates/api.myproject.csr
```

NB : For non interactive CSR generation, add argument `-subj`

```bash
openssl req -new -key ./certificates/api.myproject.key -out ./certificates/api.myproject.csr -subj "/C=FR/ST=IDF/L=Paris/O=MyLocalDev/CN=api.myproject.local"
```


#### 2. Create Certificate Authority (CA)

Generate private key 

```bash
openssl genrsa -des3 -out ./certificates/myCA.key 2048
```


generate CA Certificate from private key (pass prompt)

```bash
openssl req -x509 -new -nodes -key ./certificates/myCA.key -sha256 -days 825 -out ./certificates/myCA.pem
```

> no need for Common Name (ex: my_CA)


NB : For non interactive add argument `-subj`

```bash
openssl req -x509 -new -nodes -key ./certificates/myCA.key -sha256 -days 825 -out ./certificates/myCA.pem -subj "/C=FR/ST=IDF/L=Paris/O=MyLocalDev/CN=my_CA"
```



#### 3. Generate Certificate with our CA

```bash
openssl x509 -req -in ./certificates/api.myproject.csr -out ./certificates/api.myproject.pem -CA ./certificates/myCA.pem -CAkey ./certificates/myCA.key \
-CAcreateserial -CAserial ./certificates/ca.srl
```

> NB: the issuer name and serial number identify a unique certificate

#### 4. Add certificate in our browser

Chrome example 

```bash
chrome://settings/certificates
```

Firefox:

```bash
about:preferences#privacy
```

NB :  Chrome needs SAN certificate

@TODO : update command to add SAN config with alternate domain name (required by chrome)


### B) Automatic generation


Use `mkcert` tool

See installation on [mkcert github page](https://github.com/FiloSottile/mkcert)


Move to `certificates` directory

```bash
cd certificates
```


Create local Certificate Authority:

```bash
mkcert -install
```

Generate signed certificate for domain

```bash
mkcert "api.myproject.local"
```


## Part Two


`https://gw.public-myproject.local` =>  `https://api.myproject.local:5000` 

> nb: two differents domain names


We use [Caddy server](https://caddyserver.com/docs/install) to configure reverse proxy with HTTPS 


Move to `certificates` directory

```
cd certificates
```


Create certicates

```bash
mkcert "gw.public-myproject.local"
```

Move to `caddy` directory

```bash
cd caddy
```

Copy `Caddyfile` and customize with your certificates paths

```bash
cp Caddyfile.template Caddyfile
```

Run caddy Server

```bash
sudo caddy run --config Caddyfile
```

Open your secure URL gateway

```bash
https://gw.public-myproject.local
```

> Ensure node api is running AND with proper certificate keys