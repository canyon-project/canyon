
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Coverage
 * 
 */
export type Coverage = $Result.DefaultSelection<Prisma.$CoveragePayload>
/**
 * Model CoverageMap
 * 
 */
export type CoverageMap = $Result.DefaultSelection<Prisma.$CoverageMapPayload>
/**
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model Diff
 * 
 */
export type Diff = $Result.DefaultSelection<Prisma.$DiffPayload>
/**
 * Model Distributedlock
 * 
 */
export type Distributedlock = $Result.DefaultSelection<Prisma.$DistributedlockPayload>
/**
 * Model CoverageLog
 * 
 */
export type CoverageLog = $Result.DefaultSelection<Prisma.$CoverageLogPayload>
/**
 * Model Config
 * 
 */
export type Config = $Result.DefaultSelection<Prisma.$ConfigPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CovType: {
  BUILD_ID: 'BUILD_ID',
  REPORT_PROVIDER_AUTO: 'REPORT_PROVIDER_AUTO',
  REPORT_PROVIDER_MANUAL: 'REPORT_PROVIDER_MANUAL',
  REPORT_ID: 'REPORT_ID'
};

export type CovType = (typeof CovType)[keyof typeof CovType]


export const AggregatedState: {
  UNPROCESSED: 'UNPROCESSED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export type AggregatedState = (typeof AggregatedState)[keyof typeof AggregatedState]

}

export type CovType = $Enums.CovType

export const CovType: typeof $Enums.CovType

export type AggregatedState = $Enums.AggregatedState

