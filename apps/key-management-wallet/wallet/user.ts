import { Ledger, JSON, Context } from "@klave/sdk";
import { emit } from "../klave/types"

const UsersTable = "UsersTable";

@JSON
export class User {
    id: string;
    role: string;   // admin, user, etc.

    constructor(id: string) {
        this.id = id;
        this.role = "";
    }

    load() : boolean {
        let userTable = Ledger.getTable(UsersTable).get(this.id);
        if (userTable.length == 0) {
            emit("User does not exists. Create it first");
            return false;
        }
        let user = JSON.parse<User>(userTable);
        this.role = user.role;        
        emit("User loaded successfully: " + user.id);
        return true;
    }

    save(): void {
        let userTable = JSON.stringify<User>(this);
        Ledger.getTable(UsersTable).set(this.id, userTable);
        emit("User saved successfully: " + this.id);        
    }

    delete(): void {
        this.id = "";
        this.role = "";
        Ledger.getTable(UsersTable).unset(this.id);
        emit("User deleted successfully: " + this.id);
    }
}
