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
export class SignOutput {
    success: boolean;
    signature: string;
    constructor(success: boolean, signature: string) {
        this.success = success;
        this.signature = signature;
    }
}

@JSON 
export class EncryptOutput {
    success: boolean;
    cypher: string;
    constructor(success: boolean, cypher: string) {
        this.success = success;
        this.cypher = cypher;
    }
}

@JSON 
export class DecryptOutput {
    success: boolean;
    message: string;
    constructor(success: boolean, message: string) {
        this.success = success;
        this.message = message;
    }
}

@JSON
export class VerifyInput {
    keyId: string;
    payload: string;
    signature: string;    
}

@JSON
export class VerifyOutput {
    success: boolean;
    verified: boolean;    
    constructor(success: boolean, verified: boolean) {
        this.success = success;
        this.verified = verified;
    }
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

@JSON 
export class RemoveKeyInput {
    keyId: string;    
}

@JSON
export class ListKeysInput {
    user: string;
}

@JSON
export class ResetInput {
    keys: string[];
}
