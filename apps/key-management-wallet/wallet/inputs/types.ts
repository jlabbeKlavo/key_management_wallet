import { JSON } from "@klave/sdk";

@JSON
export class RenameWalletInput {
    newName: string;
}

@JSON
export class CreateWalletInput {
    name: string;
}

@JSON 
export class SignInput {
    keyId: string;
    payload: string;
}

@JSON
export class VerifyInput {
    keyId: string;
    payload: string;
    signature: string;
}

@JSON 
export class AddUserInput {
    userId: string;
    role: string;
}

@JSON 
export class AddKeyInput {
    description: string;
    type: string;
}