
# Welcome to CNFT Sniper

This is a Cardano NFT Sniper, it is compatible with jpg.store and fully customizable using the concept of rules.

⚠️ This tool is able to sign transactions and buy assets on your behalf,  you may want to first test it with the `test_mode` setting enabled ⚠️

# Setup

There are two ways of running this tool: **Command Line** and **Desktop App**

Both approaches need the following pre-requisites:

  

- [Install NodeJS](https://nodejs.org)

- [Get a blockfrost key](https://blockfrost.io)

## Command Line App

1. Install dependencies

```bash

npm install

```

  

2. Setup env

```bash

cp .env.example .env

```

3. Setup config

```bash

cp config.example.json config.json

```

4. Update `config.json` with your custom rules, wallet, blockfrost key, etc ([Config Section)](#Config.json)

5. Run

```bash

node bin/main.js

```

## Desktop App

1. Install dependencies

```bash

npm install

```

  

2. Setup env

```bash

cp .env.example .env

```

3. Setup config

```bash

cp config.example.json config.json

```

4. Run

```bash

npm run client

```

  

# Config

Both command line app and desktop app need config in `JSON` format. This is where all the custom configuration will live, and it consists on the following structure:

```json

{

"rules":[

{

"name":"rule_ape_society",

"policy_id":"dac355946b4317530d9ec0cb142c63a4b624610786c2a32137d78e25",

"under_previous_collection_floor":20,

"under_previous_rule_floor":20,

"under_value":450

},

{

"name":"rule_cabins",

"policy_id":"d4e087164acf8314f1203f0b0996f14908e2a199a296d065f14b8b09",

"traits_filter":{

"cabin size":["chateau"]

},

"under_value":200

}

],

"settings":{

"main_wallet":{

"name":"",

"seed_key":[

"key_1", "key2", ...

]

},

"cardano_submit_api_url":"http://192.168.1.200:8091/api/submit/tx",

"blockfrost_project_id":"",

"test_mode":false,

"discord_webhook":""

}

}

```

## Rules

There are three types of rules supported so far:

  

-  `under_value` - It will consider assets under a specified value

-  `under_previous_rule_floor` - It will consider assets that are under a specified percentage of the last floor of the rule

-  `under_previous_collection_floor` - It will consider assets that under a specified percentage of the last floor of the collection

## Settings

-  `main_wallet` - you should add a custom name and the seed key (**required**)

-  `cardano_submit_api_url` - if you want to use a custom cardano node to submit the transactions (**optional**)

-  `blockfrost_project_id` - blockfrost project id used to fetch utxos of the wallet and to submit transactions (**required**)

-  `test_mode` - will not buy any assets if is set to true. It defaults to false (**optional**)

-  `discord_webhook` - If it is set it will send notifications to that webhook when it buys an asset (**optional**)