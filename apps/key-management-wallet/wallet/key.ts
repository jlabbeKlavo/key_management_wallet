import { Ledger, Crypto, JSON, Context } from '@klave/sdk'
import { emit, revert } from "../klave/types"
import { SignInput, VerifyInput, sign, verify } from "../klave/crypto";
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';
import { convertToUint8Array, convertToU8Array } from "../klave/helpers";

const KeysTable = "KeysTable";

@JSON
export class Key {
    id: string;
    description: string;
    type: string;
    owner: string;

    constructor(id: string) {
        this.id = id;
        this.description = "";
        this.type = "";
        this.owner = "";
    }

    load() : boolean {        
        let keyTable = Ledger.getTable(KeysTable).get(this.id);
        if (keyTable.length == 0) {
            emit("Key does not exists. Create it first");
            return false;
        }
        let key = JSON.parse<Key>(keyTable);        
        this.description = key.description;
        this.type = key.type;        
        this.owner = key.owner;
        emit(`Key loaded successfully: '${this.id}'`);        
        return true;
    }

    save(): void {
        let keyTable = JSON.stringify<Key>(this);
        Ledger.getTable(KeysTable).set(this.id, keyTable);
        emit(`User saved successfully: '${this.id}'`);        
    }

    create(description: string, type: string): boolean {
        this.id = b64encode(convertToUint8Array(Crypto.getRandomValues(64)));
        this.description = description;
        this.type = type;
        this.owner = Context.get('sender');
        if (this.type == "ECDSA") {
            const key = Crypto.ECDSA.generateKey(this.id);
            if (key) {
                emit(`SUCCESS: Key '${this.id}' has been generated`);
                return true;
            } else {
                emit(`ERROR: Key '${this.id}' has not been generated`);
                return false;
            }
        }
        else if (this.type == "AES") {
            const key = Crypto.AES.generateKey(this.id);
            if (key) {
                emit(`SUCCESS: Key '${this.id}' has been generated`);
                return true;
            } else {
                emit(`ERROR: Key '${this.id}' has not been generated`);
                return false;
            }
        }
        else {
            emit(`ERROR: Key type '${this.type}' is not supported`);
            return false;
        }
    }

    delete(): void {
        Ledger.getTable(KeysTable).unset(this.id);
        emit(`Key deleted successfully: '${this.id}'`);
    }

    sign(message: string): string | null {
        if (this.type != "ECDSA") {
            revert("ERROR: Key type is not ECDSA")
            return null;
        }        
        return sign(new SignInput(this.id, message));
    }

    verify(message: string, signature: string): boolean {
        if (this.type != "ECDSA") {
            revert("ERROR: Key type is not ECDSA")
            return false;
        }        
        return verify(new VerifyInput(this.id, message, signature));
    }    

    encrypt(message: string): string {
        if (this.type != "AES") {
            return "ERROR: Key type is not AES";
        }        
        let KeyAES = Crypto.AES.getKey(this.id);
        if (!KeyAES) {
            return "ERROR: Key not found";
        }        
        return b64encode(convertToUint8Array(KeyAES.encrypt(message)));
    }

    decrypt(cypher: string): string {
        if (this.type != "AES") {
            return "ERROR: Key type is not AES";
        }        
        let KeyAES = Crypto.AES.getKey(this.id);
        if (!KeyAES) {
            return "ERROR: Key not found";
        }        
        return KeyAES.decrypt(convertToU8Array(b64decode(cypher)));
    }
}