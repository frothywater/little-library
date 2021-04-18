import { PrimitiveData } from "./typing";
export default class Database {
    private readonly connection;
    constructor(user: string, password: string, database?: string);
    connect(): Promise<void>;
    close(): Promise<void>;
    query<T>(sqlString: string, values?: PrimitiveData[]): Promise<T[]>;
    transaction(action: () => Promise<void>): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map