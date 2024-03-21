import { JSON, Ledger, Context } from "@klave/sdk";
import { RenameWalletInput, CreateWalletInput, SignInput, VerifyInput, AddUserInput, AddKeyInput} from "./wallet/inputs/types";
import { Wallet } from "./wallet/wallet";
import { emit } from "./klave/types";

/**
 * @transaction rename an Wallet in the wallet
 * @param oldName: string
 * @param newName: string
 */
export function renameWallet(input: RenameWalletInput): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    wallet.rename(input.newName);
    wallet.save();
}

/**
 * @transaction create an Wallet in the wallet
 * @param input containing the following fields:
 * - name: string
 * - hiddenOnUI: boolean
 * - customerRefId: string
 * - autoFuel: boolean
 */
export function createWallet(input: CreateWalletInput): void {
    let wallet = new Wallet();
    if (wallet.load()) {
        emit("Wallet does already exists.");
        return;
    }
    wallet.create(input.name);
    wallet.save();
}

/**
 * @transaction clears the wallet
 */
export function reset(): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    wallet.reset();
    wallet.save();
}

/**
 * @query
 * @param input containing the following fields:
 * - keyId: string
 * - payload: string
 */
export function sign(input: SignInput) : void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    let signature = wallet.sign(input.keyId, input.payload);
    if (signature == null) {
        emit("Failed to sign");
        return;
    }
    emit("Signed successfully: " + signature);    
}

/**
 * @query 
 * @param input containing the following fields:
 * - keyId: string
 * - payload: string
 * - signature: string
 */
export function verify(input: VerifyInput) : void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    let result = wallet.verify(input.keyId, input.payload, input.signature);
    if (!result) {
        emit("Failed to verify");
        return;
    }
    emit("Verified successfully");
}

/**
 * @transaction add a user to the wallet
 * @param userId: string
 */
export function addUser(input: AddUserInput): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    if (wallet.addUser(input.userId, input.role, false)) {
        wallet.save();
    }
}

/**
 * @transaction remove a user from the wallet
 * @param userId: string
 */
export function removeUser(userId: string): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    if (wallet.removeUser(userId)) {
        wallet.save();
    }
}

/**
 * @transaction add a key to the wallet
 * @param keyId: string
 */
export function addKey(input: AddKeyInput): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    if (wallet.addKey(input.description, input.type)) {
        wallet.save();
    }
}

/**
 * @transaction remove a key from the wallet
 * @param keyId: string
 */
export function removeKey(keyId: string): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    if (wallet.removeKey(keyId)) {
        wallet.save();
    }
}

/**
 * @query list all keys in the wallet
 */
export function listKeys(): void {
    let wallet = new Wallet();
    if (!wallet.load()) {
        return;
    }
    wallet.listKeys();
}