export const AggregatedState: typeof $Enums.AggregatedState

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.coverage`: Exposes CRUD operations for the **Coverage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coverages
    * const coverages = await prisma.coverage.findMany()
    * ```
    */
  get coverage(): Prisma.CoverageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.coverageMap`: Exposes CRUD operations for the **CoverageMap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoverageMaps
    * const coverageMaps = await prisma.coverageMap.findMany()
    * ```
    */
  get coverageMap(): Prisma.CoverageMapDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.diff`: Exposes CRUD operations for the **Diff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Diffs
    * const diffs = await prisma.diff.findMany()
    * ```
    */
  get diff(): Prisma.DiffDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.distributedlock`: Exposes CRUD operations for the **Distributedlock** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Distributedlocks
    * const distributedlocks = await prisma.distributedlock.findMany()
    * ```
    */
  get distributedlock(): Prisma.DistributedlockDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.coverageLog`: Exposes CRUD operations for the **CoverageLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoverageLogs
    * const coverageLogs = await prisma.coverageLog.findMany()
    * ```
    */
  get coverageLog(): Prisma.CoverageLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.config`: Exposes CRUD operations for the **Config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Configs
    * const configs = await prisma.config.findMany()
    * ```
    */
  get config(): Prisma.ConfigDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Coverage: 'Coverage',
    CoverageMap: 'CoverageMap',
    Project: 'Project',
    Diff: 'Diff',
    Distributedlock: 'Distributedlock',
    CoverageLog: 'CoverageLog',
    Config: 'Config'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "coverage" | "coverageMap" | "project" | "diff" | "distributedlock" | "coverageLog" | "config"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Coverage: {
        payload: Prisma.$CoveragePayload<ExtArgs>
        fields: Prisma.CoverageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          findFirst: {
            args: Prisma.CoverageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          findMany: {
            args: Prisma.CoverageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>[]
          }
          create: {
            args: Prisma.CoverageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          createMany: {
            args: Prisma.CoverageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoverageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>[]
          }
          delete: {
            args: Prisma.CoverageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          update: {
            args: Prisma.CoverageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          deleteMany: {
            args: Prisma.CoverageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CoverageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>[]
          }
          upsert: {
            args: Prisma.CoverageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoveragePayload>
          }
          aggregate: {
            args: Prisma.CoverageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverage>
          }
          groupBy: {
            args: Prisma.CoverageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverageCountArgs<ExtArgs>
            result: $Utils.Optional<CoverageCountAggregateOutputType> | number
          }
        }
      }
      CoverageMap: {
        payload: Prisma.$CoverageMapPayload<ExtArgs>
        fields: Prisma.CoverageMapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverageMapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverageMapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          findFirst: {
            args: Prisma.CoverageMapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverageMapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          findMany: {
            args: Prisma.CoverageMapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>[]
          }
          create: {
            args: Prisma.CoverageMapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          createMany: {
            args: Prisma.CoverageMapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoverageMapCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>[]
          }
          delete: {
            args: Prisma.CoverageMapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          update: {
            args: Prisma.CoverageMapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          deleteMany: {
            args: Prisma.CoverageMapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverageMapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CoverageMapUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>[]
          }
          upsert: {
            args: Prisma.CoverageMapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapPayload>
          }
          aggregate: {
            args: Prisma.CoverageMapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverageMap>
          }
          groupBy: {
            args: Prisma.CoverageMapGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverageMapGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverageMapCountArgs<ExtArgs>
            result: $Utils.Optional<CoverageMapCountAggregateOutputType> | number
          }
        }
      }
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      Diff: {
        payload: Prisma.$DiffPayload<ExtArgs>
        fields: Prisma.DiffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DiffFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DiffFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          findFirst: {
            args: Prisma.DiffFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DiffFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          findMany: {
            args: Prisma.DiffFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>[]
          }
          create: {
            args: Prisma.DiffCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          createMany: {
            args: Prisma.DiffCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DiffCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>[]
          }
          delete: {
            args: Prisma.DiffDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          update: {
            args: Prisma.DiffUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          deleteMany: {
            args: Prisma.DiffDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DiffUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DiffUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>[]
          }
          upsert: {
            args: Prisma.DiffUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiffPayload>
          }
          aggregate: {
            args: Prisma.DiffAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiff>
          }
          groupBy: {
            args: Prisma.DiffGroupByArgs<ExtArgs>
            result: $Utils.Optional<DiffGroupByOutputType>[]
          }
          count: {
            args: Prisma.DiffCountArgs<ExtArgs>
            result: $Utils.Optional<DiffCountAggregateOutputType> | number
          }
        }
      }
      Distributedlock: {
        payload: Prisma.$DistributedlockPayload<ExtArgs>
        fields: Prisma.DistributedlockFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DistributedlockFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DistributedlockFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          findFirst: {
            args: Prisma.DistributedlockFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DistributedlockFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          findMany: {
            args: Prisma.DistributedlockFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>[]
          }
          create: {
            args: Prisma.DistributedlockCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          createMany: {
            args: Prisma.DistributedlockCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DistributedlockCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>[]
          }
          delete: {
            args: Prisma.DistributedlockDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          update: {
            args: Prisma.DistributedlockUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          deleteMany: {
            args: Prisma.DistributedlockDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DistributedlockUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DistributedlockUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>[]
          }
          upsert: {
            args: Prisma.DistributedlockUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DistributedlockPayload>
          }
          aggregate: {
            args: Prisma.DistributedlockAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDistributedlock>
          }
          groupBy: {
            args: Prisma.DistributedlockGroupByArgs<ExtArgs>
            result: $Utils.Optional<DistributedlockGroupByOutputType>[]
          }
          count: {
            args: Prisma.DistributedlockCountArgs<ExtArgs>
            result: $Utils.Optional<DistributedlockCountAggregateOutputType> | number
          }
        }
      }
      CoverageLog: {
        payload: Prisma.$CoverageLogPayload<ExtArgs>
        fields: Prisma.CoverageLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverageLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverageLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          findFirst: {
            args: Prisma.CoverageLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverageLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          findMany: {
            args: Prisma.CoverageLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>[]
          }
          create: {
            args: Prisma.CoverageLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          createMany: {
            args: Prisma.CoverageLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoverageLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>[]
          }
          delete: {
            args: Prisma.CoverageLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          update: {
            args: Prisma.CoverageLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          deleteMany: {
            args: Prisma.CoverageLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverageLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CoverageLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>[]
          }
          upsert: {
            args: Prisma.CoverageLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageLogPayload>
          }
          aggregate: {
            args: Prisma.CoverageLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverageLog>
          }
          groupBy: {
            args: Prisma.CoverageLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverageLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverageLogCountArgs<ExtArgs>
            result: $Utils.Optional<CoverageLogCountAggregateOutputType> | number
          }
        }
      }
      Config: {
        payload: Prisma.$ConfigPayload<ExtArgs>
        fields: Prisma.ConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findFirst: {
            args: Prisma.ConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          findMany: {
            args: Prisma.ConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          create: {
            args: Prisma.ConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          createMany: {
            args: Prisma.ConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          delete: {
            args: Prisma.ConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          update: {
            args: Prisma.ConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          deleteMany: {
            args: Prisma.ConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>[]
          }
          upsert: {
            args: Prisma.ConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfigPayload>
          }
          aggregate: {
            args: Prisma.ConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConfig>
          }
          groupBy: {
            args: Prisma.ConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ConfigCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    coverage?: CoverageOmit
    coverageMap?: CoverageMapOmit
    project?: ProjectOmit
    diff?: DiffOmit
    distributedlock?: DistributedlockOmit
    coverageLog?: CoverageLogOmit
    config?: ConfigOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    nickname: string | null
    avatar: string | null
    favor: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    nickname: string | null
    avatar: string | null
    favor: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    username: number
    password: number
    nickname: number
    avatar: number
    favor: number
    settings: number
    createdAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    nickname?: true
    avatar?: true
    favor?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    nickname?: true
    avatar?: true
    favor?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    nickname?: true
    avatar?: true
    favor?: true
    settings?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    username: string
    password: string
    nickname: string
    avatar: string
    favor: string
    settings: JsonValue
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    nickname?: boolean
    avatar?: boolean
    favor?: boolean
    settings?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    nickname?: boolean
    avatar?: boolean
    favor?: boolean
    settings?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    nickname?: boolean
    avatar?: boolean
    favor?: boolean
    settings?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    nickname?: boolean
    avatar?: boolean
    favor?: boolean
    settings?: boolean
    createdAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "username" | "password" | "nickname" | "avatar" | "favor" | "settings" | "createdAt", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      username: string
      password: string
      nickname: string
      avatar: string
      favor: string
      settings: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly nickname: FieldRef<"User", 'String'>
    readonly avatar: FieldRef<"User", 'String'>
    readonly favor: FieldRef<"User", 'String'>
    readonly settings: FieldRef<"User", 'Json'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Model Coverage
   */

  export type AggregateCoverage = {
    _count: CoverageCountAggregateOutputType | null
    _avg: CoverageAvgAggregateOutputType | null
    _sum: CoverageSumAggregateOutputType | null
    _min: CoverageMinAggregateOutputType | null
    _max: CoverageMaxAggregateOutputType | null
  }

  export type CoverageAvgAggregateOutputType = {
    branchesTotal: number | null
    branchesCovered: number | null
    functionsTotal: number | null
    functionsCovered: number | null
    linesTotal: number | null
    linesCovered: number | null
    statementsTotal: number | null
    statementsCovered: number | null
    newlinesTotal: number | null
    newlinesCovered: number | null
  }

  export type CoverageSumAggregateOutputType = {
    branchesTotal: number | null
    branchesCovered: number | null
    functionsTotal: number | null
    functionsCovered: number | null
    linesTotal: number | null
    linesCovered: number | null
    statementsTotal: number | null
    statementsCovered: number | null
    newlinesTotal: number | null
    newlinesCovered: number | null
  }

  export type CoverageMinAggregateOutputType = {
    id: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    projectID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    covType: $Enums.CovType | null
    scopeID: string | null
    branchesTotal: number | null
    branchesCovered: number | null
    functionsTotal: number | null
    functionsCovered: number | null
    linesTotal: number | null
    linesCovered: number | null
    statementsTotal: number | null
    statementsCovered: number | null
    newlinesTotal: number | null
    newlinesCovered: number | null
    summary: Uint8Array | null
    hit: Uint8Array | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageMaxAggregateOutputType = {
    id: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    projectID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    covType: $Enums.CovType | null
    scopeID: string | null
    branchesTotal: number | null
    branchesCovered: number | null
    functionsTotal: number | null
    functionsCovered: number | null
    linesTotal: number | null
    linesCovered: number | null
    statementsTotal: number | null
    statementsCovered: number | null
    newlinesTotal: number | null
    newlinesCovered: number | null
    summary: Uint8Array | null
    hit: Uint8Array | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageCountAggregateOutputType = {
    id: number
    sha: number
    branch: number
    compareTarget: number
    provider: number
    buildProvider: number
    buildID: number
    projectID: number
    reporter: number
    reportProvider: number
    reportID: number
    covType: number
    scopeID: number
    branchesTotal: number
    branchesCovered: number
    functionsTotal: number
    functionsCovered: number
    linesTotal: number
    linesCovered: number
    statementsTotal: number
    statementsCovered: number
    newlinesTotal: number
    newlinesCovered: number
    summary: number
    hit: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CoverageAvgAggregateInputType = {
    branchesTotal?: true
    branchesCovered?: true
    functionsTotal?: true
    functionsCovered?: true
    linesTotal?: true
    linesCovered?: true
    statementsTotal?: true
    statementsCovered?: true
    newlinesTotal?: true
    newlinesCovered?: true
  }

  export type CoverageSumAggregateInputType = {
    branchesTotal?: true
    branchesCovered?: true
    functionsTotal?: true
    functionsCovered?: true
    linesTotal?: true
    linesCovered?: true
    statementsTotal?: true
    statementsCovered?: true
    newlinesTotal?: true
    newlinesCovered?: true
  }

  export type CoverageMinAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    covType?: true
    scopeID?: true
    branchesTotal?: true
    branchesCovered?: true
    functionsTotal?: true
    functionsCovered?: true
    linesTotal?: true
    linesCovered?: true
    statementsTotal?: true
    statementsCovered?: true
    newlinesTotal?: true
    newlinesCovered?: true
    summary?: true
    hit?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageMaxAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    covType?: true
    scopeID?: true
    branchesTotal?: true
    branchesCovered?: true
    functionsTotal?: true
    functionsCovered?: true
    linesTotal?: true
    linesCovered?: true
    statementsTotal?: true
    statementsCovered?: true
    newlinesTotal?: true
    newlinesCovered?: true
    summary?: true
    hit?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageCountAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    covType?: true
    scopeID?: true
    branchesTotal?: true
    branchesCovered?: true
    functionsTotal?: true
    functionsCovered?: true
    linesTotal?: true
    linesCovered?: true
    statementsTotal?: true
    statementsCovered?: true
    newlinesTotal?: true
    newlinesCovered?: true
    summary?: true
    hit?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CoverageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coverage to aggregate.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Coverages
    **/
    _count?: true | CoverageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverageMaxAggregateInputType
  }

  export type GetCoverageAggregateType<T extends CoverageAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverage[P]>
      : GetScalarType<T[P], AggregateCoverage[P]>
  }




  export type CoverageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageWhereInput
    orderBy?: CoverageOrderByWithAggregationInput | CoverageOrderByWithAggregationInput[]
    by: CoverageScalarFieldEnum[] | CoverageScalarFieldEnum
    having?: CoverageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverageCountAggregateInputType | true
    _avg?: CoverageAvgAggregateInputType
    _sum?: CoverageSumAggregateInputType
    _min?: CoverageMinAggregateInputType
    _max?: CoverageMaxAggregateInputType
  }

  export type CoverageGroupByOutputType = {
    id: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    covType: $Enums.CovType
    scopeID: string
    branchesTotal: number
    branchesCovered: number
    functionsTotal: number
    functionsCovered: number
    linesTotal: number
    linesCovered: number
    statementsTotal: number
    statementsCovered: number
    newlinesTotal: number
    newlinesCovered: number
    summary: Uint8Array
    hit: Uint8Array
    createdAt: Date
    updatedAt: Date
    _count: CoverageCountAggregateOutputType | null
    _avg: CoverageAvgAggregateOutputType | null
    _sum: CoverageSumAggregateOutputType | null
    _min: CoverageMinAggregateOutputType | null
    _max: CoverageMaxAggregateOutputType | null
  }

  type GetCoverageGroupByPayload<T extends CoverageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverageGroupByOutputType[P]>
            : GetScalarType<T[P], CoverageGroupByOutputType[P]>
        }
      >
    >


  export type CoverageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    covType?: boolean
    scopeID?: boolean
    branchesTotal?: boolean
    branchesCovered?: boolean
    functionsTotal?: boolean
    functionsCovered?: boolean
    linesTotal?: boolean
    linesCovered?: boolean
    statementsTotal?: boolean
    statementsCovered?: boolean
    newlinesTotal?: boolean
    newlinesCovered?: boolean
    summary?: boolean
    hit?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    covType?: boolean
    scopeID?: boolean
    branchesTotal?: boolean
    branchesCovered?: boolean
    functionsTotal?: boolean
    functionsCovered?: boolean
    linesTotal?: boolean
    linesCovered?: boolean
    statementsTotal?: boolean
    statementsCovered?: boolean
    newlinesTotal?: boolean
    newlinesCovered?: boolean
    summary?: boolean
    hit?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    covType?: boolean
    scopeID?: boolean
    branchesTotal?: boolean
    branchesCovered?: boolean
    functionsTotal?: boolean
    functionsCovered?: boolean
    linesTotal?: boolean
    linesCovered?: boolean
    statementsTotal?: boolean
    statementsCovered?: boolean
    newlinesTotal?: boolean
    newlinesCovered?: boolean
    summary?: boolean
    hit?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectScalar = {
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    covType?: boolean
    scopeID?: boolean
    branchesTotal?: boolean
    branchesCovered?: boolean
    functionsTotal?: boolean
    functionsCovered?: boolean
    linesTotal?: boolean
    linesCovered?: boolean
    statementsTotal?: boolean
    statementsCovered?: boolean
    newlinesTotal?: boolean
    newlinesCovered?: boolean
    summary?: boolean
    hit?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CoverageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sha" | "branch" | "compareTarget" | "provider" | "buildProvider" | "buildID" | "projectID" | "reporter" | "reportProvider" | "reportID" | "covType" | "scopeID" | "branchesTotal" | "branchesCovered" | "functionsTotal" | "functionsCovered" | "linesTotal" | "linesCovered" | "statementsTotal" | "statementsCovered" | "newlinesTotal" | "newlinesCovered" | "summary" | "hit" | "createdAt" | "updatedAt", ExtArgs["result"]["coverage"]>

  export type $CoveragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Coverage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sha: string
      branch: string
      compareTarget: string
      provider: string
      buildProvider: string
      buildID: string
      projectID: string
      reporter: string
      reportProvider: string
      reportID: string
      covType: $Enums.CovType
      scopeID: string
      branchesTotal: number
      branchesCovered: number
      functionsTotal: number
      functionsCovered: number
      linesTotal: number
      linesCovered: number
      statementsTotal: number
      statementsCovered: number
      newlinesTotal: number
      newlinesCovered: number
      summary: Uint8Array
      hit: Uint8Array
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["coverage"]>
    composites: {}
  }

  type CoverageGetPayload<S extends boolean | null | undefined | CoverageDefaultArgs> = $Result.GetResult<Prisma.$CoveragePayload, S>

  type CoverageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CoverageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CoverageCountAggregateInputType | true
    }

  export interface CoverageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Coverage'], meta: { name: 'Coverage' } }
    /**
     * Find zero or one Coverage that matches the filter.
     * @param {CoverageFindUniqueArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverageFindUniqueArgs>(args: SelectSubset<T, CoverageFindUniqueArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Coverage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CoverageFindUniqueOrThrowArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverageFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Coverage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindFirstArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverageFindFirstArgs>(args?: SelectSubset<T, CoverageFindFirstArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Coverage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindFirstOrThrowArgs} args - Arguments to find a Coverage
     * @example
     * // Get one Coverage
     * const coverage = await prisma.coverage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverageFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Coverages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coverages
     * const coverages = await prisma.coverage.findMany()
     * 
     * // Get first 10 Coverages
     * const coverages = await prisma.coverage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverageWithIdOnly = await prisma.coverage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverageFindManyArgs>(args?: SelectSubset<T, CoverageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Coverage.
     * @param {CoverageCreateArgs} args - Arguments to create a Coverage.
     * @example
     * // Create one Coverage
     * const Coverage = await prisma.coverage.create({
     *   data: {
     *     // ... data to create a Coverage
     *   }
     * })
     * 
     */
    create<T extends CoverageCreateArgs>(args: SelectSubset<T, CoverageCreateArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Coverages.
     * @param {CoverageCreateManyArgs} args - Arguments to create many Coverages.
     * @example
     * // Create many Coverages
     * const coverage = await prisma.coverage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverageCreateManyArgs>(args?: SelectSubset<T, CoverageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Coverages and returns the data saved in the database.
     * @param {CoverageCreateManyAndReturnArgs} args - Arguments to create many Coverages.
     * @example
     * // Create many Coverages
     * const coverage = await prisma.coverage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Coverages and only return the `id`
     * const coverageWithIdOnly = await prisma.coverage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoverageCreateManyAndReturnArgs>(args?: SelectSubset<T, CoverageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Coverage.
     * @param {CoverageDeleteArgs} args - Arguments to delete one Coverage.
     * @example
     * // Delete one Coverage
     * const Coverage = await prisma.coverage.delete({
     *   where: {
     *     // ... filter to delete one Coverage
     *   }
     * })
     * 
     */
    delete<T extends CoverageDeleteArgs>(args: SelectSubset<T, CoverageDeleteArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Coverage.
     * @param {CoverageUpdateArgs} args - Arguments to update one Coverage.
     * @example
     * // Update one Coverage
     * const coverage = await prisma.coverage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverageUpdateArgs>(args: SelectSubset<T, CoverageUpdateArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Coverages.
     * @param {CoverageDeleteManyArgs} args - Arguments to filter Coverages to delete.
     * @example
     * // Delete a few Coverages
     * const { count } = await prisma.coverage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverageDeleteManyArgs>(args?: SelectSubset<T, CoverageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coverages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coverages
     * const coverage = await prisma.coverage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverageUpdateManyArgs>(args: SelectSubset<T, CoverageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coverages and returns the data updated in the database.
     * @param {CoverageUpdateManyAndReturnArgs} args - Arguments to update many Coverages.
     * @example
     * // Update many Coverages
     * const coverage = await prisma.coverage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Coverages and only return the `id`
     * const coverageWithIdOnly = await prisma.coverage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CoverageUpdateManyAndReturnArgs>(args: SelectSubset<T, CoverageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Coverage.
     * @param {CoverageUpsertArgs} args - Arguments to update or create a Coverage.
     * @example
     * // Update or create a Coverage
     * const coverage = await prisma.coverage.upsert({
     *   create: {
     *     // ... data to create a Coverage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coverage we want to update
     *   }
     * })
     */
    upsert<T extends CoverageUpsertArgs>(args: SelectSubset<T, CoverageUpsertArgs<ExtArgs>>): Prisma__CoverageClient<$Result.GetResult<Prisma.$CoveragePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Coverages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageCountArgs} args - Arguments to filter Coverages to count.
     * @example
     * // Count the number of Coverages
     * const count = await prisma.coverage.count({
     *   where: {
     *     // ... the filter for the Coverages we want to count
     *   }
     * })
    **/
    count<T extends CoverageCountArgs>(
      args?: Subset<T, CoverageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coverage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoverageAggregateArgs>(args: Subset<T, CoverageAggregateArgs>): Prisma.PrismaPromise<GetCoverageAggregateType<T>>

    /**
     * Group by Coverage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoverageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverageGroupByArgs['orderBy'] }
        : { orderBy?: CoverageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoverageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Coverage model
   */
  readonly fields: CoverageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Coverage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Coverage model
   */
  interface CoverageFieldRefs {
    readonly id: FieldRef<"Coverage", 'String'>
    readonly sha: FieldRef<"Coverage", 'String'>
    readonly branch: FieldRef<"Coverage", 'String'>
    readonly compareTarget: FieldRef<"Coverage", 'String'>
    readonly provider: FieldRef<"Coverage", 'String'>
    readonly buildProvider: FieldRef<"Coverage", 'String'>
    readonly buildID: FieldRef<"Coverage", 'String'>
    readonly projectID: FieldRef<"Coverage", 'String'>
    readonly reporter: FieldRef<"Coverage", 'String'>
    readonly reportProvider: FieldRef<"Coverage", 'String'>
    readonly reportID: FieldRef<"Coverage", 'String'>
    readonly covType: FieldRef<"Coverage", 'CovType'>
    readonly scopeID: FieldRef<"Coverage", 'String'>
    readonly branchesTotal: FieldRef<"Coverage", 'Int'>
    readonly branchesCovered: FieldRef<"Coverage", 'Int'>
    readonly functionsTotal: FieldRef<"Coverage", 'Int'>
    readonly functionsCovered: FieldRef<"Coverage", 'Int'>
    readonly linesTotal: FieldRef<"Coverage", 'Int'>
    readonly linesCovered: FieldRef<"Coverage", 'Int'>
    readonly statementsTotal: FieldRef<"Coverage", 'Int'>
    readonly statementsCovered: FieldRef<"Coverage", 'Int'>
    readonly newlinesTotal: FieldRef<"Coverage", 'Int'>
    readonly newlinesCovered: FieldRef<"Coverage", 'Int'>
    readonly summary: FieldRef<"Coverage", 'Bytes'>
    readonly hit: FieldRef<"Coverage", 'Bytes'>
    readonly createdAt: FieldRef<"Coverage", 'DateTime'>
    readonly updatedAt: FieldRef<"Coverage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Coverage findUnique
   */
  export type CoverageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage findUniqueOrThrow
   */
  export type CoverageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage findFirst
   */
  export type CoverageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coverages.
     */
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage findFirstOrThrow
   */
  export type CoverageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter, which Coverage to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coverages.
     */
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage findMany
   */
  export type CoverageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter, which Coverages to fetch.
     */
    where?: CoverageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coverages to fetch.
     */
    orderBy?: CoverageOrderByWithRelationInput | CoverageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Coverages.
     */
    cursor?: CoverageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coverages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coverages.
     */
    skip?: number
    distinct?: CoverageScalarFieldEnum | CoverageScalarFieldEnum[]
  }

  /**
   * Coverage create
   */
  export type CoverageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * The data needed to create a Coverage.
     */
    data: XOR<CoverageCreateInput, CoverageUncheckedCreateInput>
  }

  /**
   * Coverage createMany
   */
  export type CoverageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Coverages.
     */
    data: CoverageCreateManyInput | CoverageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Coverage createManyAndReturn
   */
  export type CoverageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * The data used to create many Coverages.
     */
    data: CoverageCreateManyInput | CoverageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Coverage update
   */
  export type CoverageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * The data needed to update a Coverage.
     */
    data: XOR<CoverageUpdateInput, CoverageUncheckedUpdateInput>
    /**
     * Choose, which Coverage to update.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage updateMany
   */
  export type CoverageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Coverages.
     */
    data: XOR<CoverageUpdateManyMutationInput, CoverageUncheckedUpdateManyInput>
    /**
     * Filter which Coverages to update
     */
    where?: CoverageWhereInput
    /**
     * Limit how many Coverages to update.
     */
    limit?: number
  }

  /**
   * Coverage updateManyAndReturn
   */
  export type CoverageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * The data used to update Coverages.
     */
    data: XOR<CoverageUpdateManyMutationInput, CoverageUncheckedUpdateManyInput>
    /**
     * Filter which Coverages to update
     */
    where?: CoverageWhereInput
    /**
     * Limit how many Coverages to update.
     */
    limit?: number
  }

  /**
   * Coverage upsert
   */
  export type CoverageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * The filter to search for the Coverage to update in case it exists.
     */
    where: CoverageWhereUniqueInput
    /**
     * In case the Coverage found by the `where` argument doesn't exist, create a new Coverage with this data.
     */
    create: XOR<CoverageCreateInput, CoverageUncheckedCreateInput>
    /**
     * In case the Coverage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverageUpdateInput, CoverageUncheckedUpdateInput>
  }

  /**
   * Coverage delete
   */
  export type CoverageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
    /**
     * Filter which Coverage to delete.
     */
    where: CoverageWhereUniqueInput
  }

  /**
   * Coverage deleteMany
   */
  export type CoverageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coverages to delete
     */
    where?: CoverageWhereInput
    /**
     * Limit how many Coverages to delete.
     */
    limit?: number
  }

  /**
   * Coverage without action
   */
  export type CoverageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coverage
     */
    select?: CoverageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coverage
     */
    omit?: CoverageOmit<ExtArgs> | null
  }


  /**
   * Model CoverageMap
   */

  export type AggregateCoverageMap = {
    _count: CoverageMapCountAggregateOutputType | null
    _avg: CoverageMapAvgAggregateOutputType | null
    _sum: CoverageMapSumAggregateOutputType | null
    _min: CoverageMapMinAggregateOutputType | null
    _max: CoverageMapMaxAggregateOutputType | null
  }

  export type CoverageMapAvgAggregateOutputType = {
    time: number | null
  }

  export type CoverageMapSumAggregateOutputType = {
    time: number | null
  }

  export type CoverageMapMinAggregateOutputType = {
    id: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    repoID: string | null
    sha: string | null
    path: string | null
    oldPath: string | null
    inputSourceMap: string | null
    branchMap: string | null
    statementMap: string | null
    fnMap: string | null
    instrumentCwd: string | null
    time: number | null
  }

  export type CoverageMapMaxAggregateOutputType = {
    id: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    repoID: string | null
    sha: string | null
    path: string | null
    oldPath: string | null
    inputSourceMap: string | null
    branchMap: string | null
    statementMap: string | null
    fnMap: string | null
    instrumentCwd: string | null
    time: number | null
  }

  export type CoverageMapCountAggregateOutputType = {
    id: number
    provider: number
    buildProvider: number
    buildID: number
    repoID: number
    sha: number
    path: number
    oldPath: number
    inputSourceMap: number
    branchMap: number
    statementMap: number
    fnMap: number
    instrumentCwd: number
    time: number
    _all: number
  }


  export type CoverageMapAvgAggregateInputType = {
    time?: true
  }

  export type CoverageMapSumAggregateInputType = {
    time?: true
  }

  export type CoverageMapMinAggregateInputType = {
    id?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    sha?: true
    path?: true
    oldPath?: true
    inputSourceMap?: true
    branchMap?: true
    statementMap?: true
    fnMap?: true
    instrumentCwd?: true
    time?: true
  }

  export type CoverageMapMaxAggregateInputType = {
    id?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    sha?: true
    path?: true
    oldPath?: true
    inputSourceMap?: true
    branchMap?: true
    statementMap?: true
    fnMap?: true
    instrumentCwd?: true
    time?: true
  }

  export type CoverageMapCountAggregateInputType = {
    id?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    sha?: true
    path?: true
    oldPath?: true
    inputSourceMap?: true
    branchMap?: true
    statementMap?: true
    fnMap?: true
    instrumentCwd?: true
    time?: true
    _all?: true
  }

  export type CoverageMapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageMap to aggregate.
     */
    where?: CoverageMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMaps to fetch.
     */
    orderBy?: CoverageMapOrderByWithRelationInput | CoverageMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverageMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CoverageMaps
    **/
    _count?: true | CoverageMapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverageMapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverageMapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverageMapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverageMapMaxAggregateInputType
  }

  export type GetCoverageMapAggregateType<T extends CoverageMapAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverageMap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverageMap[P]>
      : GetScalarType<T[P], AggregateCoverageMap[P]>
  }




  export type CoverageMapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageMapWhereInput
    orderBy?: CoverageMapOrderByWithAggregationInput | CoverageMapOrderByWithAggregationInput[]
    by: CoverageMapScalarFieldEnum[] | CoverageMapScalarFieldEnum
    having?: CoverageMapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverageMapCountAggregateInputType | true
    _avg?: CoverageMapAvgAggregateInputType
    _sum?: CoverageMapSumAggregateInputType
    _min?: CoverageMapMinAggregateInputType
    _max?: CoverageMapMaxAggregateInputType
  }

  export type CoverageMapGroupByOutputType = {
    id: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    sha: string
    path: string
    oldPath: string
    inputSourceMap: string
    branchMap: string
    statementMap: string
    fnMap: string
    instrumentCwd: string
    time: number
    _count: CoverageMapCountAggregateOutputType | null
    _avg: CoverageMapAvgAggregateOutputType | null
    _sum: CoverageMapSumAggregateOutputType | null
    _min: CoverageMapMinAggregateOutputType | null
    _max: CoverageMapMaxAggregateOutputType | null
  }

  type GetCoverageMapGroupByPayload<T extends CoverageMapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverageMapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverageMapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverageMapGroupByOutputType[P]>
            : GetScalarType<T[P], CoverageMapGroupByOutputType[P]>
        }
      >
    >


  export type CoverageMapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    sha?: boolean
    path?: boolean
    oldPath?: boolean
    inputSourceMap?: boolean
    branchMap?: boolean
    statementMap?: boolean
    fnMap?: boolean
    instrumentCwd?: boolean
    time?: boolean
  }, ExtArgs["result"]["coverageMap"]>

  export type CoverageMapSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    sha?: boolean
    path?: boolean
    oldPath?: boolean
    inputSourceMap?: boolean
    branchMap?: boolean
    statementMap?: boolean
    fnMap?: boolean
    instrumentCwd?: boolean
    time?: boolean
  }, ExtArgs["result"]["coverageMap"]>

  export type CoverageMapSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    sha?: boolean
    path?: boolean
    oldPath?: boolean
    inputSourceMap?: boolean
    branchMap?: boolean
    statementMap?: boolean
    fnMap?: boolean
    instrumentCwd?: boolean
    time?: boolean
  }, ExtArgs["result"]["coverageMap"]>

  export type CoverageMapSelectScalar = {
    id?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    sha?: boolean
    path?: boolean
    oldPath?: boolean
    inputSourceMap?: boolean
    branchMap?: boolean
    statementMap?: boolean
    fnMap?: boolean
    instrumentCwd?: boolean
    time?: boolean
  }

  export type CoverageMapOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "provider" | "buildProvider" | "buildID" | "repoID" | "sha" | "path" | "oldPath" | "inputSourceMap" | "branchMap" | "statementMap" | "fnMap" | "instrumentCwd" | "time", ExtArgs["result"]["coverageMap"]>

  export type $CoverageMapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CoverageMap"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      provider: string
      buildProvider: string
      buildID: string
      repoID: string
      sha: string
      path: string
      oldPath: string
      inputSourceMap: string
      branchMap: string
      statementMap: string
      fnMap: string
      instrumentCwd: string
      time: number
    }, ExtArgs["result"]["coverageMap"]>
    composites: {}
  }

  type CoverageMapGetPayload<S extends boolean | null | undefined | CoverageMapDefaultArgs> = $Result.GetResult<Prisma.$CoverageMapPayload, S>

  type CoverageMapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CoverageMapFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CoverageMapCountAggregateInputType | true
    }

  export interface CoverageMapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CoverageMap'], meta: { name: 'CoverageMap' } }
    /**
     * Find zero or one CoverageMap that matches the filter.
     * @param {CoverageMapFindUniqueArgs} args - Arguments to find a CoverageMap
     * @example
     * // Get one CoverageMap
     * const coverageMap = await prisma.coverageMap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverageMapFindUniqueArgs>(args: SelectSubset<T, CoverageMapFindUniqueArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CoverageMap that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CoverageMapFindUniqueOrThrowArgs} args - Arguments to find a CoverageMap
     * @example
     * // Get one CoverageMap
     * const coverageMap = await prisma.coverageMap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverageMapFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverageMapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageMap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapFindFirstArgs} args - Arguments to find a CoverageMap
     * @example
     * // Get one CoverageMap
     * const coverageMap = await prisma.coverageMap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverageMapFindFirstArgs>(args?: SelectSubset<T, CoverageMapFindFirstArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageMap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapFindFirstOrThrowArgs} args - Arguments to find a CoverageMap
     * @example
     * // Get one CoverageMap
     * const coverageMap = await prisma.coverageMap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverageMapFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverageMapFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CoverageMaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoverageMaps
     * const coverageMaps = await prisma.coverageMap.findMany()
     * 
     * // Get first 10 CoverageMaps
     * const coverageMaps = await prisma.coverageMap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverageMapWithIdOnly = await prisma.coverageMap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverageMapFindManyArgs>(args?: SelectSubset<T, CoverageMapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CoverageMap.
     * @param {CoverageMapCreateArgs} args - Arguments to create a CoverageMap.
     * @example
     * // Create one CoverageMap
     * const CoverageMap = await prisma.coverageMap.create({
     *   data: {
     *     // ... data to create a CoverageMap
     *   }
     * })
     * 
     */
    create<T extends CoverageMapCreateArgs>(args: SelectSubset<T, CoverageMapCreateArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CoverageMaps.
     * @param {CoverageMapCreateManyArgs} args - Arguments to create many CoverageMaps.
     * @example
     * // Create many CoverageMaps
     * const coverageMap = await prisma.coverageMap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverageMapCreateManyArgs>(args?: SelectSubset<T, CoverageMapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CoverageMaps and returns the data saved in the database.
     * @param {CoverageMapCreateManyAndReturnArgs} args - Arguments to create many CoverageMaps.
     * @example
     * // Create many CoverageMaps
     * const coverageMap = await prisma.coverageMap.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CoverageMaps and only return the `id`
     * const coverageMapWithIdOnly = await prisma.coverageMap.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoverageMapCreateManyAndReturnArgs>(args?: SelectSubset<T, CoverageMapCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CoverageMap.
     * @param {CoverageMapDeleteArgs} args - Arguments to delete one CoverageMap.
     * @example
     * // Delete one CoverageMap
     * const CoverageMap = await prisma.coverageMap.delete({
     *   where: {
     *     // ... filter to delete one CoverageMap
     *   }
     * })
     * 
     */
    delete<T extends CoverageMapDeleteArgs>(args: SelectSubset<T, CoverageMapDeleteArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CoverageMap.
     * @param {CoverageMapUpdateArgs} args - Arguments to update one CoverageMap.
     * @example
     * // Update one CoverageMap
     * const coverageMap = await prisma.coverageMap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverageMapUpdateArgs>(args: SelectSubset<T, CoverageMapUpdateArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CoverageMaps.
     * @param {CoverageMapDeleteManyArgs} args - Arguments to filter CoverageMaps to delete.
     * @example
     * // Delete a few CoverageMaps
     * const { count } = await prisma.coverageMap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverageMapDeleteManyArgs>(args?: SelectSubset<T, CoverageMapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoverageMaps
     * const coverageMap = await prisma.coverageMap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverageMapUpdateManyArgs>(args: SelectSubset<T, CoverageMapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageMaps and returns the data updated in the database.
     * @param {CoverageMapUpdateManyAndReturnArgs} args - Arguments to update many CoverageMaps.
     * @example
     * // Update many CoverageMaps
     * const coverageMap = await prisma.coverageMap.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CoverageMaps and only return the `id`
     * const coverageMapWithIdOnly = await prisma.coverageMap.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CoverageMapUpdateManyAndReturnArgs>(args: SelectSubset<T, CoverageMapUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CoverageMap.
     * @param {CoverageMapUpsertArgs} args - Arguments to update or create a CoverageMap.
     * @example
     * // Update or create a CoverageMap
     * const coverageMap = await prisma.coverageMap.upsert({
     *   create: {
     *     // ... data to create a CoverageMap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoverageMap we want to update
     *   }
     * })
     */
    upsert<T extends CoverageMapUpsertArgs>(args: SelectSubset<T, CoverageMapUpsertArgs<ExtArgs>>): Prisma__CoverageMapClient<$Result.GetResult<Prisma.$CoverageMapPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CoverageMaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapCountArgs} args - Arguments to filter CoverageMaps to count.
     * @example
     * // Count the number of CoverageMaps
     * const count = await prisma.coverageMap.count({
     *   where: {
     *     // ... the filter for the CoverageMaps we want to count
     *   }
     * })
    **/
    count<T extends CoverageMapCountArgs>(
      args?: Subset<T, CoverageMapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverageMapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoverageMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoverageMapAggregateArgs>(args: Subset<T, CoverageMapAggregateArgs>): Prisma.PrismaPromise<GetCoverageMapAggregateType<T>>

    /**
     * Group by CoverageMap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoverageMapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverageMapGroupByArgs['orderBy'] }
        : { orderBy?: CoverageMapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoverageMapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverageMapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CoverageMap model
   */
  readonly fields: CoverageMapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CoverageMap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverageMapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CoverageMap model
   */
  interface CoverageMapFieldRefs {
    readonly id: FieldRef<"CoverageMap", 'String'>
    readonly provider: FieldRef<"CoverageMap", 'String'>
    readonly buildProvider: FieldRef<"CoverageMap", 'String'>
    readonly buildID: FieldRef<"CoverageMap", 'String'>
    readonly repoID: FieldRef<"CoverageMap", 'String'>
    readonly sha: FieldRef<"CoverageMap", 'String'>
    readonly path: FieldRef<"CoverageMap", 'String'>
    readonly oldPath: FieldRef<"CoverageMap", 'String'>
    readonly inputSourceMap: FieldRef<"CoverageMap", 'String'>
    readonly branchMap: FieldRef<"CoverageMap", 'String'>
    readonly statementMap: FieldRef<"CoverageMap", 'String'>
    readonly fnMap: FieldRef<"CoverageMap", 'String'>
    readonly instrumentCwd: FieldRef<"CoverageMap", 'String'>
    readonly time: FieldRef<"CoverageMap", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CoverageMap findUnique
   */
  export type CoverageMapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMap to fetch.
     */
    where: CoverageMapWhereUniqueInput
  }

  /**
   * CoverageMap findUniqueOrThrow
   */
  export type CoverageMapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMap to fetch.
     */
    where: CoverageMapWhereUniqueInput
  }

  /**
   * CoverageMap findFirst
   */
  export type CoverageMapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMap to fetch.
     */
    where?: CoverageMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMaps to fetch.
     */
    orderBy?: CoverageMapOrderByWithRelationInput | CoverageMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageMaps.
     */
    cursor?: CoverageMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageMaps.
     */
    distinct?: CoverageMapScalarFieldEnum | CoverageMapScalarFieldEnum[]
  }

  /**
   * CoverageMap findFirstOrThrow
   */
  export type CoverageMapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMap to fetch.
     */
    where?: CoverageMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMaps to fetch.
     */
    orderBy?: CoverageMapOrderByWithRelationInput | CoverageMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageMaps.
     */
    cursor?: CoverageMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageMaps.
     */
    distinct?: CoverageMapScalarFieldEnum | CoverageMapScalarFieldEnum[]
  }

  /**
   * CoverageMap findMany
   */
  export type CoverageMapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMaps to fetch.
     */
    where?: CoverageMapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMaps to fetch.
     */
    orderBy?: CoverageMapOrderByWithRelationInput | CoverageMapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CoverageMaps.
     */
    cursor?: CoverageMapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMaps.
     */
    skip?: number
    distinct?: CoverageMapScalarFieldEnum | CoverageMapScalarFieldEnum[]
  }

  /**
   * CoverageMap create
   */
  export type CoverageMapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * The data needed to create a CoverageMap.
     */
    data: XOR<CoverageMapCreateInput, CoverageMapUncheckedCreateInput>
  }

  /**
   * CoverageMap createMany
   */
  export type CoverageMapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CoverageMaps.
     */
    data: CoverageMapCreateManyInput | CoverageMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageMap createManyAndReturn
   */
  export type CoverageMapCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * The data used to create many CoverageMaps.
     */
    data: CoverageMapCreateManyInput | CoverageMapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageMap update
   */
  export type CoverageMapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * The data needed to update a CoverageMap.
     */
    data: XOR<CoverageMapUpdateInput, CoverageMapUncheckedUpdateInput>
    /**
     * Choose, which CoverageMap to update.
     */
    where: CoverageMapWhereUniqueInput
  }

  /**
   * CoverageMap updateMany
   */
  export type CoverageMapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CoverageMaps.
     */
    data: XOR<CoverageMapUpdateManyMutationInput, CoverageMapUncheckedUpdateManyInput>
    /**
     * Filter which CoverageMaps to update
     */
    where?: CoverageMapWhereInput
    /**
     * Limit how many CoverageMaps to update.
     */
    limit?: number
  }

  /**
   * CoverageMap updateManyAndReturn
   */
  export type CoverageMapUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * The data used to update CoverageMaps.
     */
    data: XOR<CoverageMapUpdateManyMutationInput, CoverageMapUncheckedUpdateManyInput>
    /**
     * Filter which CoverageMaps to update
     */
    where?: CoverageMapWhereInput
    /**
     * Limit how many CoverageMaps to update.
     */
    limit?: number
  }

  /**
   * CoverageMap upsert
   */
  export type CoverageMapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * The filter to search for the CoverageMap to update in case it exists.
     */
    where: CoverageMapWhereUniqueInput
    /**
     * In case the CoverageMap found by the `where` argument doesn't exist, create a new CoverageMap with this data.
     */
    create: XOR<CoverageMapCreateInput, CoverageMapUncheckedCreateInput>
    /**
     * In case the CoverageMap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverageMapUpdateInput, CoverageMapUncheckedUpdateInput>
  }

  /**
   * CoverageMap delete
   */
  export type CoverageMapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
    /**
     * Filter which CoverageMap to delete.
     */
    where: CoverageMapWhereUniqueInput
  }

  /**
   * CoverageMap deleteMany
   */
  export type CoverageMapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageMaps to delete
     */
    where?: CoverageMapWhereInput
    /**
     * Limit how many CoverageMaps to delete.
     */
    limit?: number
  }

  /**
   * CoverageMap without action
   */
  export type CoverageMapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMap
     */
    select?: CoverageMapSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMap
     */
    omit?: CoverageMapOmit<ExtArgs> | null
  }


  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectMinAggregateOutputType = {
    id: string | null
    pathWithNamespace: string | null
    description: string | null
    bu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: string | null
    pathWithNamespace: string | null
    description: string | null
    bu: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    pathWithNamespace: number
    description: number
    bu: number
    tags: number
    members: number
    scopes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProjectMinAggregateInputType = {
    id?: true
    pathWithNamespace?: true
    description?: true
    bu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    pathWithNamespace?: true
    description?: true
    bu?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    pathWithNamespace?: true
    description?: true
    bu?: true
    tags?: true
    members?: true
    scopes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: string
    pathWithNamespace: string
    description: string
    bu: string
    tags: JsonValue
    members: JsonValue
    scopes: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: ProjectCountAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pathWithNamespace?: boolean
    description?: boolean
    bu?: boolean
    tags?: boolean
    members?: boolean
    scopes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pathWithNamespace?: boolean
    description?: boolean
    bu?: boolean
    tags?: boolean
    members?: boolean
    scopes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pathWithNamespace?: boolean
    description?: boolean
    bu?: boolean
    tags?: boolean
    members?: boolean
    scopes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    pathWithNamespace?: boolean
    description?: boolean
    bu?: boolean
    tags?: boolean
    members?: boolean
    scopes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pathWithNamespace" | "description" | "bu" | "tags" | "members" | "scopes" | "createdAt" | "updatedAt", ExtArgs["result"]["project"]>

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      pathWithNamespace: string
      description: string
      bu: string
      tags: Prisma.JsonValue
      members: Prisma.JsonValue
      scopes: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     * 
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     * 
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     * 
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'String'>
    readonly pathWithNamespace: FieldRef<"Project", 'String'>
    readonly description: FieldRef<"Project", 'String'>
    readonly bu: FieldRef<"Project", 'String'>
    readonly tags: FieldRef<"Project", 'Json'>
    readonly members: FieldRef<"Project", 'Json'>
    readonly scopes: FieldRef<"Project", 'Json'>
    readonly createdAt: FieldRef<"Project", 'DateTime'>
    readonly updatedAt: FieldRef<"Project", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
  }


  /**
   * Model Diff
   */

  export type AggregateDiff = {
    _count: DiffCountAggregateOutputType | null
    _avg: DiffAvgAggregateOutputType | null
    _sum: DiffSumAggregateOutputType | null
    _min: DiffMinAggregateOutputType | null
    _max: DiffMaxAggregateOutputType | null
  }

  export type DiffAvgAggregateOutputType = {
    additions: number | null
    deletions: number | null
  }

  export type DiffSumAggregateOutputType = {
    additions: number[]
    deletions: number[]
  }

  export type DiffMinAggregateOutputType = {
    id: string | null
    provider: string | null
    repoID: string | null
    compareTarget: string | null
    sha: string | null
    path: string | null
    createdAt: Date | null
  }

  export type DiffMaxAggregateOutputType = {
    id: string | null
    provider: string | null
    repoID: string | null
    compareTarget: string | null
    sha: string | null
    path: string | null
    createdAt: Date | null
  }

  export type DiffCountAggregateOutputType = {
    id: number
    provider: number
    repoID: number
    compareTarget: number
    sha: number
    path: number
    additions: number
    deletions: number
    createdAt: number
    _all: number
  }


  export type DiffAvgAggregateInputType = {
    additions?: true
    deletions?: true
  }

  export type DiffSumAggregateInputType = {
    additions?: true
    deletions?: true
  }

  export type DiffMinAggregateInputType = {
    id?: true
    provider?: true
    repoID?: true
    compareTarget?: true
    sha?: true
    path?: true
    createdAt?: true
  }

  export type DiffMaxAggregateInputType = {
    id?: true
    provider?: true
    repoID?: true
    compareTarget?: true
    sha?: true
    path?: true
    createdAt?: true
  }

  export type DiffCountAggregateInputType = {
    id?: true
    provider?: true
    repoID?: true
    compareTarget?: true
    sha?: true
    path?: true
    additions?: true
    deletions?: true
    createdAt?: true
    _all?: true
  }

  export type DiffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Diff to aggregate.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Diffs
    **/
    _count?: true | DiffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DiffAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DiffSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DiffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DiffMaxAggregateInputType
  }

  export type GetDiffAggregateType<T extends DiffAggregateArgs> = {
        [P in keyof T & keyof AggregateDiff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiff[P]>
      : GetScalarType<T[P], AggregateDiff[P]>
  }




  export type DiffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiffWhereInput
    orderBy?: DiffOrderByWithAggregationInput | DiffOrderByWithAggregationInput[]
    by: DiffScalarFieldEnum[] | DiffScalarFieldEnum
    having?: DiffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DiffCountAggregateInputType | true
    _avg?: DiffAvgAggregateInputType
    _sum?: DiffSumAggregateInputType
    _min?: DiffMinAggregateInputType
    _max?: DiffMaxAggregateInputType
  }

  export type DiffGroupByOutputType = {
    id: string
    provider: string
    repoID: string
    compareTarget: string
    sha: string
    path: string
    additions: number[]
    deletions: number[]
    createdAt: Date
    _count: DiffCountAggregateOutputType | null
    _avg: DiffAvgAggregateOutputType | null
    _sum: DiffSumAggregateOutputType | null
    _min: DiffMinAggregateOutputType | null
    _max: DiffMaxAggregateOutputType | null
  }

  type GetDiffGroupByPayload<T extends DiffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DiffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DiffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DiffGroupByOutputType[P]>
            : GetScalarType<T[P], DiffGroupByOutputType[P]>
        }
      >
    >


  export type DiffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    repoID?: boolean
    compareTarget?: boolean
    sha?: boolean
    path?: boolean
    additions?: boolean
    deletions?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["diff"]>

  export type DiffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    repoID?: boolean
    compareTarget?: boolean
    sha?: boolean
    path?: boolean
    additions?: boolean
    deletions?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["diff"]>

  export type DiffSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    repoID?: boolean
    compareTarget?: boolean
    sha?: boolean
    path?: boolean
    additions?: boolean
    deletions?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["diff"]>

  export type DiffSelectScalar = {
    id?: boolean
    provider?: boolean
    repoID?: boolean
    compareTarget?: boolean
    sha?: boolean
    path?: boolean
    additions?: boolean
    deletions?: boolean
    createdAt?: boolean
  }

  export type DiffOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "provider" | "repoID" | "compareTarget" | "sha" | "path" | "additions" | "deletions" | "createdAt", ExtArgs["result"]["diff"]>

  export type $DiffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Diff"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      provider: string
      repoID: string
      compareTarget: string
      sha: string
      path: string
      additions: number[]
      deletions: number[]
      createdAt: Date
    }, ExtArgs["result"]["diff"]>
    composites: {}
  }

  type DiffGetPayload<S extends boolean | null | undefined | DiffDefaultArgs> = $Result.GetResult<Prisma.$DiffPayload, S>

  type DiffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DiffFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DiffCountAggregateInputType | true
    }

  export interface DiffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Diff'], meta: { name: 'Diff' } }
    /**
     * Find zero or one Diff that matches the filter.
     * @param {DiffFindUniqueArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiffFindUniqueArgs>(args: SelectSubset<T, DiffFindUniqueArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Diff that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DiffFindUniqueOrThrowArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiffFindUniqueOrThrowArgs>(args: SelectSubset<T, DiffFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Diff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindFirstArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiffFindFirstArgs>(args?: SelectSubset<T, DiffFindFirstArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Diff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindFirstOrThrowArgs} args - Arguments to find a Diff
     * @example
     * // Get one Diff
     * const diff = await prisma.diff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiffFindFirstOrThrowArgs>(args?: SelectSubset<T, DiffFindFirstOrThrowArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Diffs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Diffs
     * const diffs = await prisma.diff.findMany()
     * 
     * // Get first 10 Diffs
     * const diffs = await prisma.diff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const diffWithIdOnly = await prisma.diff.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DiffFindManyArgs>(args?: SelectSubset<T, DiffFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Diff.
     * @param {DiffCreateArgs} args - Arguments to create a Diff.
     * @example
     * // Create one Diff
     * const Diff = await prisma.diff.create({
     *   data: {
     *     // ... data to create a Diff
     *   }
     * })
     * 
     */
    create<T extends DiffCreateArgs>(args: SelectSubset<T, DiffCreateArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Diffs.
     * @param {DiffCreateManyArgs} args - Arguments to create many Diffs.
     * @example
     * // Create many Diffs
     * const diff = await prisma.diff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DiffCreateManyArgs>(args?: SelectSubset<T, DiffCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Diffs and returns the data saved in the database.
     * @param {DiffCreateManyAndReturnArgs} args - Arguments to create many Diffs.
     * @example
     * // Create many Diffs
     * const diff = await prisma.diff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Diffs and only return the `id`
     * const diffWithIdOnly = await prisma.diff.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DiffCreateManyAndReturnArgs>(args?: SelectSubset<T, DiffCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Diff.
     * @param {DiffDeleteArgs} args - Arguments to delete one Diff.
     * @example
     * // Delete one Diff
     * const Diff = await prisma.diff.delete({
     *   where: {
     *     // ... filter to delete one Diff
     *   }
     * })
     * 
     */
    delete<T extends DiffDeleteArgs>(args: SelectSubset<T, DiffDeleteArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Diff.
     * @param {DiffUpdateArgs} args - Arguments to update one Diff.
     * @example
     * // Update one Diff
     * const diff = await prisma.diff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DiffUpdateArgs>(args: SelectSubset<T, DiffUpdateArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Diffs.
     * @param {DiffDeleteManyArgs} args - Arguments to filter Diffs to delete.
     * @example
     * // Delete a few Diffs
     * const { count } = await prisma.diff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DiffDeleteManyArgs>(args?: SelectSubset<T, DiffDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Diffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Diffs
     * const diff = await prisma.diff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DiffUpdateManyArgs>(args: SelectSubset<T, DiffUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Diffs and returns the data updated in the database.
     * @param {DiffUpdateManyAndReturnArgs} args - Arguments to update many Diffs.
     * @example
     * // Update many Diffs
     * const diff = await prisma.diff.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Diffs and only return the `id`
     * const diffWithIdOnly = await prisma.diff.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DiffUpdateManyAndReturnArgs>(args: SelectSubset<T, DiffUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Diff.
     * @param {DiffUpsertArgs} args - Arguments to update or create a Diff.
     * @example
     * // Update or create a Diff
     * const diff = await prisma.diff.upsert({
     *   create: {
     *     // ... data to create a Diff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Diff we want to update
     *   }
     * })
     */
    upsert<T extends DiffUpsertArgs>(args: SelectSubset<T, DiffUpsertArgs<ExtArgs>>): Prisma__DiffClient<$Result.GetResult<Prisma.$DiffPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Diffs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffCountArgs} args - Arguments to filter Diffs to count.
     * @example
     * // Count the number of Diffs
     * const count = await prisma.diff.count({
     *   where: {
     *     // ... the filter for the Diffs we want to count
     *   }
     * })
    **/
    count<T extends DiffCountArgs>(
      args?: Subset<T, DiffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DiffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Diff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DiffAggregateArgs>(args: Subset<T, DiffAggregateArgs>): Prisma.PrismaPromise<GetDiffAggregateType<T>>

    /**
     * Group by Diff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DiffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DiffGroupByArgs['orderBy'] }
        : { orderBy?: DiffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DiffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Diff model
   */
  readonly fields: DiffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Diff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DiffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Diff model
   */
  interface DiffFieldRefs {
    readonly id: FieldRef<"Diff", 'String'>
    readonly provider: FieldRef<"Diff", 'String'>
    readonly repoID: FieldRef<"Diff", 'String'>
    readonly compareTarget: FieldRef<"Diff", 'String'>
    readonly sha: FieldRef<"Diff", 'String'>
    readonly path: FieldRef<"Diff", 'String'>
    readonly additions: FieldRef<"Diff", 'Int[]'>
    readonly deletions: FieldRef<"Diff", 'Int[]'>
    readonly createdAt: FieldRef<"Diff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Diff findUnique
   */
  export type DiffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff findUniqueOrThrow
   */
  export type DiffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff findFirst
   */
  export type DiffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Diffs.
     */
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff findFirstOrThrow
   */
  export type DiffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter, which Diff to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Diffs.
     */
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff findMany
   */
  export type DiffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter, which Diffs to fetch.
     */
    where?: DiffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Diffs to fetch.
     */
    orderBy?: DiffOrderByWithRelationInput | DiffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Diffs.
     */
    cursor?: DiffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Diffs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Diffs.
     */
    skip?: number
    distinct?: DiffScalarFieldEnum | DiffScalarFieldEnum[]
  }

  /**
   * Diff create
   */
  export type DiffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * The data needed to create a Diff.
     */
    data: XOR<DiffCreateInput, DiffUncheckedCreateInput>
  }

  /**
   * Diff createMany
   */
  export type DiffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Diffs.
     */
    data: DiffCreateManyInput | DiffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Diff createManyAndReturn
   */
  export type DiffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * The data used to create many Diffs.
     */
    data: DiffCreateManyInput | DiffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Diff update
   */
  export type DiffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * The data needed to update a Diff.
     */
    data: XOR<DiffUpdateInput, DiffUncheckedUpdateInput>
    /**
     * Choose, which Diff to update.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff updateMany
   */
  export type DiffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Diffs.
     */
    data: XOR<DiffUpdateManyMutationInput, DiffUncheckedUpdateManyInput>
    /**
     * Filter which Diffs to update
     */
    where?: DiffWhereInput
    /**
     * Limit how many Diffs to update.
     */
    limit?: number
  }

  /**
   * Diff updateManyAndReturn
   */
  export type DiffUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * The data used to update Diffs.
     */
    data: XOR<DiffUpdateManyMutationInput, DiffUncheckedUpdateManyInput>
    /**
     * Filter which Diffs to update
     */
    where?: DiffWhereInput
    /**
     * Limit how many Diffs to update.
     */
    limit?: number
  }

  /**
   * Diff upsert
   */
  export type DiffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * The filter to search for the Diff to update in case it exists.
     */
    where: DiffWhereUniqueInput
    /**
     * In case the Diff found by the `where` argument doesn't exist, create a new Diff with this data.
     */
    create: XOR<DiffCreateInput, DiffUncheckedCreateInput>
    /**
     * In case the Diff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DiffUpdateInput, DiffUncheckedUpdateInput>
  }

  /**
   * Diff delete
   */
  export type DiffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
    /**
     * Filter which Diff to delete.
     */
    where: DiffWhereUniqueInput
  }

  /**
   * Diff deleteMany
   */
  export type DiffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Diffs to delete
     */
    where?: DiffWhereInput
    /**
     * Limit how many Diffs to delete.
     */
    limit?: number
  }

  /**
   * Diff without action
   */
  export type DiffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Diff
     */
    select?: DiffSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Diff
     */
    omit?: DiffOmit<ExtArgs> | null
  }


  /**
   * Model Distributedlock
   */

  export type AggregateDistributedlock = {
    _count: DistributedlockCountAggregateOutputType | null
    _min: DistributedlockMinAggregateOutputType | null
    _max: DistributedlockMaxAggregateOutputType | null
  }

  export type DistributedlockMinAggregateOutputType = {
    lockName: string | null
    isLocked: boolean | null
    lockTimestamp: Date | null
    lockExpiration: Date | null
  }

  export type DistributedlockMaxAggregateOutputType = {
    lockName: string | null
    isLocked: boolean | null
    lockTimestamp: Date | null
    lockExpiration: Date | null
  }

  export type DistributedlockCountAggregateOutputType = {
    lockName: number
    isLocked: number
    lockTimestamp: number
    lockExpiration: number
    _all: number
  }


  export type DistributedlockMinAggregateInputType = {
    lockName?: true
    isLocked?: true
    lockTimestamp?: true
    lockExpiration?: true
  }

  export type DistributedlockMaxAggregateInputType = {
    lockName?: true
    isLocked?: true
    lockTimestamp?: true
    lockExpiration?: true
  }

  export type DistributedlockCountAggregateInputType = {
    lockName?: true
    isLocked?: true
    lockTimestamp?: true
    lockExpiration?: true
    _all?: true
  }

  export type DistributedlockAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Distributedlock to aggregate.
     */
    where?: DistributedlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Distributedlocks to fetch.
     */
    orderBy?: DistributedlockOrderByWithRelationInput | DistributedlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DistributedlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Distributedlocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Distributedlocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Distributedlocks
    **/
    _count?: true | DistributedlockCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DistributedlockMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DistributedlockMaxAggregateInputType
  }

  export type GetDistributedlockAggregateType<T extends DistributedlockAggregateArgs> = {
        [P in keyof T & keyof AggregateDistributedlock]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDistributedlock[P]>
      : GetScalarType<T[P], AggregateDistributedlock[P]>
  }




  export type DistributedlockGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DistributedlockWhereInput
    orderBy?: DistributedlockOrderByWithAggregationInput | DistributedlockOrderByWithAggregationInput[]
    by: DistributedlockScalarFieldEnum[] | DistributedlockScalarFieldEnum
    having?: DistributedlockScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DistributedlockCountAggregateInputType | true
    _min?: DistributedlockMinAggregateInputType
    _max?: DistributedlockMaxAggregateInputType
  }

  export type DistributedlockGroupByOutputType = {
    lockName: string
    isLocked: boolean
    lockTimestamp: Date
    lockExpiration: Date
    _count: DistributedlockCountAggregateOutputType | null
    _min: DistributedlockMinAggregateOutputType | null
    _max: DistributedlockMaxAggregateOutputType | null
  }

  type GetDistributedlockGroupByPayload<T extends DistributedlockGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DistributedlockGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DistributedlockGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DistributedlockGroupByOutputType[P]>
            : GetScalarType<T[P], DistributedlockGroupByOutputType[P]>
        }
      >
    >


  export type DistributedlockSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    lockName?: boolean
    isLocked?: boolean
    lockTimestamp?: boolean
    lockExpiration?: boolean
  }, ExtArgs["result"]["distributedlock"]>

  export type DistributedlockSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    lockName?: boolean
    isLocked?: boolean
    lockTimestamp?: boolean
    lockExpiration?: boolean
  }, ExtArgs["result"]["distributedlock"]>

  export type DistributedlockSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    lockName?: boolean
    isLocked?: boolean
    lockTimestamp?: boolean
    lockExpiration?: boolean
  }, ExtArgs["result"]["distributedlock"]>

  export type DistributedlockSelectScalar = {
    lockName?: boolean
    isLocked?: boolean
    lockTimestamp?: boolean
    lockExpiration?: boolean
  }

  export type DistributedlockOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"lockName" | "isLocked" | "lockTimestamp" | "lockExpiration", ExtArgs["result"]["distributedlock"]>

  export type $DistributedlockPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Distributedlock"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      lockName: string
      isLocked: boolean
      lockTimestamp: Date
      lockExpiration: Date
    }, ExtArgs["result"]["distributedlock"]>
    composites: {}
  }

  type DistributedlockGetPayload<S extends boolean | null | undefined | DistributedlockDefaultArgs> = $Result.GetResult<Prisma.$DistributedlockPayload, S>

  type DistributedlockCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DistributedlockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DistributedlockCountAggregateInputType | true
    }

  export interface DistributedlockDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Distributedlock'], meta: { name: 'Distributedlock' } }
    /**
     * Find zero or one Distributedlock that matches the filter.
     * @param {DistributedlockFindUniqueArgs} args - Arguments to find a Distributedlock
     * @example
     * // Get one Distributedlock
     * const distributedlock = await prisma.distributedlock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DistributedlockFindUniqueArgs>(args: SelectSubset<T, DistributedlockFindUniqueArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Distributedlock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DistributedlockFindUniqueOrThrowArgs} args - Arguments to find a Distributedlock
     * @example
     * // Get one Distributedlock
     * const distributedlock = await prisma.distributedlock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DistributedlockFindUniqueOrThrowArgs>(args: SelectSubset<T, DistributedlockFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Distributedlock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockFindFirstArgs} args - Arguments to find a Distributedlock
     * @example
     * // Get one Distributedlock
     * const distributedlock = await prisma.distributedlock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DistributedlockFindFirstArgs>(args?: SelectSubset<T, DistributedlockFindFirstArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Distributedlock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockFindFirstOrThrowArgs} args - Arguments to find a Distributedlock
     * @example
     * // Get one Distributedlock
     * const distributedlock = await prisma.distributedlock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DistributedlockFindFirstOrThrowArgs>(args?: SelectSubset<T, DistributedlockFindFirstOrThrowArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Distributedlocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Distributedlocks
     * const distributedlocks = await prisma.distributedlock.findMany()
     * 
     * // Get first 10 Distributedlocks
     * const distributedlocks = await prisma.distributedlock.findMany({ take: 10 })
     * 
     * // Only select the `lockName`
     * const distributedlockWithLockNameOnly = await prisma.distributedlock.findMany({ select: { lockName: true } })
     * 
     */
    findMany<T extends DistributedlockFindManyArgs>(args?: SelectSubset<T, DistributedlockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Distributedlock.
     * @param {DistributedlockCreateArgs} args - Arguments to create a Distributedlock.
     * @example
     * // Create one Distributedlock
     * const Distributedlock = await prisma.distributedlock.create({
     *   data: {
     *     // ... data to create a Distributedlock
     *   }
     * })
     * 
     */
    create<T extends DistributedlockCreateArgs>(args: SelectSubset<T, DistributedlockCreateArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Distributedlocks.
     * @param {DistributedlockCreateManyArgs} args - Arguments to create many Distributedlocks.
     * @example
     * // Create many Distributedlocks
     * const distributedlock = await prisma.distributedlock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DistributedlockCreateManyArgs>(args?: SelectSubset<T, DistributedlockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Distributedlocks and returns the data saved in the database.
     * @param {DistributedlockCreateManyAndReturnArgs} args - Arguments to create many Distributedlocks.
     * @example
     * // Create many Distributedlocks
     * const distributedlock = await prisma.distributedlock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Distributedlocks and only return the `lockName`
     * const distributedlockWithLockNameOnly = await prisma.distributedlock.createManyAndReturn({
     *   select: { lockName: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DistributedlockCreateManyAndReturnArgs>(args?: SelectSubset<T, DistributedlockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Distributedlock.
     * @param {DistributedlockDeleteArgs} args - Arguments to delete one Distributedlock.
     * @example
     * // Delete one Distributedlock
     * const Distributedlock = await prisma.distributedlock.delete({
     *   where: {
     *     // ... filter to delete one Distributedlock
     *   }
     * })
     * 
     */
    delete<T extends DistributedlockDeleteArgs>(args: SelectSubset<T, DistributedlockDeleteArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Distributedlock.
     * @param {DistributedlockUpdateArgs} args - Arguments to update one Distributedlock.
     * @example
     * // Update one Distributedlock
     * const distributedlock = await prisma.distributedlock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DistributedlockUpdateArgs>(args: SelectSubset<T, DistributedlockUpdateArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Distributedlocks.
     * @param {DistributedlockDeleteManyArgs} args - Arguments to filter Distributedlocks to delete.
     * @example
     * // Delete a few Distributedlocks
     * const { count } = await prisma.distributedlock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DistributedlockDeleteManyArgs>(args?: SelectSubset<T, DistributedlockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Distributedlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Distributedlocks
     * const distributedlock = await prisma.distributedlock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DistributedlockUpdateManyArgs>(args: SelectSubset<T, DistributedlockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Distributedlocks and returns the data updated in the database.
     * @param {DistributedlockUpdateManyAndReturnArgs} args - Arguments to update many Distributedlocks.
     * @example
     * // Update many Distributedlocks
     * const distributedlock = await prisma.distributedlock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Distributedlocks and only return the `lockName`
     * const distributedlockWithLockNameOnly = await prisma.distributedlock.updateManyAndReturn({
     *   select: { lockName: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DistributedlockUpdateManyAndReturnArgs>(args: SelectSubset<T, DistributedlockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Distributedlock.
     * @param {DistributedlockUpsertArgs} args - Arguments to update or create a Distributedlock.
     * @example
     * // Update or create a Distributedlock
     * const distributedlock = await prisma.distributedlock.upsert({
     *   create: {
     *     // ... data to create a Distributedlock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Distributedlock we want to update
     *   }
     * })
     */
    upsert<T extends DistributedlockUpsertArgs>(args: SelectSubset<T, DistributedlockUpsertArgs<ExtArgs>>): Prisma__DistributedlockClient<$Result.GetResult<Prisma.$DistributedlockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Distributedlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockCountArgs} args - Arguments to filter Distributedlocks to count.
     * @example
     * // Count the number of Distributedlocks
     * const count = await prisma.distributedlock.count({
     *   where: {
     *     // ... the filter for the Distributedlocks we want to count
     *   }
     * })
    **/
    count<T extends DistributedlockCountArgs>(
      args?: Subset<T, DistributedlockCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DistributedlockCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Distributedlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DistributedlockAggregateArgs>(args: Subset<T, DistributedlockAggregateArgs>): Prisma.PrismaPromise<GetDistributedlockAggregateType<T>>

    /**
     * Group by Distributedlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DistributedlockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DistributedlockGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DistributedlockGroupByArgs['orderBy'] }
        : { orderBy?: DistributedlockGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DistributedlockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDistributedlockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Distributedlock model
   */
  readonly fields: DistributedlockFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Distributedlock.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DistributedlockClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Distributedlock model
   */
  interface DistributedlockFieldRefs {
    readonly lockName: FieldRef<"Distributedlock", 'String'>
    readonly isLocked: FieldRef<"Distributedlock", 'Boolean'>
    readonly lockTimestamp: FieldRef<"Distributedlock", 'DateTime'>
    readonly lockExpiration: FieldRef<"Distributedlock", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Distributedlock findUnique
   */
  export type DistributedlockFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter, which Distributedlock to fetch.
     */
    where: DistributedlockWhereUniqueInput
  }

  /**
   * Distributedlock findUniqueOrThrow
   */
  export type DistributedlockFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter, which Distributedlock to fetch.
     */
    where: DistributedlockWhereUniqueInput
  }

  /**
   * Distributedlock findFirst
   */
  export type DistributedlockFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter, which Distributedlock to fetch.
     */
    where?: DistributedlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Distributedlocks to fetch.
     */
    orderBy?: DistributedlockOrderByWithRelationInput | DistributedlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Distributedlocks.
     */
    cursor?: DistributedlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Distributedlocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Distributedlocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Distributedlocks.
     */
    distinct?: DistributedlockScalarFieldEnum | DistributedlockScalarFieldEnum[]
  }

  /**
   * Distributedlock findFirstOrThrow
   */
  export type DistributedlockFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter, which Distributedlock to fetch.
     */
    where?: DistributedlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Distributedlocks to fetch.
     */
    orderBy?: DistributedlockOrderByWithRelationInput | DistributedlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Distributedlocks.
     */
    cursor?: DistributedlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Distributedlocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Distributedlocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Distributedlocks.
     */
    distinct?: DistributedlockScalarFieldEnum | DistributedlockScalarFieldEnum[]
  }

  /**
   * Distributedlock findMany
   */
  export type DistributedlockFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter, which Distributedlocks to fetch.
     */
    where?: DistributedlockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Distributedlocks to fetch.
     */
    orderBy?: DistributedlockOrderByWithRelationInput | DistributedlockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Distributedlocks.
     */
    cursor?: DistributedlockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Distributedlocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Distributedlocks.
     */
    skip?: number
    distinct?: DistributedlockScalarFieldEnum | DistributedlockScalarFieldEnum[]
  }

  /**
   * Distributedlock create
   */
  export type DistributedlockCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * The data needed to create a Distributedlock.
     */
    data: XOR<DistributedlockCreateInput, DistributedlockUncheckedCreateInput>
  }

  /**
   * Distributedlock createMany
   */
  export type DistributedlockCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Distributedlocks.
     */
    data: DistributedlockCreateManyInput | DistributedlockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Distributedlock createManyAndReturn
   */
  export type DistributedlockCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * The data used to create many Distributedlocks.
     */
    data: DistributedlockCreateManyInput | DistributedlockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Distributedlock update
   */
  export type DistributedlockUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * The data needed to update a Distributedlock.
     */
    data: XOR<DistributedlockUpdateInput, DistributedlockUncheckedUpdateInput>
    /**
     * Choose, which Distributedlock to update.
     */
    where: DistributedlockWhereUniqueInput
  }

  /**
   * Distributedlock updateMany
   */
  export type DistributedlockUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Distributedlocks.
     */
    data: XOR<DistributedlockUpdateManyMutationInput, DistributedlockUncheckedUpdateManyInput>
    /**
     * Filter which Distributedlocks to update
     */
    where?: DistributedlockWhereInput
    /**
     * Limit how many Distributedlocks to update.
     */
    limit?: number
  }

  /**
   * Distributedlock updateManyAndReturn
   */
  export type DistributedlockUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * The data used to update Distributedlocks.
     */
    data: XOR<DistributedlockUpdateManyMutationInput, DistributedlockUncheckedUpdateManyInput>
    /**
     * Filter which Distributedlocks to update
     */
    where?: DistributedlockWhereInput
    /**
     * Limit how many Distributedlocks to update.
     */
    limit?: number
  }

  /**
   * Distributedlock upsert
   */
  export type DistributedlockUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * The filter to search for the Distributedlock to update in case it exists.
     */
    where: DistributedlockWhereUniqueInput
    /**
     * In case the Distributedlock found by the `where` argument doesn't exist, create a new Distributedlock with this data.
     */
    create: XOR<DistributedlockCreateInput, DistributedlockUncheckedCreateInput>
    /**
     * In case the Distributedlock was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DistributedlockUpdateInput, DistributedlockUncheckedUpdateInput>
  }

  /**
   * Distributedlock delete
   */
  export type DistributedlockDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
    /**
     * Filter which Distributedlock to delete.
     */
    where: DistributedlockWhereUniqueInput
  }

  /**
   * Distributedlock deleteMany
   */
  export type DistributedlockDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Distributedlocks to delete
     */
    where?: DistributedlockWhereInput
    /**
     * Limit how many Distributedlocks to delete.
     */
    limit?: number
  }

  /**
   * Distributedlock without action
   */
  export type DistributedlockDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Distributedlock
     */
    select?: DistributedlockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Distributedlock
     */
    omit?: DistributedlockOmit<ExtArgs> | null
  }


  /**
   * Model CoverageLog
   */

  export type AggregateCoverageLog = {
    _count: CoverageLogCountAggregateOutputType | null
    _avg: CoverageLogAvgAggregateOutputType | null
    _sum: CoverageLogSumAggregateOutputType | null
    _min: CoverageLogMinAggregateOutputType | null
    _max: CoverageLogMaxAggregateOutputType | null
  }

  export type CoverageLogAvgAggregateOutputType = {
    size: number | null
  }

  export type CoverageLogSumAggregateOutputType = {
    size: number | null
  }

  export type CoverageLogMinAggregateOutputType = {
    id: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    projectID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    isHitAndMapSeparated: boolean | null
    aggregatedState: $Enums.AggregatedState | null
    size: number | null
    instrumentCwd: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageLogMaxAggregateOutputType = {
    id: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    projectID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    isHitAndMapSeparated: boolean | null
    aggregatedState: $Enums.AggregatedState | null
    size: number | null
    instrumentCwd: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageLogCountAggregateOutputType = {
    id: number
    sha: number
    branch: number
    compareTarget: number
    provider: number
    buildProvider: number
    buildID: number
    projectID: number
    reporter: number
    reportProvider: number
    reportID: number
    isHitAndMapSeparated: number
    aggregatedState: number
    size: number
    instrumentCwd: number
    tags: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CoverageLogAvgAggregateInputType = {
    size?: true
  }

  export type CoverageLogSumAggregateInputType = {
    size?: true
  }

  export type CoverageLogMinAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    isHitAndMapSeparated?: true
    aggregatedState?: true
    size?: true
    instrumentCwd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageLogMaxAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    isHitAndMapSeparated?: true
    aggregatedState?: true
    size?: true
    instrumentCwd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageLogCountAggregateInputType = {
    id?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    projectID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    isHitAndMapSeparated?: true
    aggregatedState?: true
    size?: true
    instrumentCwd?: true
    tags?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CoverageLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageLog to aggregate.
     */
    where?: CoverageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageLogs to fetch.
     */
    orderBy?: CoverageLogOrderByWithRelationInput | CoverageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CoverageLogs
    **/
    _count?: true | CoverageLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverageLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverageLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverageLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverageLogMaxAggregateInputType
  }

  export type GetCoverageLogAggregateType<T extends CoverageLogAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverageLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverageLog[P]>
      : GetScalarType<T[P], AggregateCoverageLog[P]>
  }




  export type CoverageLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageLogWhereInput
    orderBy?: CoverageLogOrderByWithAggregationInput | CoverageLogOrderByWithAggregationInput[]
    by: CoverageLogScalarFieldEnum[] | CoverageLogScalarFieldEnum
    having?: CoverageLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverageLogCountAggregateInputType | true
    _avg?: CoverageLogAvgAggregateInputType
    _sum?: CoverageLogSumAggregateInputType
    _min?: CoverageLogMinAggregateInputType
    _max?: CoverageLogMaxAggregateInputType
  }

  export type CoverageLogGroupByOutputType = {
    id: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    isHitAndMapSeparated: boolean
    aggregatedState: $Enums.AggregatedState
    size: number
    instrumentCwd: string
    tags: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: CoverageLogCountAggregateOutputType | null
    _avg: CoverageLogAvgAggregateOutputType | null
    _sum: CoverageLogSumAggregateOutputType | null
    _min: CoverageLogMinAggregateOutputType | null
    _max: CoverageLogMaxAggregateOutputType | null
  }

  type GetCoverageLogGroupByPayload<T extends CoverageLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverageLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverageLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverageLogGroupByOutputType[P]>
            : GetScalarType<T[P], CoverageLogGroupByOutputType[P]>
        }
      >
    >


  export type CoverageLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    isHitAndMapSeparated?: boolean
    aggregatedState?: boolean
    size?: boolean
    instrumentCwd?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverageLog"]>

  export type CoverageLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    isHitAndMapSeparated?: boolean
    aggregatedState?: boolean
    size?: boolean
    instrumentCwd?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverageLog"]>

  export type CoverageLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    isHitAndMapSeparated?: boolean
    aggregatedState?: boolean
    size?: boolean
    instrumentCwd?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverageLog"]>

  export type CoverageLogSelectScalar = {
    id?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    projectID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    isHitAndMapSeparated?: boolean
    aggregatedState?: boolean
    size?: boolean
    instrumentCwd?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CoverageLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sha" | "branch" | "compareTarget" | "provider" | "buildProvider" | "buildID" | "projectID" | "reporter" | "reportProvider" | "reportID" | "isHitAndMapSeparated" | "aggregatedState" | "size" | "instrumentCwd" | "tags" | "createdAt" | "updatedAt", ExtArgs["result"]["coverageLog"]>

  export type $CoverageLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CoverageLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sha: string
      branch: string
      compareTarget: string
      provider: string
      buildProvider: string
      buildID: string
      projectID: string
      reporter: string
      reportProvider: string
      reportID: string
      isHitAndMapSeparated: boolean
      aggregatedState: $Enums.AggregatedState
      size: number
      instrumentCwd: string
      tags: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["coverageLog"]>
    composites: {}
  }

  type CoverageLogGetPayload<S extends boolean | null | undefined | CoverageLogDefaultArgs> = $Result.GetResult<Prisma.$CoverageLogPayload, S>

  type CoverageLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CoverageLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CoverageLogCountAggregateInputType | true
    }

  export interface CoverageLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CoverageLog'], meta: { name: 'CoverageLog' } }
    /**
     * Find zero or one CoverageLog that matches the filter.
     * @param {CoverageLogFindUniqueArgs} args - Arguments to find a CoverageLog
     * @example
     * // Get one CoverageLog
     * const coverageLog = await prisma.coverageLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverageLogFindUniqueArgs>(args: SelectSubset<T, CoverageLogFindUniqueArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CoverageLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CoverageLogFindUniqueOrThrowArgs} args - Arguments to find a CoverageLog
     * @example
     * // Get one CoverageLog
     * const coverageLog = await prisma.coverageLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverageLogFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverageLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogFindFirstArgs} args - Arguments to find a CoverageLog
     * @example
     * // Get one CoverageLog
     * const coverageLog = await prisma.coverageLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverageLogFindFirstArgs>(args?: SelectSubset<T, CoverageLogFindFirstArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogFindFirstOrThrowArgs} args - Arguments to find a CoverageLog
     * @example
     * // Get one CoverageLog
     * const coverageLog = await prisma.coverageLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverageLogFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverageLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CoverageLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoverageLogs
     * const coverageLogs = await prisma.coverageLog.findMany()
     * 
     * // Get first 10 CoverageLogs
     * const coverageLogs = await prisma.coverageLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverageLogWithIdOnly = await prisma.coverageLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverageLogFindManyArgs>(args?: SelectSubset<T, CoverageLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CoverageLog.
     * @param {CoverageLogCreateArgs} args - Arguments to create a CoverageLog.
     * @example
     * // Create one CoverageLog
     * const CoverageLog = await prisma.coverageLog.create({
     *   data: {
     *     // ... data to create a CoverageLog
     *   }
     * })
     * 
     */
    create<T extends CoverageLogCreateArgs>(args: SelectSubset<T, CoverageLogCreateArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CoverageLogs.
     * @param {CoverageLogCreateManyArgs} args - Arguments to create many CoverageLogs.
     * @example
     * // Create many CoverageLogs
     * const coverageLog = await prisma.coverageLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverageLogCreateManyArgs>(args?: SelectSubset<T, CoverageLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CoverageLogs and returns the data saved in the database.
     * @param {CoverageLogCreateManyAndReturnArgs} args - Arguments to create many CoverageLogs.
     * @example
     * // Create many CoverageLogs
     * const coverageLog = await prisma.coverageLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CoverageLogs and only return the `id`
     * const coverageLogWithIdOnly = await prisma.coverageLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoverageLogCreateManyAndReturnArgs>(args?: SelectSubset<T, CoverageLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CoverageLog.
     * @param {CoverageLogDeleteArgs} args - Arguments to delete one CoverageLog.
     * @example
     * // Delete one CoverageLog
     * const CoverageLog = await prisma.coverageLog.delete({
     *   where: {
     *     // ... filter to delete one CoverageLog
     *   }
     * })
     * 
     */
    delete<T extends CoverageLogDeleteArgs>(args: SelectSubset<T, CoverageLogDeleteArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CoverageLog.
     * @param {CoverageLogUpdateArgs} args - Arguments to update one CoverageLog.
     * @example
     * // Update one CoverageLog
     * const coverageLog = await prisma.coverageLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverageLogUpdateArgs>(args: SelectSubset<T, CoverageLogUpdateArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CoverageLogs.
     * @param {CoverageLogDeleteManyArgs} args - Arguments to filter CoverageLogs to delete.
     * @example
     * // Delete a few CoverageLogs
     * const { count } = await prisma.coverageLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverageLogDeleteManyArgs>(args?: SelectSubset<T, CoverageLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoverageLogs
     * const coverageLog = await prisma.coverageLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverageLogUpdateManyArgs>(args: SelectSubset<T, CoverageLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageLogs and returns the data updated in the database.
     * @param {CoverageLogUpdateManyAndReturnArgs} args - Arguments to update many CoverageLogs.
     * @example
     * // Update many CoverageLogs
     * const coverageLog = await prisma.coverageLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CoverageLogs and only return the `id`
     * const coverageLogWithIdOnly = await prisma.coverageLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CoverageLogUpdateManyAndReturnArgs>(args: SelectSubset<T, CoverageLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CoverageLog.
     * @param {CoverageLogUpsertArgs} args - Arguments to update or create a CoverageLog.
     * @example
     * // Update or create a CoverageLog
     * const coverageLog = await prisma.coverageLog.upsert({
     *   create: {
     *     // ... data to create a CoverageLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoverageLog we want to update
     *   }
     * })
     */
    upsert<T extends CoverageLogUpsertArgs>(args: SelectSubset<T, CoverageLogUpsertArgs<ExtArgs>>): Prisma__CoverageLogClient<$Result.GetResult<Prisma.$CoverageLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CoverageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogCountArgs} args - Arguments to filter CoverageLogs to count.
     * @example
     * // Count the number of CoverageLogs
     * const count = await prisma.coverageLog.count({
     *   where: {
     *     // ... the filter for the CoverageLogs we want to count
     *   }
     * })
    **/
    count<T extends CoverageLogCountArgs>(
      args?: Subset<T, CoverageLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverageLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoverageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoverageLogAggregateArgs>(args: Subset<T, CoverageLogAggregateArgs>): Prisma.PrismaPromise<GetCoverageLogAggregateType<T>>

    /**
     * Group by CoverageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoverageLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverageLogGroupByArgs['orderBy'] }
        : { orderBy?: CoverageLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoverageLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverageLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CoverageLog model
   */
  readonly fields: CoverageLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CoverageLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverageLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CoverageLog model
   */
  interface CoverageLogFieldRefs {
    readonly id: FieldRef<"CoverageLog", 'String'>
    readonly sha: FieldRef<"CoverageLog", 'String'>
    readonly branch: FieldRef<"CoverageLog", 'String'>
    readonly compareTarget: FieldRef<"CoverageLog", 'String'>
    readonly provider: FieldRef<"CoverageLog", 'String'>
    readonly buildProvider: FieldRef<"CoverageLog", 'String'>
    readonly buildID: FieldRef<"CoverageLog", 'String'>
    readonly projectID: FieldRef<"CoverageLog", 'String'>
    readonly reporter: FieldRef<"CoverageLog", 'String'>
    readonly reportProvider: FieldRef<"CoverageLog", 'String'>
    readonly reportID: FieldRef<"CoverageLog", 'String'>
    readonly isHitAndMapSeparated: FieldRef<"CoverageLog", 'Boolean'>
    readonly aggregatedState: FieldRef<"CoverageLog", 'AggregatedState'>
    readonly size: FieldRef<"CoverageLog", 'Int'>
    readonly instrumentCwd: FieldRef<"CoverageLog", 'String'>
    readonly tags: FieldRef<"CoverageLog", 'Json'>
    readonly createdAt: FieldRef<"CoverageLog", 'DateTime'>
    readonly updatedAt: FieldRef<"CoverageLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CoverageLog findUnique
   */
  export type CoverageLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter, which CoverageLog to fetch.
     */
    where: CoverageLogWhereUniqueInput
  }

  /**
   * CoverageLog findUniqueOrThrow
   */
  export type CoverageLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter, which CoverageLog to fetch.
     */
    where: CoverageLogWhereUniqueInput
  }

  /**
   * CoverageLog findFirst
   */
  export type CoverageLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter, which CoverageLog to fetch.
     */
    where?: CoverageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageLogs to fetch.
     */
    orderBy?: CoverageLogOrderByWithRelationInput | CoverageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageLogs.
     */
    cursor?: CoverageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageLogs.
     */
    distinct?: CoverageLogScalarFieldEnum | CoverageLogScalarFieldEnum[]
  }

  /**
   * CoverageLog findFirstOrThrow
   */
  export type CoverageLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter, which CoverageLog to fetch.
     */
    where?: CoverageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageLogs to fetch.
     */
    orderBy?: CoverageLogOrderByWithRelationInput | CoverageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageLogs.
     */
    cursor?: CoverageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageLogs.
     */
    distinct?: CoverageLogScalarFieldEnum | CoverageLogScalarFieldEnum[]
  }

  /**
   * CoverageLog findMany
   */
  export type CoverageLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter, which CoverageLogs to fetch.
     */
    where?: CoverageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageLogs to fetch.
     */
    orderBy?: CoverageLogOrderByWithRelationInput | CoverageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CoverageLogs.
     */
    cursor?: CoverageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageLogs.
     */
    skip?: number
    distinct?: CoverageLogScalarFieldEnum | CoverageLogScalarFieldEnum[]
  }

  /**
   * CoverageLog create
   */
  export type CoverageLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * The data needed to create a CoverageLog.
     */
    data: XOR<CoverageLogCreateInput, CoverageLogUncheckedCreateInput>
  }

  /**
   * CoverageLog createMany
   */
  export type CoverageLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CoverageLogs.
     */
    data: CoverageLogCreateManyInput | CoverageLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageLog createManyAndReturn
   */
  export type CoverageLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * The data used to create many CoverageLogs.
     */
    data: CoverageLogCreateManyInput | CoverageLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageLog update
   */
  export type CoverageLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * The data needed to update a CoverageLog.
     */
    data: XOR<CoverageLogUpdateInput, CoverageLogUncheckedUpdateInput>
    /**
     * Choose, which CoverageLog to update.
     */
    where: CoverageLogWhereUniqueInput
  }

  /**
   * CoverageLog updateMany
   */
  export type CoverageLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CoverageLogs.
     */
    data: XOR<CoverageLogUpdateManyMutationInput, CoverageLogUncheckedUpdateManyInput>
    /**
     * Filter which CoverageLogs to update
     */
    where?: CoverageLogWhereInput
    /**
     * Limit how many CoverageLogs to update.
     */
    limit?: number
  }

  /**
   * CoverageLog updateManyAndReturn
   */
  export type CoverageLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * The data used to update CoverageLogs.
     */
    data: XOR<CoverageLogUpdateManyMutationInput, CoverageLogUncheckedUpdateManyInput>
    /**
     * Filter which CoverageLogs to update
     */
    where?: CoverageLogWhereInput
    /**
     * Limit how many CoverageLogs to update.
     */
    limit?: number
  }

  /**
   * CoverageLog upsert
   */
  export type CoverageLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * The filter to search for the CoverageLog to update in case it exists.
     */
    where: CoverageLogWhereUniqueInput
    /**
     * In case the CoverageLog found by the `where` argument doesn't exist, create a new CoverageLog with this data.
     */
    create: XOR<CoverageLogCreateInput, CoverageLogUncheckedCreateInput>
    /**
     * In case the CoverageLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverageLogUpdateInput, CoverageLogUncheckedUpdateInput>
  }

  /**
   * CoverageLog delete
   */
  export type CoverageLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
    /**
     * Filter which CoverageLog to delete.
     */
    where: CoverageLogWhereUniqueInput
  }

  /**
   * CoverageLog deleteMany
   */
  export type CoverageLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageLogs to delete
     */
    where?: CoverageLogWhereInput
    /**
     * Limit how many CoverageLogs to delete.
     */
    limit?: number
  }

  /**
   * CoverageLog without action
   */
  export type CoverageLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageLog
     */
    select?: CoverageLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageLog
     */
    omit?: CoverageLogOmit<ExtArgs> | null
  }


  /**
   * Model Config
   */

  export type AggregateConfig = {
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  export type ConfigMinAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigMaxAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConfigCountAggregateOutputType = {
    id: number
    key: number
    value: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConfigMinAggregateInputType = {
    id?: true
    key?: true
    value?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigMaxAggregateInputType = {
    id?: true
    key?: true
    value?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConfigCountAggregateInputType = {
    id?: true
    key?: true
    value?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Config to aggregate.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Configs
    **/
    _count?: true | ConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfigMaxAggregateInputType
  }

  export type GetConfigAggregateType<T extends ConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfig[P]>
      : GetScalarType<T[P], AggregateConfig[P]>
  }




  export type ConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConfigWhereInput
    orderBy?: ConfigOrderByWithAggregationInput | ConfigOrderByWithAggregationInput[]
    by: ConfigScalarFieldEnum[] | ConfigScalarFieldEnum
    having?: ConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfigCountAggregateInputType | true
    _min?: ConfigMinAggregateInputType
    _max?: ConfigMaxAggregateInputType
  }

  export type ConfigGroupByOutputType = {
    id: string
    key: string
    value: string
    createdAt: Date
    updatedAt: Date
    _count: ConfigCountAggregateOutputType | null
    _min: ConfigMinAggregateOutputType | null
    _max: ConfigMaxAggregateOutputType | null
  }

  type GetConfigGroupByPayload<T extends ConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ConfigGroupByOutputType[P]>
        }
      >
    >


  export type ConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["config"]>

  export type ConfigSelectScalar = {
    id?: boolean
    key?: boolean
    value?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "value" | "createdAt" | "updatedAt", ExtArgs["result"]["config"]>

  export type $ConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Config"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      value: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["config"]>
    composites: {}
  }

  type ConfigGetPayload<S extends boolean | null | undefined | ConfigDefaultArgs> = $Result.GetResult<Prisma.$ConfigPayload, S>

  type ConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConfigCountAggregateInputType | true
    }

  export interface ConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Config'], meta: { name: 'Config' } }
    /**
     * Find zero or one Config that matches the filter.
     * @param {ConfigFindUniqueArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConfigFindUniqueArgs>(args: SelectSubset<T, ConfigFindUniqueArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Config that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConfigFindUniqueOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Config that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConfigFindFirstArgs>(args?: SelectSubset<T, ConfigFindFirstArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Config that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindFirstOrThrowArgs} args - Arguments to find a Config
     * @example
     * // Get one Config
     * const config = await prisma.config.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Configs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Configs
     * const configs = await prisma.config.findMany()
     * 
     * // Get first 10 Configs
     * const configs = await prisma.config.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const configWithIdOnly = await prisma.config.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConfigFindManyArgs>(args?: SelectSubset<T, ConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Config.
     * @param {ConfigCreateArgs} args - Arguments to create a Config.
     * @example
     * // Create one Config
     * const Config = await prisma.config.create({
     *   data: {
     *     // ... data to create a Config
     *   }
     * })
     * 
     */
    create<T extends ConfigCreateArgs>(args: SelectSubset<T, ConfigCreateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Configs.
     * @param {ConfigCreateManyArgs} args - Arguments to create many Configs.
     * @example
     * // Create many Configs
     * const config = await prisma.config.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConfigCreateManyArgs>(args?: SelectSubset<T, ConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Configs and returns the data saved in the database.
     * @param {ConfigCreateManyAndReturnArgs} args - Arguments to create many Configs.
     * @example
     * // Create many Configs
     * const config = await prisma.config.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Configs and only return the `id`
     * const configWithIdOnly = await prisma.config.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Config.
     * @param {ConfigDeleteArgs} args - Arguments to delete one Config.
     * @example
     * // Delete one Config
     * const Config = await prisma.config.delete({
     *   where: {
     *     // ... filter to delete one Config
     *   }
     * })
     * 
     */
    delete<T extends ConfigDeleteArgs>(args: SelectSubset<T, ConfigDeleteArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Config.
     * @param {ConfigUpdateArgs} args - Arguments to update one Config.
     * @example
     * // Update one Config
     * const config = await prisma.config.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConfigUpdateArgs>(args: SelectSubset<T, ConfigUpdateArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Configs.
     * @param {ConfigDeleteManyArgs} args - Arguments to filter Configs to delete.
     * @example
     * // Delete a few Configs
     * const { count } = await prisma.config.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConfigDeleteManyArgs>(args?: SelectSubset<T, ConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Configs
     * const config = await prisma.config.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConfigUpdateManyArgs>(args: SelectSubset<T, ConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configs and returns the data updated in the database.
     * @param {ConfigUpdateManyAndReturnArgs} args - Arguments to update many Configs.
     * @example
     * // Update many Configs
     * const config = await prisma.config.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Configs and only return the `id`
     * const configWithIdOnly = await prisma.config.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, ConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Config.
     * @param {ConfigUpsertArgs} args - Arguments to update or create a Config.
     * @example
     * // Update or create a Config
     * const config = await prisma.config.upsert({
     *   create: {
     *     // ... data to create a Config
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Config we want to update
     *   }
     * })
     */
    upsert<T extends ConfigUpsertArgs>(args: SelectSubset<T, ConfigUpsertArgs<ExtArgs>>): Prisma__ConfigClient<$Result.GetResult<Prisma.$ConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigCountArgs} args - Arguments to filter Configs to count.
     * @example
     * // Count the number of Configs
     * const count = await prisma.config.count({
     *   where: {
     *     // ... the filter for the Configs we want to count
     *   }
     * })
    **/
    count<T extends ConfigCountArgs>(
      args?: Subset<T, ConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfigAggregateArgs>(args: Subset<T, ConfigAggregateArgs>): Prisma.PrismaPromise<GetConfigAggregateType<T>>

    /**
     * Group by Config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfigGroupByArgs['orderBy'] }
        : { orderBy?: ConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Config model
   */
  readonly fields: ConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Config.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Config model
   */
  interface ConfigFieldRefs {
    readonly id: FieldRef<"Config", 'String'>
    readonly key: FieldRef<"Config", 'String'>
    readonly value: FieldRef<"Config", 'String'>
    readonly createdAt: FieldRef<"Config", 'DateTime'>
    readonly updatedAt: FieldRef<"Config", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Config findUnique
   */
  export type ConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findUniqueOrThrow
   */
  export type ConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config findFirst
   */
  export type ConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findFirstOrThrow
   */
  export type ConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Config to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configs.
     */
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config findMany
   */
  export type ConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter, which Configs to fetch.
     */
    where?: ConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configs to fetch.
     */
    orderBy?: ConfigOrderByWithRelationInput | ConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Configs.
     */
    cursor?: ConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configs.
     */
    skip?: number
    distinct?: ConfigScalarFieldEnum | ConfigScalarFieldEnum[]
  }

  /**
   * Config create
   */
  export type ConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a Config.
     */
    data: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
  }

  /**
   * Config createMany
   */
  export type ConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Configs.
     */
    data: ConfigCreateManyInput | ConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Config createManyAndReturn
   */
  export type ConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data used to create many Configs.
     */
    data: ConfigCreateManyInput | ConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Config update
   */
  export type ConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a Config.
     */
    data: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
    /**
     * Choose, which Config to update.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config updateMany
   */
  export type ConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Configs.
     */
    data: XOR<ConfigUpdateManyMutationInput, ConfigUncheckedUpdateManyInput>
    /**
     * Filter which Configs to update
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to update.
     */
    limit?: number
  }

  /**
   * Config updateManyAndReturn
   */
  export type ConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The data used to update Configs.
     */
    data: XOR<ConfigUpdateManyMutationInput, ConfigUncheckedUpdateManyInput>
    /**
     * Filter which Configs to update
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to update.
     */
    limit?: number
  }

  /**
   * Config upsert
   */
  export type ConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the Config to update in case it exists.
     */
    where: ConfigWhereUniqueInput
    /**
     * In case the Config found by the `where` argument doesn't exist, create a new Config with this data.
     */
    create: XOR<ConfigCreateInput, ConfigUncheckedCreateInput>
    /**
     * In case the Config was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfigUpdateInput, ConfigUncheckedUpdateInput>
  }

  /**
   * Config delete
   */
  export type ConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
    /**
     * Filter which Config to delete.
     */
    where: ConfigWhereUniqueInput
  }

  /**
   * Config deleteMany
   */
  export type ConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Configs to delete
     */
    where?: ConfigWhereInput
    /**
     * Limit how many Configs to delete.
     */
    limit?: number
  }

  /**
   * Config without action
   */
  export type ConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Config
     */
    select?: ConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Config
     */
    omit?: ConfigOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    username: 'username',
    password: 'password',
    nickname: 'nickname',
    avatar: 'avatar',
    favor: 'favor',
    settings: 'settings',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CoverageScalarFieldEnum: {
    id: 'id',
    sha: 'sha',
    branch: 'branch',
    compareTarget: 'compareTarget',
    provider: 'provider',
    buildProvider: 'buildProvider',
    buildID: 'buildID',
    projectID: 'projectID',
    reporter: 'reporter',
    reportProvider: 'reportProvider',
    reportID: 'reportID',
    covType: 'covType',
    scopeID: 'scopeID',
    branchesTotal: 'branchesTotal',
    branchesCovered: 'branchesCovered',
    functionsTotal: 'functionsTotal',
    functionsCovered: 'functionsCovered',
    linesTotal: 'linesTotal',
    linesCovered: 'linesCovered',
    statementsTotal: 'statementsTotal',
    statementsCovered: 'statementsCovered',
    newlinesTotal: 'newlinesTotal',
    newlinesCovered: 'newlinesCovered',
    summary: 'summary',
    hit: 'hit',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CoverageScalarFieldEnum = (typeof CoverageScalarFieldEnum)[keyof typeof CoverageScalarFieldEnum]


  export const CoverageMapScalarFieldEnum: {
    id: 'id',
    provider: 'provider',
    buildProvider: 'buildProvider',
    buildID: 'buildID',
    repoID: 'repoID',
    sha: 'sha',
    path: 'path',
    oldPath: 'oldPath',
    inputSourceMap: 'inputSourceMap',
    branchMap: 'branchMap',
    statementMap: 'statementMap',
    fnMap: 'fnMap',
    instrumentCwd: 'instrumentCwd',
    time: 'time'
  };

  export type CoverageMapScalarFieldEnum = (typeof CoverageMapScalarFieldEnum)[keyof typeof CoverageMapScalarFieldEnum]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    pathWithNamespace: 'pathWithNamespace',
    description: 'description',
    bu: 'bu',
    tags: 'tags',
    members: 'members',
    scopes: 'scopes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const DiffScalarFieldEnum: {
    id: 'id',
    provider: 'provider',
    repoID: 'repoID',
    compareTarget: 'compareTarget',
    sha: 'sha',
    path: 'path',
    additions: 'additions',
    deletions: 'deletions',
    createdAt: 'createdAt'
  };

  export type DiffScalarFieldEnum = (typeof DiffScalarFieldEnum)[keyof typeof DiffScalarFieldEnum]


  export const DistributedlockScalarFieldEnum: {
    lockName: 'lockName',
    isLocked: 'isLocked',
    lockTimestamp: 'lockTimestamp',
    lockExpiration: 'lockExpiration'
  };

  export type DistributedlockScalarFieldEnum = (typeof DistributedlockScalarFieldEnum)[keyof typeof DistributedlockScalarFieldEnum]


  export const CoverageLogScalarFieldEnum: {
    id: 'id',
    sha: 'sha',
    branch: 'branch',
    compareTarget: 'compareTarget',
    provider: 'provider',
    buildProvider: 'buildProvider',
    buildID: 'buildID',
    projectID: 'projectID',
    reporter: 'reporter',
    reportProvider: 'reportProvider',
    reportID: 'reportID',
    isHitAndMapSeparated: 'isHitAndMapSeparated',
    aggregatedState: 'aggregatedState',
    size: 'size',
    instrumentCwd: 'instrumentCwd',
    tags: 'tags',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CoverageLogScalarFieldEnum = (typeof CoverageLogScalarFieldEnum)[keyof typeof CoverageLogScalarFieldEnum]


  export const ConfigScalarFieldEnum: {
    id: 'id',
    key: 'key',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConfigScalarFieldEnum = (typeof ConfigScalarFieldEnum)[keyof typeof ConfigScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CovType'
   */
  export type EnumCovTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CovType'>
    


  /**
   * Reference to a field of type 'CovType[]'
   */
  export type ListEnumCovTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CovType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Bytes'
   */
  export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>
    


  /**
   * Reference to a field of type 'Bytes[]'
   */
  export type ListBytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'AggregatedState'
   */
  export type EnumAggregatedStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AggregatedState'>
    


  /**
   * Reference to a field of type 'AggregatedState[]'
   */
  export type ListEnumAggregatedStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AggregatedState[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    nickname?: StringFilter<"User"> | string
    avatar?: StringFilter<"User"> | string
    favor?: StringFilter<"User"> | string
    settings?: JsonFilter<"User">
    createdAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    nickname?: SortOrder
    avatar?: SortOrder
    favor?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    nickname?: StringFilter<"User"> | string
    avatar?: StringFilter<"User"> | string
    favor?: StringFilter<"User"> | string
    settings?: JsonFilter<"User">
    createdAt?: DateTimeFilter<"User"> | Date | string
  }, "id">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    nickname?: SortOrder
    avatar?: SortOrder
    favor?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    nickname?: StringWithAggregatesFilter<"User"> | string
    avatar?: StringWithAggregatesFilter<"User"> | string
    favor?: StringWithAggregatesFilter<"User"> | string
    settings?: JsonWithAggregatesFilter<"User">
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CoverageWhereInput = {
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    id?: StringFilter<"Coverage"> | string
    sha?: StringFilter<"Coverage"> | string
    branch?: StringFilter<"Coverage"> | string
    compareTarget?: StringFilter<"Coverage"> | string
    provider?: StringFilter<"Coverage"> | string
    buildProvider?: StringFilter<"Coverage"> | string
    buildID?: StringFilter<"Coverage"> | string
    projectID?: StringFilter<"Coverage"> | string
    reporter?: StringFilter<"Coverage"> | string
    reportProvider?: StringFilter<"Coverage"> | string
    reportID?: StringFilter<"Coverage"> | string
    covType?: EnumCovTypeFilter<"Coverage"> | $Enums.CovType
    scopeID?: StringFilter<"Coverage"> | string
    branchesTotal?: IntFilter<"Coverage"> | number
    branchesCovered?: IntFilter<"Coverage"> | number
    functionsTotal?: IntFilter<"Coverage"> | number
    functionsCovered?: IntFilter<"Coverage"> | number
    linesTotal?: IntFilter<"Coverage"> | number
    linesCovered?: IntFilter<"Coverage"> | number
    statementsTotal?: IntFilter<"Coverage"> | number
    statementsCovered?: IntFilter<"Coverage"> | number
    newlinesTotal?: IntFilter<"Coverage"> | number
    newlinesCovered?: IntFilter<"Coverage"> | number
    summary?: BytesFilter<"Coverage"> | Uint8Array
    hit?: BytesFilter<"Coverage"> | Uint8Array
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
  }

  export type CoverageOrderByWithRelationInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    covType?: SortOrder
    scopeID?: SortOrder
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
    summary?: SortOrder
    hit?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    sha?: StringFilter<"Coverage"> | string
    branch?: StringFilter<"Coverage"> | string
    compareTarget?: StringFilter<"Coverage"> | string
    provider?: StringFilter<"Coverage"> | string
    buildProvider?: StringFilter<"Coverage"> | string
    buildID?: StringFilter<"Coverage"> | string
    projectID?: StringFilter<"Coverage"> | string
    reporter?: StringFilter<"Coverage"> | string
    reportProvider?: StringFilter<"Coverage"> | string
    reportID?: StringFilter<"Coverage"> | string
    covType?: EnumCovTypeFilter<"Coverage"> | $Enums.CovType
    scopeID?: StringFilter<"Coverage"> | string
    branchesTotal?: IntFilter<"Coverage"> | number
    branchesCovered?: IntFilter<"Coverage"> | number
    functionsTotal?: IntFilter<"Coverage"> | number
    functionsCovered?: IntFilter<"Coverage"> | number
    linesTotal?: IntFilter<"Coverage"> | number
    linesCovered?: IntFilter<"Coverage"> | number
    statementsTotal?: IntFilter<"Coverage"> | number
    statementsCovered?: IntFilter<"Coverage"> | number
    newlinesTotal?: IntFilter<"Coverage"> | number
    newlinesCovered?: IntFilter<"Coverage"> | number
    summary?: BytesFilter<"Coverage"> | Uint8Array
    hit?: BytesFilter<"Coverage"> | Uint8Array
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
  }, "id">

  export type CoverageOrderByWithAggregationInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    covType?: SortOrder
    scopeID?: SortOrder
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
    summary?: SortOrder
    hit?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CoverageCountOrderByAggregateInput
    _avg?: CoverageAvgOrderByAggregateInput
    _max?: CoverageMaxOrderByAggregateInput
    _min?: CoverageMinOrderByAggregateInput
    _sum?: CoverageSumOrderByAggregateInput
  }

  export type CoverageScalarWhereWithAggregatesInput = {
    AND?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    OR?: CoverageScalarWhereWithAggregatesInput[]
    NOT?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Coverage"> | string
    sha?: StringWithAggregatesFilter<"Coverage"> | string
    branch?: StringWithAggregatesFilter<"Coverage"> | string
    compareTarget?: StringWithAggregatesFilter<"Coverage"> | string
    provider?: StringWithAggregatesFilter<"Coverage"> | string
    buildProvider?: StringWithAggregatesFilter<"Coverage"> | string
    buildID?: StringWithAggregatesFilter<"Coverage"> | string
    projectID?: StringWithAggregatesFilter<"Coverage"> | string
    reporter?: StringWithAggregatesFilter<"Coverage"> | string
    reportProvider?: StringWithAggregatesFilter<"Coverage"> | string
    reportID?: StringWithAggregatesFilter<"Coverage"> | string
    covType?: EnumCovTypeWithAggregatesFilter<"Coverage"> | $Enums.CovType
    scopeID?: StringWithAggregatesFilter<"Coverage"> | string
    branchesTotal?: IntWithAggregatesFilter<"Coverage"> | number
    branchesCovered?: IntWithAggregatesFilter<"Coverage"> | number
    functionsTotal?: IntWithAggregatesFilter<"Coverage"> | number
    functionsCovered?: IntWithAggregatesFilter<"Coverage"> | number
    linesTotal?: IntWithAggregatesFilter<"Coverage"> | number
    linesCovered?: IntWithAggregatesFilter<"Coverage"> | number
    statementsTotal?: IntWithAggregatesFilter<"Coverage"> | number
    statementsCovered?: IntWithAggregatesFilter<"Coverage"> | number
    newlinesTotal?: IntWithAggregatesFilter<"Coverage"> | number
    newlinesCovered?: IntWithAggregatesFilter<"Coverage"> | number
    summary?: BytesWithAggregatesFilter<"Coverage"> | Uint8Array
    hit?: BytesWithAggregatesFilter<"Coverage"> | Uint8Array
    createdAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
  }

  export type CoverageMapWhereInput = {
    AND?: CoverageMapWhereInput | CoverageMapWhereInput[]
    OR?: CoverageMapWhereInput[]
    NOT?: CoverageMapWhereInput | CoverageMapWhereInput[]
    id?: StringFilter<"CoverageMap"> | string
    provider?: StringFilter<"CoverageMap"> | string
    buildProvider?: StringFilter<"CoverageMap"> | string
    buildID?: StringFilter<"CoverageMap"> | string
    repoID?: StringFilter<"CoverageMap"> | string
    sha?: StringFilter<"CoverageMap"> | string
    path?: StringFilter<"CoverageMap"> | string
    oldPath?: StringFilter<"CoverageMap"> | string
    inputSourceMap?: StringFilter<"CoverageMap"> | string
    branchMap?: StringFilter<"CoverageMap"> | string
    statementMap?: StringFilter<"CoverageMap"> | string
    fnMap?: StringFilter<"CoverageMap"> | string
    instrumentCwd?: StringFilter<"CoverageMap"> | string
    time?: IntFilter<"CoverageMap"> | number
  }

  export type CoverageMapOrderByWithRelationInput = {
    id?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    oldPath?: SortOrder
    inputSourceMap?: SortOrder
    branchMap?: SortOrder
    statementMap?: SortOrder
    fnMap?: SortOrder
    instrumentCwd?: SortOrder
    time?: SortOrder
  }

  export type CoverageMapWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageMapWhereInput | CoverageMapWhereInput[]
    OR?: CoverageMapWhereInput[]
    NOT?: CoverageMapWhereInput | CoverageMapWhereInput[]
    provider?: StringFilter<"CoverageMap"> | string
    buildProvider?: StringFilter<"CoverageMap"> | string
    buildID?: StringFilter<"CoverageMap"> | string
    repoID?: StringFilter<"CoverageMap"> | string
    sha?: StringFilter<"CoverageMap"> | string
    path?: StringFilter<"CoverageMap"> | string
    oldPath?: StringFilter<"CoverageMap"> | string
    inputSourceMap?: StringFilter<"CoverageMap"> | string
    branchMap?: StringFilter<"CoverageMap"> | string
    statementMap?: StringFilter<"CoverageMap"> | string
    fnMap?: StringFilter<"CoverageMap"> | string
    instrumentCwd?: StringFilter<"CoverageMap"> | string
    time?: IntFilter<"CoverageMap"> | number
  }, "id">

  export type CoverageMapOrderByWithAggregationInput = {
    id?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    oldPath?: SortOrder
    inputSourceMap?: SortOrder
    branchMap?: SortOrder
    statementMap?: SortOrder
    fnMap?: SortOrder
    instrumentCwd?: SortOrder
    time?: SortOrder
    _count?: CoverageMapCountOrderByAggregateInput
    _avg?: CoverageMapAvgOrderByAggregateInput
    _max?: CoverageMapMaxOrderByAggregateInput
    _min?: CoverageMapMinOrderByAggregateInput
    _sum?: CoverageMapSumOrderByAggregateInput
  }

  export type CoverageMapScalarWhereWithAggregatesInput = {
    AND?: CoverageMapScalarWhereWithAggregatesInput | CoverageMapScalarWhereWithAggregatesInput[]
    OR?: CoverageMapScalarWhereWithAggregatesInput[]
    NOT?: CoverageMapScalarWhereWithAggregatesInput | CoverageMapScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CoverageMap"> | string
    provider?: StringWithAggregatesFilter<"CoverageMap"> | string
    buildProvider?: StringWithAggregatesFilter<"CoverageMap"> | string
    buildID?: StringWithAggregatesFilter<"CoverageMap"> | string
    repoID?: StringWithAggregatesFilter<"CoverageMap"> | string
    sha?: StringWithAggregatesFilter<"CoverageMap"> | string
    path?: StringWithAggregatesFilter<"CoverageMap"> | string
    oldPath?: StringWithAggregatesFilter<"CoverageMap"> | string
    inputSourceMap?: StringWithAggregatesFilter<"CoverageMap"> | string
    branchMap?: StringWithAggregatesFilter<"CoverageMap"> | string
    statementMap?: StringWithAggregatesFilter<"CoverageMap"> | string
    fnMap?: StringWithAggregatesFilter<"CoverageMap"> | string
    instrumentCwd?: StringWithAggregatesFilter<"CoverageMap"> | string
    time?: IntWithAggregatesFilter<"CoverageMap"> | number
  }

  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: StringFilter<"Project"> | string
    pathWithNamespace?: StringFilter<"Project"> | string
    description?: StringFilter<"Project"> | string
    bu?: StringFilter<"Project"> | string
    tags?: JsonFilter<"Project">
    members?: JsonFilter<"Project">
    scopes?: JsonFilter<"Project">
    createdAt?: DateTimeFilter<"Project"> | Date | string
    updatedAt?: DateTimeFilter<"Project"> | Date | string
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    pathWithNamespace?: SortOrder
    description?: SortOrder
    bu?: SortOrder
    tags?: SortOrder
    members?: SortOrder
    scopes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    pathWithNamespace?: StringFilter<"Project"> | string
    description?: StringFilter<"Project"> | string
    bu?: StringFilter<"Project"> | string
    tags?: JsonFilter<"Project">
    members?: JsonFilter<"Project">
    scopes?: JsonFilter<"Project">
    createdAt?: DateTimeFilter<"Project"> | Date | string
    updatedAt?: DateTimeFilter<"Project"> | Date | string
  }, "id">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    pathWithNamespace?: SortOrder
    description?: SortOrder
    bu?: SortOrder
    tags?: SortOrder
    members?: SortOrder
    scopes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Project"> | string
    pathWithNamespace?: StringWithAggregatesFilter<"Project"> | string
    description?: StringWithAggregatesFilter<"Project"> | string
    bu?: StringWithAggregatesFilter<"Project"> | string
    tags?: JsonWithAggregatesFilter<"Project">
    members?: JsonWithAggregatesFilter<"Project">
    scopes?: JsonWithAggregatesFilter<"Project">
    createdAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
  }

  export type DiffWhereInput = {
    AND?: DiffWhereInput | DiffWhereInput[]
    OR?: DiffWhereInput[]
    NOT?: DiffWhereInput | DiffWhereInput[]
    id?: StringFilter<"Diff"> | string
    provider?: StringFilter<"Diff"> | string
    repoID?: StringFilter<"Diff"> | string
    compareTarget?: StringFilter<"Diff"> | string
    sha?: StringFilter<"Diff"> | string
    path?: StringFilter<"Diff"> | string
    additions?: IntNullableListFilter<"Diff">
    deletions?: IntNullableListFilter<"Diff">
    createdAt?: DateTimeFilter<"Diff"> | Date | string
  }

  export type DiffOrderByWithRelationInput = {
    id?: SortOrder
    provider?: SortOrder
    repoID?: SortOrder
    compareTarget?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    createdAt?: SortOrder
  }

  export type DiffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DiffWhereInput | DiffWhereInput[]
    OR?: DiffWhereInput[]
    NOT?: DiffWhereInput | DiffWhereInput[]
    provider?: StringFilter<"Diff"> | string
    repoID?: StringFilter<"Diff"> | string
    compareTarget?: StringFilter<"Diff"> | string
    sha?: StringFilter<"Diff"> | string
    path?: StringFilter<"Diff"> | string
    additions?: IntNullableListFilter<"Diff">
    deletions?: IntNullableListFilter<"Diff">
    createdAt?: DateTimeFilter<"Diff"> | Date | string
  }, "id">

  export type DiffOrderByWithAggregationInput = {
    id?: SortOrder
    provider?: SortOrder
    repoID?: SortOrder
    compareTarget?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    createdAt?: SortOrder
    _count?: DiffCountOrderByAggregateInput
    _avg?: DiffAvgOrderByAggregateInput
    _max?: DiffMaxOrderByAggregateInput
    _min?: DiffMinOrderByAggregateInput
    _sum?: DiffSumOrderByAggregateInput
  }

  export type DiffScalarWhereWithAggregatesInput = {
    AND?: DiffScalarWhereWithAggregatesInput | DiffScalarWhereWithAggregatesInput[]
    OR?: DiffScalarWhereWithAggregatesInput[]
    NOT?: DiffScalarWhereWithAggregatesInput | DiffScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Diff"> | string
    provider?: StringWithAggregatesFilter<"Diff"> | string
    repoID?: StringWithAggregatesFilter<"Diff"> | string
    compareTarget?: StringWithAggregatesFilter<"Diff"> | string
    sha?: StringWithAggregatesFilter<"Diff"> | string
    path?: StringWithAggregatesFilter<"Diff"> | string
    additions?: IntNullableListFilter<"Diff">
    deletions?: IntNullableListFilter<"Diff">
    createdAt?: DateTimeWithAggregatesFilter<"Diff"> | Date | string
  }

  export type DistributedlockWhereInput = {
    AND?: DistributedlockWhereInput | DistributedlockWhereInput[]
    OR?: DistributedlockWhereInput[]
    NOT?: DistributedlockWhereInput | DistributedlockWhereInput[]
    lockName?: StringFilter<"Distributedlock"> | string
    isLocked?: BoolFilter<"Distributedlock"> | boolean
    lockTimestamp?: DateTimeFilter<"Distributedlock"> | Date | string
    lockExpiration?: DateTimeFilter<"Distributedlock"> | Date | string
  }

  export type DistributedlockOrderByWithRelationInput = {
    lockName?: SortOrder
    isLocked?: SortOrder
    lockTimestamp?: SortOrder
    lockExpiration?: SortOrder
  }

  export type DistributedlockWhereUniqueInput = Prisma.AtLeast<{
    lockName?: string
    AND?: DistributedlockWhereInput | DistributedlockWhereInput[]
    OR?: DistributedlockWhereInput[]
    NOT?: DistributedlockWhereInput | DistributedlockWhereInput[]
    isLocked?: BoolFilter<"Distributedlock"> | boolean
    lockTimestamp?: DateTimeFilter<"Distributedlock"> | Date | string
    lockExpiration?: DateTimeFilter<"Distributedlock"> | Date | string
  }, "lockName">

  export type DistributedlockOrderByWithAggregationInput = {
    lockName?: SortOrder
    isLocked?: SortOrder
    lockTimestamp?: SortOrder
    lockExpiration?: SortOrder
    _count?: DistributedlockCountOrderByAggregateInput
    _max?: DistributedlockMaxOrderByAggregateInput
    _min?: DistributedlockMinOrderByAggregateInput
  }

  export type DistributedlockScalarWhereWithAggregatesInput = {
    AND?: DistributedlockScalarWhereWithAggregatesInput | DistributedlockScalarWhereWithAggregatesInput[]
    OR?: DistributedlockScalarWhereWithAggregatesInput[]
    NOT?: DistributedlockScalarWhereWithAggregatesInput | DistributedlockScalarWhereWithAggregatesInput[]
    lockName?: StringWithAggregatesFilter<"Distributedlock"> | string
    isLocked?: BoolWithAggregatesFilter<"Distributedlock"> | boolean
    lockTimestamp?: DateTimeWithAggregatesFilter<"Distributedlock"> | Date | string
    lockExpiration?: DateTimeWithAggregatesFilter<"Distributedlock"> | Date | string
  }

  export type CoverageLogWhereInput = {
    AND?: CoverageLogWhereInput | CoverageLogWhereInput[]
    OR?: CoverageLogWhereInput[]
    NOT?: CoverageLogWhereInput | CoverageLogWhereInput[]
    id?: StringFilter<"CoverageLog"> | string
    sha?: StringFilter<"CoverageLog"> | string
    branch?: StringFilter<"CoverageLog"> | string
    compareTarget?: StringFilter<"CoverageLog"> | string
    provider?: StringFilter<"CoverageLog"> | string
    buildProvider?: StringFilter<"CoverageLog"> | string
    buildID?: StringFilter<"CoverageLog"> | string
    projectID?: StringFilter<"CoverageLog"> | string
    reporter?: StringFilter<"CoverageLog"> | string
    reportProvider?: StringFilter<"CoverageLog"> | string
    reportID?: StringFilter<"CoverageLog"> | string
    isHitAndMapSeparated?: BoolFilter<"CoverageLog"> | boolean
    aggregatedState?: EnumAggregatedStateFilter<"CoverageLog"> | $Enums.AggregatedState
    size?: IntFilter<"CoverageLog"> | number
    instrumentCwd?: StringFilter<"CoverageLog"> | string
    tags?: JsonFilter<"CoverageLog">
    createdAt?: DateTimeFilter<"CoverageLog"> | Date | string
    updatedAt?: DateTimeFilter<"CoverageLog"> | Date | string
  }

  export type CoverageLogOrderByWithRelationInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    isHitAndMapSeparated?: SortOrder
    aggregatedState?: SortOrder
    size?: SortOrder
    instrumentCwd?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageLogWhereInput | CoverageLogWhereInput[]
    OR?: CoverageLogWhereInput[]
    NOT?: CoverageLogWhereInput | CoverageLogWhereInput[]
    sha?: StringFilter<"CoverageLog"> | string
    branch?: StringFilter<"CoverageLog"> | string
    compareTarget?: StringFilter<"CoverageLog"> | string
    provider?: StringFilter<"CoverageLog"> | string
    buildProvider?: StringFilter<"CoverageLog"> | string
    buildID?: StringFilter<"CoverageLog"> | string
    projectID?: StringFilter<"CoverageLog"> | string
    reporter?: StringFilter<"CoverageLog"> | string
    reportProvider?: StringFilter<"CoverageLog"> | string
    reportID?: StringFilter<"CoverageLog"> | string
    isHitAndMapSeparated?: BoolFilter<"CoverageLog"> | boolean
    aggregatedState?: EnumAggregatedStateFilter<"CoverageLog"> | $Enums.AggregatedState
    size?: IntFilter<"CoverageLog"> | number
    instrumentCwd?: StringFilter<"CoverageLog"> | string
    tags?: JsonFilter<"CoverageLog">
    createdAt?: DateTimeFilter<"CoverageLog"> | Date | string
    updatedAt?: DateTimeFilter<"CoverageLog"> | Date | string
  }, "id">

  export type CoverageLogOrderByWithAggregationInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    isHitAndMapSeparated?: SortOrder
    aggregatedState?: SortOrder
    size?: SortOrder
    instrumentCwd?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CoverageLogCountOrderByAggregateInput
    _avg?: CoverageLogAvgOrderByAggregateInput
    _max?: CoverageLogMaxOrderByAggregateInput
    _min?: CoverageLogMinOrderByAggregateInput
    _sum?: CoverageLogSumOrderByAggregateInput
  }

  export type CoverageLogScalarWhereWithAggregatesInput = {
    AND?: CoverageLogScalarWhereWithAggregatesInput | CoverageLogScalarWhereWithAggregatesInput[]
    OR?: CoverageLogScalarWhereWithAggregatesInput[]
    NOT?: CoverageLogScalarWhereWithAggregatesInput | CoverageLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CoverageLog"> | string
    sha?: StringWithAggregatesFilter<"CoverageLog"> | string
    branch?: StringWithAggregatesFilter<"CoverageLog"> | string
    compareTarget?: StringWithAggregatesFilter<"CoverageLog"> | string
    provider?: StringWithAggregatesFilter<"CoverageLog"> | string
    buildProvider?: StringWithAggregatesFilter<"CoverageLog"> | string
    buildID?: StringWithAggregatesFilter<"CoverageLog"> | string
    projectID?: StringWithAggregatesFilter<"CoverageLog"> | string
    reporter?: StringWithAggregatesFilter<"CoverageLog"> | string
    reportProvider?: StringWithAggregatesFilter<"CoverageLog"> | string
    reportID?: StringWithAggregatesFilter<"CoverageLog"> | string
    isHitAndMapSeparated?: BoolWithAggregatesFilter<"CoverageLog"> | boolean
    aggregatedState?: EnumAggregatedStateWithAggregatesFilter<"CoverageLog"> | $Enums.AggregatedState
    size?: IntWithAggregatesFilter<"CoverageLog"> | number
    instrumentCwd?: StringWithAggregatesFilter<"CoverageLog"> | string
    tags?: JsonWithAggregatesFilter<"CoverageLog">
    createdAt?: DateTimeWithAggregatesFilter<"CoverageLog"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CoverageLog"> | Date | string
  }

  export type ConfigWhereInput = {
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    id?: StringFilter<"Config"> | string
    key?: StringFilter<"Config"> | string
    value?: StringFilter<"Config"> | string
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }

  export type ConfigOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConfigWhereInput | ConfigWhereInput[]
    OR?: ConfigWhereInput[]
    NOT?: ConfigWhereInput | ConfigWhereInput[]
    key?: StringFilter<"Config"> | string
    value?: StringFilter<"Config"> | string
    createdAt?: DateTimeFilter<"Config"> | Date | string
    updatedAt?: DateTimeFilter<"Config"> | Date | string
  }, "id">

  export type ConfigOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConfigCountOrderByAggregateInput
    _max?: ConfigMaxOrderByAggregateInput
    _min?: ConfigMinOrderByAggregateInput
  }

  export type ConfigScalarWhereWithAggregatesInput = {
    AND?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    OR?: ConfigScalarWhereWithAggregatesInput[]
    NOT?: ConfigScalarWhereWithAggregatesInput | ConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Config"> | string
    key?: StringWithAggregatesFilter<"Config"> | string
    value?: StringWithAggregatesFilter<"Config"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Config"> | Date | string
  }

  export type UserCreateInput = {
    id: string
    email: string
    username: string
    password: string
    nickname: string
    avatar: string
    favor: string
    settings: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    username: string
    password: string
    nickname: string
    avatar: string
    favor: string
    settings: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nickname?: StringFieldUpdateOperationsInput | string
    avatar?: StringFieldUpdateOperationsInput | string
    favor?: StringFieldUpdateOperationsInput | string
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nickname?: StringFieldUpdateOperationsInput | string
    avatar?: StringFieldUpdateOperationsInput | string
    favor?: StringFieldUpdateOperationsInput | string
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    username: string
    password: string
    nickname: string
    avatar: string
    favor: string
    settings: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nickname?: StringFieldUpdateOperationsInput | string
    avatar?: StringFieldUpdateOperationsInput | string
    favor?: StringFieldUpdateOperationsInput | string
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nickname?: StringFieldUpdateOperationsInput | string
    avatar?: StringFieldUpdateOperationsInput | string
    favor?: StringFieldUpdateOperationsInput | string
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    covType: $Enums.CovType
    scopeID: string
    branchesTotal: number
    branchesCovered: number
    functionsTotal: number
    functionsCovered: number
    linesTotal: number
    linesCovered: number
    statementsTotal: number
    statementsCovered: number
    newlinesTotal: number
    newlinesCovered: number
    summary: Uint8Array
    hit: Uint8Array
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUncheckedCreateInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    covType: $Enums.CovType
    scopeID: string
    branchesTotal: number
    branchesCovered: number
    functionsTotal: number
    functionsCovered: number
    linesTotal: number
    linesCovered: number
    statementsTotal: number
    statementsCovered: number
    newlinesTotal: number
    newlinesCovered: number
    summary: Uint8Array
    hit: Uint8Array
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    covType?: EnumCovTypeFieldUpdateOperationsInput | $Enums.CovType
    scopeID?: StringFieldUpdateOperationsInput | string
    branchesTotal?: IntFieldUpdateOperationsInput | number
    branchesCovered?: IntFieldUpdateOperationsInput | number
    functionsTotal?: IntFieldUpdateOperationsInput | number
    functionsCovered?: IntFieldUpdateOperationsInput | number
    linesTotal?: IntFieldUpdateOperationsInput | number
    linesCovered?: IntFieldUpdateOperationsInput | number
    statementsTotal?: IntFieldUpdateOperationsInput | number
    statementsCovered?: IntFieldUpdateOperationsInput | number
    newlinesTotal?: IntFieldUpdateOperationsInput | number
    newlinesCovered?: IntFieldUpdateOperationsInput | number
    summary?: BytesFieldUpdateOperationsInput | Uint8Array
    hit?: BytesFieldUpdateOperationsInput | Uint8Array
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    covType?: EnumCovTypeFieldUpdateOperationsInput | $Enums.CovType
    scopeID?: StringFieldUpdateOperationsInput | string
    branchesTotal?: IntFieldUpdateOperationsInput | number
    branchesCovered?: IntFieldUpdateOperationsInput | number
    functionsTotal?: IntFieldUpdateOperationsInput | number
    functionsCovered?: IntFieldUpdateOperationsInput | number
    linesTotal?: IntFieldUpdateOperationsInput | number
    linesCovered?: IntFieldUpdateOperationsInput | number
    statementsTotal?: IntFieldUpdateOperationsInput | number
    statementsCovered?: IntFieldUpdateOperationsInput | number
    newlinesTotal?: IntFieldUpdateOperationsInput | number
    newlinesCovered?: IntFieldUpdateOperationsInput | number
    summary?: BytesFieldUpdateOperationsInput | Uint8Array
    hit?: BytesFieldUpdateOperationsInput | Uint8Array
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateManyInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    covType: $Enums.CovType
    scopeID: string
    branchesTotal: number
    branchesCovered: number
    functionsTotal: number
    functionsCovered: number
    linesTotal: number
    linesCovered: number
    statementsTotal: number
    statementsCovered: number
    newlinesTotal: number
    newlinesCovered: number
    summary: Uint8Array
    hit: Uint8Array
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    covType?: EnumCovTypeFieldUpdateOperationsInput | $Enums.CovType
    scopeID?: StringFieldUpdateOperationsInput | string
    branchesTotal?: IntFieldUpdateOperationsInput | number
    branchesCovered?: IntFieldUpdateOperationsInput | number
    functionsTotal?: IntFieldUpdateOperationsInput | number
    functionsCovered?: IntFieldUpdateOperationsInput | number
    linesTotal?: IntFieldUpdateOperationsInput | number
    linesCovered?: IntFieldUpdateOperationsInput | number
    statementsTotal?: IntFieldUpdateOperationsInput | number
    statementsCovered?: IntFieldUpdateOperationsInput | number
    newlinesTotal?: IntFieldUpdateOperationsInput | number
    newlinesCovered?: IntFieldUpdateOperationsInput | number
    summary?: BytesFieldUpdateOperationsInput | Uint8Array
    hit?: BytesFieldUpdateOperationsInput | Uint8Array
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    covType?: EnumCovTypeFieldUpdateOperationsInput | $Enums.CovType
    scopeID?: StringFieldUpdateOperationsInput | string
    branchesTotal?: IntFieldUpdateOperationsInput | number
    branchesCovered?: IntFieldUpdateOperationsInput | number
    functionsTotal?: IntFieldUpdateOperationsInput | number
    functionsCovered?: IntFieldUpdateOperationsInput | number
    linesTotal?: IntFieldUpdateOperationsInput | number
    linesCovered?: IntFieldUpdateOperationsInput | number
    statementsTotal?: IntFieldUpdateOperationsInput | number
    statementsCovered?: IntFieldUpdateOperationsInput | number
    newlinesTotal?: IntFieldUpdateOperationsInput | number
    newlinesCovered?: IntFieldUpdateOperationsInput | number
    summary?: BytesFieldUpdateOperationsInput | Uint8Array
    hit?: BytesFieldUpdateOperationsInput | Uint8Array
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageMapCreateInput = {
    id?: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    sha: string
    path: string
    oldPath: string
    inputSourceMap: string
    branchMap: string
    statementMap: string
    fnMap: string
    instrumentCwd: string
    time: number
  }

  export type CoverageMapUncheckedCreateInput = {
    id?: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    sha: string
    path: string
    oldPath: string
    inputSourceMap: string
    branchMap: string
    statementMap: string
    fnMap: string
    instrumentCwd: string
    time: number
  }

  export type CoverageMapUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    oldPath?: StringFieldUpdateOperationsInput | string
    inputSourceMap?: StringFieldUpdateOperationsInput | string
    branchMap?: StringFieldUpdateOperationsInput | string
    statementMap?: StringFieldUpdateOperationsInput | string
    fnMap?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    time?: IntFieldUpdateOperationsInput | number
  }

  export type CoverageMapUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    oldPath?: StringFieldUpdateOperationsInput | string
    inputSourceMap?: StringFieldUpdateOperationsInput | string
    branchMap?: StringFieldUpdateOperationsInput | string
    statementMap?: StringFieldUpdateOperationsInput | string
    fnMap?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    time?: IntFieldUpdateOperationsInput | number
  }

  export type CoverageMapCreateManyInput = {
    id?: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    sha: string
    path: string
    oldPath: string
    inputSourceMap: string
    branchMap: string
    statementMap: string
    fnMap: string
    instrumentCwd: string
    time: number
  }

  export type CoverageMapUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    oldPath?: StringFieldUpdateOperationsInput | string
    inputSourceMap?: StringFieldUpdateOperationsInput | string
    branchMap?: StringFieldUpdateOperationsInput | string
    statementMap?: StringFieldUpdateOperationsInput | string
    fnMap?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    time?: IntFieldUpdateOperationsInput | number
  }

  export type CoverageMapUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    oldPath?: StringFieldUpdateOperationsInput | string
    inputSourceMap?: StringFieldUpdateOperationsInput | string
    branchMap?: StringFieldUpdateOperationsInput | string
    statementMap?: StringFieldUpdateOperationsInput | string
    fnMap?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    time?: IntFieldUpdateOperationsInput | number
  }

  export type ProjectCreateInput = {
    id: string
    pathWithNamespace: string
    description: string
    bu: string
    tags: JsonNullValueInput | InputJsonValue
    members: JsonNullValueInput | InputJsonValue
    scopes: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectUncheckedCreateInput = {
    id: string
    pathWithNamespace: string
    description: string
    bu: string
    tags: JsonNullValueInput | InputJsonValue
    members: JsonNullValueInput | InputJsonValue
    scopes: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithNamespace?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    bu?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    members?: JsonNullValueInput | InputJsonValue
    scopes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithNamespace?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    bu?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    members?: JsonNullValueInput | InputJsonValue
    scopes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectCreateManyInput = {
    id: string
    pathWithNamespace: string
    description: string
    bu: string
    tags: JsonNullValueInput | InputJsonValue
    members: JsonNullValueInput | InputJsonValue
    scopes: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithNamespace?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    bu?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    members?: JsonNullValueInput | InputJsonValue
    scopes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    pathWithNamespace?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    bu?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    members?: JsonNullValueInput | InputJsonValue
    scopes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffCreateInput = {
    id?: string
    provider: string
    repoID: string
    compareTarget: string
    sha: string
    path: string
    additions?: DiffCreateadditionsInput | number[]
    deletions?: DiffCreatedeletionsInput | number[]
    createdAt?: Date | string
  }

  export type DiffUncheckedCreateInput = {
    id?: string
    provider: string
    repoID: string
    compareTarget: string
    sha: string
    path: string
    additions?: DiffCreateadditionsInput | number[]
    deletions?: DiffCreatedeletionsInput | number[]
    createdAt?: Date | string
  }

  export type DiffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    additions?: DiffUpdateadditionsInput | number[]
    deletions?: DiffUpdatedeletionsInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    additions?: DiffUpdateadditionsInput | number[]
    deletions?: DiffUpdatedeletionsInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffCreateManyInput = {
    id?: string
    provider: string
    repoID: string
    compareTarget: string
    sha: string
    path: string
    additions?: DiffCreateadditionsInput | number[]
    deletions?: DiffCreatedeletionsInput | number[]
    createdAt?: Date | string
  }

  export type DiffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    additions?: DiffUpdateadditionsInput | number[]
    deletions?: DiffUpdatedeletionsInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    additions?: DiffUpdateadditionsInput | number[]
    deletions?: DiffUpdatedeletionsInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DistributedlockCreateInput = {
    lockName: string
    isLocked?: boolean
    lockTimestamp: Date | string
    lockExpiration: Date | string
  }

  export type DistributedlockUncheckedCreateInput = {
    lockName: string
    isLocked?: boolean
    lockTimestamp: Date | string
    lockExpiration: Date | string
  }

  export type DistributedlockUpdateInput = {
    lockName?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    lockTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    lockExpiration?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DistributedlockUncheckedUpdateInput = {
    lockName?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    lockTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    lockExpiration?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DistributedlockCreateManyInput = {
    lockName: string
    isLocked?: boolean
    lockTimestamp: Date | string
    lockExpiration: Date | string
  }

  export type DistributedlockUpdateManyMutationInput = {
    lockName?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    lockTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    lockExpiration?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DistributedlockUncheckedUpdateManyInput = {
    lockName?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    lockTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    lockExpiration?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageLogCreateInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    isHitAndMapSeparated: boolean
    aggregatedState: $Enums.AggregatedState
    size: number
    instrumentCwd: string
    tags: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageLogUncheckedCreateInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    isHitAndMapSeparated: boolean
    aggregatedState: $Enums.AggregatedState
    size: number
    instrumentCwd: string
    tags: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    isHitAndMapSeparated?: BoolFieldUpdateOperationsInput | boolean
    aggregatedState?: EnumAggregatedStateFieldUpdateOperationsInput | $Enums.AggregatedState
    size?: IntFieldUpdateOperationsInput | number
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    isHitAndMapSeparated?: BoolFieldUpdateOperationsInput | boolean
    aggregatedState?: EnumAggregatedStateFieldUpdateOperationsInput | $Enums.AggregatedState
    size?: IntFieldUpdateOperationsInput | number
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageLogCreateManyInput = {
    id?: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    projectID: string
    reporter: string
    reportProvider: string
    reportID: string
    isHitAndMapSeparated: boolean
    aggregatedState: $Enums.AggregatedState
    size: number
    instrumentCwd: string
    tags: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    isHitAndMapSeparated?: BoolFieldUpdateOperationsInput | boolean
    aggregatedState?: EnumAggregatedStateFieldUpdateOperationsInput | $Enums.AggregatedState
    size?: IntFieldUpdateOperationsInput | number
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    projectID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    isHitAndMapSeparated?: BoolFieldUpdateOperationsInput | boolean
    aggregatedState?: EnumAggregatedStateFieldUpdateOperationsInput | $Enums.AggregatedState
    size?: IntFieldUpdateOperationsInput | number
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    tags?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigCreateInput = {
    id?: string
    key: string
    value: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUncheckedCreateInput = {
    id?: string
    key: string
    value: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigCreateManyInput = {
    id?: string
    key: string
    value: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    nickname?: SortOrder
    avatar?: SortOrder
    favor?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    nickname?: SortOrder
    avatar?: SortOrder
    favor?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    nickname?: SortOrder
    avatar?: SortOrder
    favor?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumCovTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CovType | EnumCovTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCovTypeFilter<$PrismaModel> | $Enums.CovType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BytesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Uint8Array
  }

  export type CoverageCountOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    covType?: SortOrder
    scopeID?: SortOrder
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
    summary?: SortOrder
    hit?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageAvgOrderByAggregateInput = {
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
  }

  export type CoverageMaxOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    covType?: SortOrder
    scopeID?: SortOrder
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
    summary?: SortOrder
    hit?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageMinOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    covType?: SortOrder
    scopeID?: SortOrder
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
    summary?: SortOrder
    hit?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageSumOrderByAggregateInput = {
    branchesTotal?: SortOrder
    branchesCovered?: SortOrder
    functionsTotal?: SortOrder
    functionsCovered?: SortOrder
    linesTotal?: SortOrder
    linesCovered?: SortOrder
    statementsTotal?: SortOrder
    statementsCovered?: SortOrder
    newlinesTotal?: SortOrder
    newlinesCovered?: SortOrder
  }

  export type EnumCovTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CovType | EnumCovTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCovTypeWithAggregatesFilter<$PrismaModel> | $Enums.CovType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCovTypeFilter<$PrismaModel>
    _max?: NestedEnumCovTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Uint8Array
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type CoverageMapCountOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    oldPath?: SortOrder
    inputSourceMap?: SortOrder
    branchMap?: SortOrder
    statementMap?: SortOrder
    fnMap?: SortOrder
    instrumentCwd?: SortOrder
    time?: SortOrder
  }

  export type CoverageMapAvgOrderByAggregateInput = {
    time?: SortOrder
  }

  export type CoverageMapMaxOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    oldPath?: SortOrder
    inputSourceMap?: SortOrder
    branchMap?: SortOrder
    statementMap?: SortOrder
    fnMap?: SortOrder
    instrumentCwd?: SortOrder
    time?: SortOrder
  }

  export type CoverageMapMinOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    oldPath?: SortOrder
    inputSourceMap?: SortOrder
    branchMap?: SortOrder
    statementMap?: SortOrder
    fnMap?: SortOrder
    instrumentCwd?: SortOrder
    time?: SortOrder
  }

  export type CoverageMapSumOrderByAggregateInput = {
    time?: SortOrder
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    pathWithNamespace?: SortOrder
    description?: SortOrder
    bu?: SortOrder
    tags?: SortOrder
    members?: SortOrder
    scopes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    pathWithNamespace?: SortOrder
    description?: SortOrder
    bu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    pathWithNamespace?: SortOrder
    description?: SortOrder
    bu?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    has?: number | IntFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListIntFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListIntFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DiffCountOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    repoID?: SortOrder
    compareTarget?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    additions?: SortOrder
    deletions?: SortOrder
    createdAt?: SortOrder
  }

  export type DiffAvgOrderByAggregateInput = {
    additions?: SortOrder
    deletions?: SortOrder
  }

  export type DiffMaxOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    repoID?: SortOrder
    compareTarget?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
  }

  export type DiffMinOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    repoID?: SortOrder
    compareTarget?: SortOrder
    sha?: SortOrder
    path?: SortOrder
    createdAt?: SortOrder
  }

  export type DiffSumOrderByAggregateInput = {
    additions?: SortOrder
    deletions?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DistributedlockCountOrderByAggregateInput = {
    lockName?: SortOrder
    isLocked?: SortOrder
    lockTimestamp?: SortOrder
    lockExpiration?: SortOrder
  }

  export type DistributedlockMaxOrderByAggregateInput = {
    lockName?: SortOrder
    isLocked?: SortOrder
    lockTimestamp?: SortOrder
    lockExpiration?: SortOrder
  }

  export type DistributedlockMinOrderByAggregateInput = {
    lockName?: SortOrder
    isLocked?: SortOrder
    lockTimestamp?: SortOrder
    lockExpiration?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumAggregatedStateFilter<$PrismaModel = never> = {
    equals?: $Enums.AggregatedState | EnumAggregatedStateFieldRefInput<$PrismaModel>
    in?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    not?: NestedEnumAggregatedStateFilter<$PrismaModel> | $Enums.AggregatedState
  }

  export type CoverageLogCountOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    isHitAndMapSeparated?: SortOrder
    aggregatedState?: SortOrder
    size?: SortOrder
    instrumentCwd?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageLogAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type CoverageLogMaxOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    isHitAndMapSeparated?: SortOrder
    aggregatedState?: SortOrder
    size?: SortOrder
    instrumentCwd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageLogMinOrderByAggregateInput = {
    id?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    projectID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    isHitAndMapSeparated?: SortOrder
    aggregatedState?: SortOrder
    size?: SortOrder
    instrumentCwd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageLogSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type EnumAggregatedStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AggregatedState | EnumAggregatedStateFieldRefInput<$PrismaModel>
    in?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    not?: NestedEnumAggregatedStateWithAggregatesFilter<$PrismaModel> | $Enums.AggregatedState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAggregatedStateFilter<$PrismaModel>
    _max?: NestedEnumAggregatedStateFilter<$PrismaModel>
  }

  export type ConfigCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConfigMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumCovTypeFieldUpdateOperationsInput = {
    set?: $Enums.CovType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BytesFieldUpdateOperationsInput = {
    set?: Uint8Array
  }

  export type DiffCreateadditionsInput = {
    set: number[]
  }

  export type DiffCreatedeletionsInput = {
    set: number[]
  }

  export type DiffUpdateadditionsInput = {
    set?: number[]
    push?: number | number[]
  }

  export type DiffUpdatedeletionsInput = {
    set?: number[]
    push?: number | number[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumAggregatedStateFieldUpdateOperationsInput = {
    set?: $Enums.AggregatedState
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCovTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CovType | EnumCovTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCovTypeFilter<$PrismaModel> | $Enums.CovType
  }

  export type NestedBytesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesFilter<$PrismaModel> | Uint8Array
  }

  export type NestedEnumCovTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CovType | EnumCovTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CovType[] | ListEnumCovTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCovTypeWithAggregatesFilter<$PrismaModel> | $Enums.CovType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCovTypeFilter<$PrismaModel>
    _max?: NestedEnumCovTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBytesWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Uint8Array | BytesFieldRefInput<$PrismaModel>
    in?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    notIn?: Uint8Array[] | ListBytesFieldRefInput<$PrismaModel>
    not?: NestedBytesWithAggregatesFilter<$PrismaModel> | Uint8Array
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBytesFilter<$PrismaModel>
    _max?: NestedBytesFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumAggregatedStateFilter<$PrismaModel = never> = {
    equals?: $Enums.AggregatedState | EnumAggregatedStateFieldRefInput<$PrismaModel>
    in?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    not?: NestedEnumAggregatedStateFilter<$PrismaModel> | $Enums.AggregatedState
  }

  export type NestedEnumAggregatedStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AggregatedState | EnumAggregatedStateFieldRefInput<$PrismaModel>
    in?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.AggregatedState[] | ListEnumAggregatedStateFieldRefInput<$PrismaModel>
    not?: NestedEnumAggregatedStateWithAggregatesFilter<$PrismaModel> | $Enums.AggregatedState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAggregatedStateFilter<$PrismaModel>
    _max?: NestedEnumAggregatedStateFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}