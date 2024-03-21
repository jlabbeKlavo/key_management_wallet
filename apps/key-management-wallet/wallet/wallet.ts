import { Ledger, JSON, Context } from "@klave/sdk";
import { emit } from "../klave/types";
import { Key } from "./key";
import { User } from "./user";

const WalletTable = "WalletTable";

/**
 * An Wallet is associated with a list of users and holds keys.
 */
@JSON
export class Wallet {    
    name: string;
    keys: Array<string>;
    users: Array<string>;

    constructor() {
        this.name = "";
        this.keys = new Array<string>();
        this.users = new Array<string>();
    }
    
    /**
     * load the wallet from the ledger.
     * @returns true if the wallet was loaded successfully, false otherwise.
     */
    load(): boolean {
        let walletTable = Ledger.getTable(WalletTable).get("ALL");
        if (walletTable.length == 0) {
            emit("Wallet does not exists. Create it first");
            return false;
        }
        let wlt = JSON.parse<Wallet>(walletTable);
        this.name = wlt.name;
        this.keys = wlt.keys;
        this.users = wlt.users;
        emit("Wallet loaded successfully: " + walletTable);
        return true;
    }
 
    /**
     * save the wallet to the ledger.
     */
    save(): void {
        let walletTable = JSON.stringify<Wallet>(this);
        Ledger.getTable(WalletTable).set("ALL", walletTable);
        emit("Wallet saved successfully: " + walletTable);
    }

    /**
     * rename the wallet.
     * @param newName 
     */
    rename(newName: string): void {        
        if (!this.senderIsAdmin())
        {
            emit("You are not allowed to add a user");
            return;
        }
        this.name = newName;
        emit("Wallet renamed successfully");
    }

    /**
     * Create a wallet with the given name.
     * Also adds the sender as an admin user.
     * @param name 
     */
    create(name: string): void {
        this.name = name;
        this.addUser(Context.get('sender'), "admin", true);
        emit("Wallet created successfully: " + this.name);        
        return;
    }
    
    /**
     * Add a user to the wallet.
     * @param userId The id of the user to add.
     * @param role The role of the user to add.
     */
    addUser(userId: string, role: string, force: boolean): boolean {
        if (!force && !this.senderIsAdmin())
        {
            emit("You are not allowed to add a user");
            return false;
        }

        let user = new User(userId);
        if (user.load()) {
            emit("User already exists: " + userId);
            return false;
        }
        user.role = role;
        user.save();
        this.users.push(userId);        
        emit("User added successfully: " + userId);
        return true;
    }

    /**
     * Remove a user from the wallet.
     * @param userId The id of the user to remove.
     */
    removeUser(userId: string): boolean {
        if (!this.senderIsAdmin())
        {
            emit("You are not allowed to remove a user");
            return false;
        }

        let user = new User(userId);
        if (!user.load()) {
            emit("User not found: " + userId);
            return false;
        }
        user.delete();

        let index = this.users.indexOf(userId);
        this.users.splice(index, 1);
        emit("User removed successfully: " + userId);
        return true;
    }

    /**
     * Check if the sender is an admin.
     * @returns True if the sender is an admin, false otherwise.
     */
    senderIsAdmin(): boolean {
        let user = new User(Context.get('sender'));
        if (!user.load()) {
            return false;
        }
        return user.role == "admin";
    }

    /**
     * Check if the sender is registered.
     * @returns True if the sender is registered, false otherwise.
     */
    senderIsRegistered(): boolean {
        let user = new User(Context.get('sender'));
        return user.load();
    }

    /**
     * list all the keys in the wallet.
     * @returns 
     */
    listKeys(user: string): void {
        if (!this.senderIsRegistered())
        {
            emit("You are not allowed to list the keys in the wallet");
            return;
        }        

        let keys: string = "";
        for (let i = 0; i < this.keys.length; i++) {
            let key = this.keys[i];
            let keyObj = new Key(key);
            keyObj.load();
            if (keys.length > 0) {
                keys += ", ";
            }
            if (user.length == 0 || keyObj.owner == user) {
                keys += JSON.stringify<Key>(keyObj);
            }
        }
        if (keys.length == 0) {
            emit(`No keys found in the wallet`);
        }
        emit(`Keys in the wallet: ${keys}`);
    }

    /**
     * reset the wallet to its initial state.
     * @returns 
     */
    reset(keys: Array<string>): void {
        if (!this.senderIsAdmin())
        {
            emit("You are not allowed to reset the wallet");
            return;
        }

        if (keys.length == 0) {
            this.name = "";        
            this.keys = new Array<string>();
            this.users = new Array<string>();
            emit("Wallet reset successfully");
         } else {
            for (let i = 0; i < keys.length; i++) {
                let key = new Key(keys[i]);                
                key.delete();
                let index = this.keys.indexOf(keys[i]);
                this.keys.splice(index, 1);
            }
            emit("Keys removed successfully");
        }

    }

    /**
     * Sign a message with the given key.
     * @param keyId The id of the key to sign with.
     * @param payload The message to sign.
     */
    sign(keyId: string, payload: string): string | null {
        if (!this.senderIsRegistered())
        {
            emit("You are not allowed to add a user");
            return null;
        }
        let key = new Key(keyId);
        if (!key.load()) {
            return null;
        }
        return key.sign(payload);        
    }

    /**
     * Verify a signature with the given key.
     * @param keyId The id of the key to verify with.
     * @param payload The message to verify.
     * @param signature The signature to verify.
     */
    verify(keyId: string, payload: string, signature: string): boolean {
        if (!this.senderIsRegistered())
        {
            emit("You are not allowed to add a user");
            return false;
        }
        let key = new Key(keyId);
        if (!key.load()) {
            return false;
        }
        return key.verify(payload, signature);        
    }

    /**
     * Create a key with the given description and type.
     * @param description The description of the key.
     * @param type The type of the key.
     */
    addKey(description: string, type: string): boolean {
        if (!this.senderIsRegistered())
        {
            emit("You are not allowed to add a user");
            return false;
        }
        let key = new Key("");
        key.create(description, type);
        key.save();

        this.keys.push(key.id);
        return true;
    }

    /**
     * Remove a key from the wallet.
     * @param keyId The id of the key to remove.
     */
    removeKey(keyId: string): boolean {
        if (!this.senderIsRegistered())
        {
            emit("You are not allowed to add a user");
            return false;
        }
        let key = new Key(keyId);
        if (!key.load()) {
            return false;
        }
        key.delete();

        let index = this.keys.indexOf(keyId);
        this.keys.splice(index, 1);
        return true;
    }

}