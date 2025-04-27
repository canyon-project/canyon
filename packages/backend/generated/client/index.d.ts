
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
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model Coverage
 * 
 */
export type Coverage = $Result.DefaultSelection<Prisma.$CoveragePayload>
/**
 * Model CoverageMapRelation
 * 
 */
export type CoverageMapRelation = $Result.DefaultSelection<Prisma.$CoverageMapRelationPayload>
/**
 * Model Diff
 * 
 */
export type Diff = $Result.DefaultSelection<Prisma.$DiffPayload>
/**
 * Model Config
 * 
 */
export type Config = $Result.DefaultSelection<Prisma.$ConfigPayload>
/**
 * Model GitProvider
 * 
 */
export type GitProvider = $Result.DefaultSelection<Prisma.$GitProviderPayload>

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
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.coverageMapRelation`: Exposes CRUD operations for the **CoverageMapRelation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoverageMapRelations
    * const coverageMapRelations = await prisma.coverageMapRelation.findMany()
    * ```
    */
  get coverageMapRelation(): Prisma.CoverageMapRelationDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.config`: Exposes CRUD operations for the **Config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Configs
    * const configs = await prisma.config.findMany()
    * ```
    */
  get config(): Prisma.ConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gitProvider`: Exposes CRUD operations for the **GitProvider** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GitProviders
    * const gitProviders = await prisma.gitProvider.findMany()
    * ```
    */
  get gitProvider(): Prisma.GitProviderDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
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
    Project: 'Project',
    Coverage: 'Coverage',
    CoverageMapRelation: 'CoverageMapRelation',
    Diff: 'Diff',
    Config: 'Config',
    GitProvider: 'GitProvider'
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
      modelProps: "user" | "project" | "coverage" | "coverageMapRelation" | "diff" | "config" | "gitProvider"
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
      CoverageMapRelation: {
        payload: Prisma.$CoverageMapRelationPayload<ExtArgs>
        fields: Prisma.CoverageMapRelationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverageMapRelationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverageMapRelationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          findFirst: {
            args: Prisma.CoverageMapRelationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverageMapRelationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          findMany: {
            args: Prisma.CoverageMapRelationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>[]
          }
          create: {
            args: Prisma.CoverageMapRelationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          createMany: {
            args: Prisma.CoverageMapRelationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoverageMapRelationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>[]
          }
          delete: {
            args: Prisma.CoverageMapRelationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          update: {
            args: Prisma.CoverageMapRelationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          deleteMany: {
            args: Prisma.CoverageMapRelationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverageMapRelationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CoverageMapRelationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>[]
          }
          upsert: {
            args: Prisma.CoverageMapRelationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverageMapRelationPayload>
          }
          aggregate: {
            args: Prisma.CoverageMapRelationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverageMapRelation>
          }
          groupBy: {
            args: Prisma.CoverageMapRelationGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverageMapRelationGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverageMapRelationCountArgs<ExtArgs>
            result: $Utils.Optional<CoverageMapRelationCountAggregateOutputType> | number
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
      GitProvider: {
        payload: Prisma.$GitProviderPayload<ExtArgs>
        fields: Prisma.GitProviderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GitProviderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GitProviderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          findFirst: {
            args: Prisma.GitProviderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GitProviderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          findMany: {
            args: Prisma.GitProviderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>[]
          }
          create: {
            args: Prisma.GitProviderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          createMany: {
            args: Prisma.GitProviderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GitProviderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>[]
          }
          delete: {
            args: Prisma.GitProviderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          update: {
            args: Prisma.GitProviderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          deleteMany: {
            args: Prisma.GitProviderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GitProviderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GitProviderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>[]
          }
          upsert: {
            args: Prisma.GitProviderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitProviderPayload>
          }
          aggregate: {
            args: Prisma.GitProviderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGitProvider>
          }
          groupBy: {
            args: Prisma.GitProviderGroupByArgs<ExtArgs>
            result: $Utils.Optional<GitProviderGroupByOutputType>[]
          }
          count: {
            args: Prisma.GitProviderCountArgs<ExtArgs>
            result: $Utils.Optional<GitProviderCountAggregateOutputType> | number
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
    project?: ProjectOmit
    coverage?: CoverageOmit
    coverageMapRelation?: CoverageMapRelationOmit
    diff?: DiffOmit
    config?: ConfigOmit
    gitProvider?: GitProviderOmit
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
   * Model Coverage
   */

  export type AggregateCoverage = {
    _count: CoverageCountAggregateOutputType | null
    _min: CoverageMinAggregateOutputType | null
    _max: CoverageMaxAggregateOutputType | null
  }

  export type CoverageMinAggregateOutputType = {
    id: string | null
    instrumentCwd: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    repoID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    scopeID: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageMaxAggregateOutputType = {
    id: string | null
    instrumentCwd: string | null
    sha: string | null
    branch: string | null
    compareTarget: string | null
    provider: string | null
    buildProvider: string | null
    buildID: string | null
    repoID: string | null
    reporter: string | null
    reportProvider: string | null
    reportID: string | null
    scopeID: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CoverageCountAggregateOutputType = {
    id: number
    instrumentCwd: number
    sha: number
    branch: number
    compareTarget: number
    provider: number
    buildProvider: number
    buildID: number
    repoID: number
    reporter: number
    reportProvider: number
    reportID: number
    scopeID: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CoverageMinAggregateInputType = {
    id?: true
    instrumentCwd?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    scopeID?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageMaxAggregateInputType = {
    id?: true
    instrumentCwd?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    scopeID?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CoverageCountAggregateInputType = {
    id?: true
    instrumentCwd?: true
    sha?: true
    branch?: true
    compareTarget?: true
    provider?: true
    buildProvider?: true
    buildID?: true
    repoID?: true
    reporter?: true
    reportProvider?: true
    reportID?: true
    scopeID?: true
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
    _min?: CoverageMinAggregateInputType
    _max?: CoverageMaxAggregateInputType
  }

  export type CoverageGroupByOutputType = {
    id: string
    instrumentCwd: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    reporter: string
    reportProvider: string
    reportID: string
    scopeID: string
    createdAt: Date
    updatedAt: Date
    _count: CoverageCountAggregateOutputType | null
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
    instrumentCwd?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    scopeID?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    instrumentCwd?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    scopeID?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    instrumentCwd?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    scopeID?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["coverage"]>

  export type CoverageSelectScalar = {
    id?: boolean
    instrumentCwd?: boolean
    sha?: boolean
    branch?: boolean
    compareTarget?: boolean
    provider?: boolean
    buildProvider?: boolean
    buildID?: boolean
    repoID?: boolean
    reporter?: boolean
    reportProvider?: boolean
    reportID?: boolean
    scopeID?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CoverageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "instrumentCwd" | "sha" | "branch" | "compareTarget" | "provider" | "buildProvider" | "buildID" | "repoID" | "reporter" | "reportProvider" | "reportID" | "scopeID" | "createdAt" | "updatedAt", ExtArgs["result"]["coverage"]>

  export type $CoveragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Coverage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      instrumentCwd: string
      sha: string
      branch: string
      compareTarget: string
      provider: string
      buildProvider: string
      buildID: string
      repoID: string
      reporter: string
      reportProvider: string
      reportID: string
      scopeID: string
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
    readonly instrumentCwd: FieldRef<"Coverage", 'String'>
    readonly sha: FieldRef<"Coverage", 'String'>
    readonly branch: FieldRef<"Coverage", 'String'>
    readonly compareTarget: FieldRef<"Coverage", 'String'>
    readonly provider: FieldRef<"Coverage", 'String'>
    readonly buildProvider: FieldRef<"Coverage", 'String'>
    readonly buildID: FieldRef<"Coverage", 'String'>
    readonly repoID: FieldRef<"Coverage", 'String'>
    readonly reporter: FieldRef<"Coverage", 'String'>
    readonly reportProvider: FieldRef<"Coverage", 'String'>
    readonly reportID: FieldRef<"Coverage", 'String'>
    readonly scopeID: FieldRef<"Coverage", 'String'>
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
   * Model CoverageMapRelation
   */

  export type AggregateCoverageMapRelation = {
    _count: CoverageMapRelationCountAggregateOutputType | null
    _min: CoverageMapRelationMinAggregateOutputType | null
    _max: CoverageMapRelationMaxAggregateOutputType | null
  }

  export type CoverageMapRelationMinAggregateOutputType = {
    id: string | null
    absolutePath: string | null
    relativePath: string | null
    hashID: string | null
    coverageID: string | null
  }

  export type CoverageMapRelationMaxAggregateOutputType = {
    id: string | null
    absolutePath: string | null
    relativePath: string | null
    hashID: string | null
    coverageID: string | null
  }

  export type CoverageMapRelationCountAggregateOutputType = {
    id: number
    absolutePath: number
    relativePath: number
    hashID: number
    coverageID: number
    _all: number
  }


  export type CoverageMapRelationMinAggregateInputType = {
    id?: true
    absolutePath?: true
    relativePath?: true
    hashID?: true
    coverageID?: true
  }

  export type CoverageMapRelationMaxAggregateInputType = {
    id?: true
    absolutePath?: true
    relativePath?: true
    hashID?: true
    coverageID?: true
  }

  export type CoverageMapRelationCountAggregateInputType = {
    id?: true
    absolutePath?: true
    relativePath?: true
    hashID?: true
    coverageID?: true
    _all?: true
  }

  export type CoverageMapRelationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageMapRelation to aggregate.
     */
    where?: CoverageMapRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMapRelations to fetch.
     */
    orderBy?: CoverageMapRelationOrderByWithRelationInput | CoverageMapRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverageMapRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMapRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMapRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CoverageMapRelations
    **/
    _count?: true | CoverageMapRelationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverageMapRelationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverageMapRelationMaxAggregateInputType
  }

  export type GetCoverageMapRelationAggregateType<T extends CoverageMapRelationAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverageMapRelation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverageMapRelation[P]>
      : GetScalarType<T[P], AggregateCoverageMapRelation[P]>
  }




  export type CoverageMapRelationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverageMapRelationWhereInput
    orderBy?: CoverageMapRelationOrderByWithAggregationInput | CoverageMapRelationOrderByWithAggregationInput[]
    by: CoverageMapRelationScalarFieldEnum[] | CoverageMapRelationScalarFieldEnum
    having?: CoverageMapRelationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverageMapRelationCountAggregateInputType | true
    _min?: CoverageMapRelationMinAggregateInputType
    _max?: CoverageMapRelationMaxAggregateInputType
  }

  export type CoverageMapRelationGroupByOutputType = {
    id: string
    absolutePath: string
    relativePath: string
    hashID: string
    coverageID: string
    _count: CoverageMapRelationCountAggregateOutputType | null
    _min: CoverageMapRelationMinAggregateOutputType | null
    _max: CoverageMapRelationMaxAggregateOutputType | null
  }

  type GetCoverageMapRelationGroupByPayload<T extends CoverageMapRelationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverageMapRelationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverageMapRelationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverageMapRelationGroupByOutputType[P]>
            : GetScalarType<T[P], CoverageMapRelationGroupByOutputType[P]>
        }
      >
    >


  export type CoverageMapRelationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    absolutePath?: boolean
    relativePath?: boolean
    hashID?: boolean
    coverageID?: boolean
  }, ExtArgs["result"]["coverageMapRelation"]>

  export type CoverageMapRelationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    absolutePath?: boolean
    relativePath?: boolean
    hashID?: boolean
    coverageID?: boolean
  }, ExtArgs["result"]["coverageMapRelation"]>

  export type CoverageMapRelationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    absolutePath?: boolean
    relativePath?: boolean
    hashID?: boolean
    coverageID?: boolean
  }, ExtArgs["result"]["coverageMapRelation"]>

  export type CoverageMapRelationSelectScalar = {
    id?: boolean
    absolutePath?: boolean
    relativePath?: boolean
    hashID?: boolean
    coverageID?: boolean
  }

  export type CoverageMapRelationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "absolutePath" | "relativePath" | "hashID" | "coverageID", ExtArgs["result"]["coverageMapRelation"]>

  export type $CoverageMapRelationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CoverageMapRelation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      absolutePath: string
      relativePath: string
      hashID: string
      coverageID: string
    }, ExtArgs["result"]["coverageMapRelation"]>
    composites: {}
  }

  type CoverageMapRelationGetPayload<S extends boolean | null | undefined | CoverageMapRelationDefaultArgs> = $Result.GetResult<Prisma.$CoverageMapRelationPayload, S>

  type CoverageMapRelationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CoverageMapRelationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CoverageMapRelationCountAggregateInputType | true
    }

  export interface CoverageMapRelationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CoverageMapRelation'], meta: { name: 'CoverageMapRelation' } }
    /**
     * Find zero or one CoverageMapRelation that matches the filter.
     * @param {CoverageMapRelationFindUniqueArgs} args - Arguments to find a CoverageMapRelation
     * @example
     * // Get one CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverageMapRelationFindUniqueArgs>(args: SelectSubset<T, CoverageMapRelationFindUniqueArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CoverageMapRelation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CoverageMapRelationFindUniqueOrThrowArgs} args - Arguments to find a CoverageMapRelation
     * @example
     * // Get one CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverageMapRelationFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverageMapRelationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageMapRelation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationFindFirstArgs} args - Arguments to find a CoverageMapRelation
     * @example
     * // Get one CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverageMapRelationFindFirstArgs>(args?: SelectSubset<T, CoverageMapRelationFindFirstArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CoverageMapRelation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationFindFirstOrThrowArgs} args - Arguments to find a CoverageMapRelation
     * @example
     * // Get one CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverageMapRelationFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverageMapRelationFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CoverageMapRelations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoverageMapRelations
     * const coverageMapRelations = await prisma.coverageMapRelation.findMany()
     * 
     * // Get first 10 CoverageMapRelations
     * const coverageMapRelations = await prisma.coverageMapRelation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverageMapRelationWithIdOnly = await prisma.coverageMapRelation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverageMapRelationFindManyArgs>(args?: SelectSubset<T, CoverageMapRelationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CoverageMapRelation.
     * @param {CoverageMapRelationCreateArgs} args - Arguments to create a CoverageMapRelation.
     * @example
     * // Create one CoverageMapRelation
     * const CoverageMapRelation = await prisma.coverageMapRelation.create({
     *   data: {
     *     // ... data to create a CoverageMapRelation
     *   }
     * })
     * 
     */
    create<T extends CoverageMapRelationCreateArgs>(args: SelectSubset<T, CoverageMapRelationCreateArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CoverageMapRelations.
     * @param {CoverageMapRelationCreateManyArgs} args - Arguments to create many CoverageMapRelations.
     * @example
     * // Create many CoverageMapRelations
     * const coverageMapRelation = await prisma.coverageMapRelation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverageMapRelationCreateManyArgs>(args?: SelectSubset<T, CoverageMapRelationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CoverageMapRelations and returns the data saved in the database.
     * @param {CoverageMapRelationCreateManyAndReturnArgs} args - Arguments to create many CoverageMapRelations.
     * @example
     * // Create many CoverageMapRelations
     * const coverageMapRelation = await prisma.coverageMapRelation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CoverageMapRelations and only return the `id`
     * const coverageMapRelationWithIdOnly = await prisma.coverageMapRelation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoverageMapRelationCreateManyAndReturnArgs>(args?: SelectSubset<T, CoverageMapRelationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CoverageMapRelation.
     * @param {CoverageMapRelationDeleteArgs} args - Arguments to delete one CoverageMapRelation.
     * @example
     * // Delete one CoverageMapRelation
     * const CoverageMapRelation = await prisma.coverageMapRelation.delete({
     *   where: {
     *     // ... filter to delete one CoverageMapRelation
     *   }
     * })
     * 
     */
    delete<T extends CoverageMapRelationDeleteArgs>(args: SelectSubset<T, CoverageMapRelationDeleteArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CoverageMapRelation.
     * @param {CoverageMapRelationUpdateArgs} args - Arguments to update one CoverageMapRelation.
     * @example
     * // Update one CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverageMapRelationUpdateArgs>(args: SelectSubset<T, CoverageMapRelationUpdateArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CoverageMapRelations.
     * @param {CoverageMapRelationDeleteManyArgs} args - Arguments to filter CoverageMapRelations to delete.
     * @example
     * // Delete a few CoverageMapRelations
     * const { count } = await prisma.coverageMapRelation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverageMapRelationDeleteManyArgs>(args?: SelectSubset<T, CoverageMapRelationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageMapRelations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoverageMapRelations
     * const coverageMapRelation = await prisma.coverageMapRelation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverageMapRelationUpdateManyArgs>(args: SelectSubset<T, CoverageMapRelationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverageMapRelations and returns the data updated in the database.
     * @param {CoverageMapRelationUpdateManyAndReturnArgs} args - Arguments to update many CoverageMapRelations.
     * @example
     * // Update many CoverageMapRelations
     * const coverageMapRelation = await prisma.coverageMapRelation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CoverageMapRelations and only return the `id`
     * const coverageMapRelationWithIdOnly = await prisma.coverageMapRelation.updateManyAndReturn({
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
    updateManyAndReturn<T extends CoverageMapRelationUpdateManyAndReturnArgs>(args: SelectSubset<T, CoverageMapRelationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CoverageMapRelation.
     * @param {CoverageMapRelationUpsertArgs} args - Arguments to update or create a CoverageMapRelation.
     * @example
     * // Update or create a CoverageMapRelation
     * const coverageMapRelation = await prisma.coverageMapRelation.upsert({
     *   create: {
     *     // ... data to create a CoverageMapRelation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoverageMapRelation we want to update
     *   }
     * })
     */
    upsert<T extends CoverageMapRelationUpsertArgs>(args: SelectSubset<T, CoverageMapRelationUpsertArgs<ExtArgs>>): Prisma__CoverageMapRelationClient<$Result.GetResult<Prisma.$CoverageMapRelationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CoverageMapRelations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationCountArgs} args - Arguments to filter CoverageMapRelations to count.
     * @example
     * // Count the number of CoverageMapRelations
     * const count = await prisma.coverageMapRelation.count({
     *   where: {
     *     // ... the filter for the CoverageMapRelations we want to count
     *   }
     * })
    **/
    count<T extends CoverageMapRelationCountArgs>(
      args?: Subset<T, CoverageMapRelationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverageMapRelationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoverageMapRelation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CoverageMapRelationAggregateArgs>(args: Subset<T, CoverageMapRelationAggregateArgs>): Prisma.PrismaPromise<GetCoverageMapRelationAggregateType<T>>

    /**
     * Group by CoverageMapRelation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverageMapRelationGroupByArgs} args - Group by arguments.
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
      T extends CoverageMapRelationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverageMapRelationGroupByArgs['orderBy'] }
        : { orderBy?: CoverageMapRelationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CoverageMapRelationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverageMapRelationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CoverageMapRelation model
   */
  readonly fields: CoverageMapRelationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CoverageMapRelation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverageMapRelationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the CoverageMapRelation model
   */
  interface CoverageMapRelationFieldRefs {
    readonly id: FieldRef<"CoverageMapRelation", 'String'>
    readonly absolutePath: FieldRef<"CoverageMapRelation", 'String'>
    readonly relativePath: FieldRef<"CoverageMapRelation", 'String'>
    readonly hashID: FieldRef<"CoverageMapRelation", 'String'>
    readonly coverageID: FieldRef<"CoverageMapRelation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CoverageMapRelation findUnique
   */
  export type CoverageMapRelationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMapRelation to fetch.
     */
    where: CoverageMapRelationWhereUniqueInput
  }

  /**
   * CoverageMapRelation findUniqueOrThrow
   */
  export type CoverageMapRelationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMapRelation to fetch.
     */
    where: CoverageMapRelationWhereUniqueInput
  }

  /**
   * CoverageMapRelation findFirst
   */
  export type CoverageMapRelationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMapRelation to fetch.
     */
    where?: CoverageMapRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMapRelations to fetch.
     */
    orderBy?: CoverageMapRelationOrderByWithRelationInput | CoverageMapRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageMapRelations.
     */
    cursor?: CoverageMapRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMapRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMapRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageMapRelations.
     */
    distinct?: CoverageMapRelationScalarFieldEnum | CoverageMapRelationScalarFieldEnum[]
  }

  /**
   * CoverageMapRelation findFirstOrThrow
   */
  export type CoverageMapRelationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMapRelation to fetch.
     */
    where?: CoverageMapRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMapRelations to fetch.
     */
    orderBy?: CoverageMapRelationOrderByWithRelationInput | CoverageMapRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverageMapRelations.
     */
    cursor?: CoverageMapRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMapRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMapRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverageMapRelations.
     */
    distinct?: CoverageMapRelationScalarFieldEnum | CoverageMapRelationScalarFieldEnum[]
  }

  /**
   * CoverageMapRelation findMany
   */
  export type CoverageMapRelationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter, which CoverageMapRelations to fetch.
     */
    where?: CoverageMapRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverageMapRelations to fetch.
     */
    orderBy?: CoverageMapRelationOrderByWithRelationInput | CoverageMapRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CoverageMapRelations.
     */
    cursor?: CoverageMapRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverageMapRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverageMapRelations.
     */
    skip?: number
    distinct?: CoverageMapRelationScalarFieldEnum | CoverageMapRelationScalarFieldEnum[]
  }

  /**
   * CoverageMapRelation create
   */
  export type CoverageMapRelationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * The data needed to create a CoverageMapRelation.
     */
    data: XOR<CoverageMapRelationCreateInput, CoverageMapRelationUncheckedCreateInput>
  }

  /**
   * CoverageMapRelation createMany
   */
  export type CoverageMapRelationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CoverageMapRelations.
     */
    data: CoverageMapRelationCreateManyInput | CoverageMapRelationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageMapRelation createManyAndReturn
   */
  export type CoverageMapRelationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * The data used to create many CoverageMapRelations.
     */
    data: CoverageMapRelationCreateManyInput | CoverageMapRelationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverageMapRelation update
   */
  export type CoverageMapRelationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * The data needed to update a CoverageMapRelation.
     */
    data: XOR<CoverageMapRelationUpdateInput, CoverageMapRelationUncheckedUpdateInput>
    /**
     * Choose, which CoverageMapRelation to update.
     */
    where: CoverageMapRelationWhereUniqueInput
  }

  /**
   * CoverageMapRelation updateMany
   */
  export type CoverageMapRelationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CoverageMapRelations.
     */
    data: XOR<CoverageMapRelationUpdateManyMutationInput, CoverageMapRelationUncheckedUpdateManyInput>
    /**
     * Filter which CoverageMapRelations to update
     */
    where?: CoverageMapRelationWhereInput
    /**
     * Limit how many CoverageMapRelations to update.
     */
    limit?: number
  }

  /**
   * CoverageMapRelation updateManyAndReturn
   */
  export type CoverageMapRelationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * The data used to update CoverageMapRelations.
     */
    data: XOR<CoverageMapRelationUpdateManyMutationInput, CoverageMapRelationUncheckedUpdateManyInput>
    /**
     * Filter which CoverageMapRelations to update
     */
    where?: CoverageMapRelationWhereInput
    /**
     * Limit how many CoverageMapRelations to update.
     */
    limit?: number
  }

  /**
   * CoverageMapRelation upsert
   */
  export type CoverageMapRelationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * The filter to search for the CoverageMapRelation to update in case it exists.
     */
    where: CoverageMapRelationWhereUniqueInput
    /**
     * In case the CoverageMapRelation found by the `where` argument doesn't exist, create a new CoverageMapRelation with this data.
     */
    create: XOR<CoverageMapRelationCreateInput, CoverageMapRelationUncheckedCreateInput>
    /**
     * In case the CoverageMapRelation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverageMapRelationUpdateInput, CoverageMapRelationUncheckedUpdateInput>
  }

  /**
   * CoverageMapRelation delete
   */
  export type CoverageMapRelationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
    /**
     * Filter which CoverageMapRelation to delete.
     */
    where: CoverageMapRelationWhereUniqueInput
  }

  /**
   * CoverageMapRelation deleteMany
   */
  export type CoverageMapRelationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverageMapRelations to delete
     */
    where?: CoverageMapRelationWhereInput
    /**
     * Limit how many CoverageMapRelations to delete.
     */
    limit?: number
  }

  /**
   * CoverageMapRelation without action
   */
  export type CoverageMapRelationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverageMapRelation
     */
    select?: CoverageMapRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CoverageMapRelation
     */
    omit?: CoverageMapRelationOmit<ExtArgs> | null
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
   * Model GitProvider
   */

  export type AggregateGitProvider = {
    _count: GitProviderCountAggregateOutputType | null
    _min: GitProviderMinAggregateOutputType | null
    _max: GitProviderMaxAggregateOutputType | null
  }

  export type GitProviderMinAggregateOutputType = {
    id: string | null
    url: string | null
    type: string | null
    name: string | null
    disabled: boolean | null
    privateToken: string | null
  }

  export type GitProviderMaxAggregateOutputType = {
    id: string | null
    url: string | null
    type: string | null
    name: string | null
    disabled: boolean | null
    privateToken: string | null
  }

  export type GitProviderCountAggregateOutputType = {
    id: number
    url: number
    type: number
    name: number
    disabled: number
    privateToken: number
    _all: number
  }


  export type GitProviderMinAggregateInputType = {
    id?: true
    url?: true
    type?: true
    name?: true
    disabled?: true
    privateToken?: true
  }

  export type GitProviderMaxAggregateInputType = {
    id?: true
    url?: true
    type?: true
    name?: true
    disabled?: true
    privateToken?: true
  }

  export type GitProviderCountAggregateInputType = {
    id?: true
    url?: true
    type?: true
    name?: true
    disabled?: true
    privateToken?: true
    _all?: true
  }

  export type GitProviderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GitProvider to aggregate.
     */
    where?: GitProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitProviders to fetch.
     */
    orderBy?: GitProviderOrderByWithRelationInput | GitProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GitProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GitProviders
    **/
    _count?: true | GitProviderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GitProviderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GitProviderMaxAggregateInputType
  }

  export type GetGitProviderAggregateType<T extends GitProviderAggregateArgs> = {
        [P in keyof T & keyof AggregateGitProvider]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGitProvider[P]>
      : GetScalarType<T[P], AggregateGitProvider[P]>
  }




  export type GitProviderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GitProviderWhereInput
    orderBy?: GitProviderOrderByWithAggregationInput | GitProviderOrderByWithAggregationInput[]
    by: GitProviderScalarFieldEnum[] | GitProviderScalarFieldEnum
    having?: GitProviderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GitProviderCountAggregateInputType | true
    _min?: GitProviderMinAggregateInputType
    _max?: GitProviderMaxAggregateInputType
  }

  export type GitProviderGroupByOutputType = {
    id: string
    url: string
    type: string
    name: string
    disabled: boolean
    privateToken: string
    _count: GitProviderCountAggregateOutputType | null
    _min: GitProviderMinAggregateOutputType | null
    _max: GitProviderMaxAggregateOutputType | null
  }

  type GetGitProviderGroupByPayload<T extends GitProviderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GitProviderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GitProviderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GitProviderGroupByOutputType[P]>
            : GetScalarType<T[P], GitProviderGroupByOutputType[P]>
        }
      >
    >


  export type GitProviderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    type?: boolean
    name?: boolean
    disabled?: boolean
    privateToken?: boolean
  }, ExtArgs["result"]["gitProvider"]>

  export type GitProviderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    type?: boolean
    name?: boolean
    disabled?: boolean
    privateToken?: boolean
  }, ExtArgs["result"]["gitProvider"]>

  export type GitProviderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    type?: boolean
    name?: boolean
    disabled?: boolean
    privateToken?: boolean
  }, ExtArgs["result"]["gitProvider"]>

  export type GitProviderSelectScalar = {
    id?: boolean
    url?: boolean
    type?: boolean
    name?: boolean
    disabled?: boolean
    privateToken?: boolean
  }

  export type GitProviderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "url" | "type" | "name" | "disabled" | "privateToken", ExtArgs["result"]["gitProvider"]>

  export type $GitProviderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GitProvider"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      url: string
      type: string
      name: string
      disabled: boolean
      privateToken: string
    }, ExtArgs["result"]["gitProvider"]>
    composites: {}
  }

  type GitProviderGetPayload<S extends boolean | null | undefined | GitProviderDefaultArgs> = $Result.GetResult<Prisma.$GitProviderPayload, S>

  type GitProviderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GitProviderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GitProviderCountAggregateInputType | true
    }

  export interface GitProviderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GitProvider'], meta: { name: 'GitProvider' } }
    /**
     * Find zero or one GitProvider that matches the filter.
     * @param {GitProviderFindUniqueArgs} args - Arguments to find a GitProvider
     * @example
     * // Get one GitProvider
     * const gitProvider = await prisma.gitProvider.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GitProviderFindUniqueArgs>(args: SelectSubset<T, GitProviderFindUniqueArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GitProvider that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GitProviderFindUniqueOrThrowArgs} args - Arguments to find a GitProvider
     * @example
     * // Get one GitProvider
     * const gitProvider = await prisma.gitProvider.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GitProviderFindUniqueOrThrowArgs>(args: SelectSubset<T, GitProviderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GitProvider that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderFindFirstArgs} args - Arguments to find a GitProvider
     * @example
     * // Get one GitProvider
     * const gitProvider = await prisma.gitProvider.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GitProviderFindFirstArgs>(args?: SelectSubset<T, GitProviderFindFirstArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GitProvider that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderFindFirstOrThrowArgs} args - Arguments to find a GitProvider
     * @example
     * // Get one GitProvider
     * const gitProvider = await prisma.gitProvider.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GitProviderFindFirstOrThrowArgs>(args?: SelectSubset<T, GitProviderFindFirstOrThrowArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GitProviders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GitProviders
     * const gitProviders = await prisma.gitProvider.findMany()
     * 
     * // Get first 10 GitProviders
     * const gitProviders = await prisma.gitProvider.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gitProviderWithIdOnly = await prisma.gitProvider.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GitProviderFindManyArgs>(args?: SelectSubset<T, GitProviderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GitProvider.
     * @param {GitProviderCreateArgs} args - Arguments to create a GitProvider.
     * @example
     * // Create one GitProvider
     * const GitProvider = await prisma.gitProvider.create({
     *   data: {
     *     // ... data to create a GitProvider
     *   }
     * })
     * 
     */
    create<T extends GitProviderCreateArgs>(args: SelectSubset<T, GitProviderCreateArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GitProviders.
     * @param {GitProviderCreateManyArgs} args - Arguments to create many GitProviders.
     * @example
     * // Create many GitProviders
     * const gitProvider = await prisma.gitProvider.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GitProviderCreateManyArgs>(args?: SelectSubset<T, GitProviderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GitProviders and returns the data saved in the database.
     * @param {GitProviderCreateManyAndReturnArgs} args - Arguments to create many GitProviders.
     * @example
     * // Create many GitProviders
     * const gitProvider = await prisma.gitProvider.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GitProviders and only return the `id`
     * const gitProviderWithIdOnly = await prisma.gitProvider.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GitProviderCreateManyAndReturnArgs>(args?: SelectSubset<T, GitProviderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GitProvider.
     * @param {GitProviderDeleteArgs} args - Arguments to delete one GitProvider.
     * @example
     * // Delete one GitProvider
     * const GitProvider = await prisma.gitProvider.delete({
     *   where: {
     *     // ... filter to delete one GitProvider
     *   }
     * })
     * 
     */
    delete<T extends GitProviderDeleteArgs>(args: SelectSubset<T, GitProviderDeleteArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GitProvider.
     * @param {GitProviderUpdateArgs} args - Arguments to update one GitProvider.
     * @example
     * // Update one GitProvider
     * const gitProvider = await prisma.gitProvider.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GitProviderUpdateArgs>(args: SelectSubset<T, GitProviderUpdateArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GitProviders.
     * @param {GitProviderDeleteManyArgs} args - Arguments to filter GitProviders to delete.
     * @example
     * // Delete a few GitProviders
     * const { count } = await prisma.gitProvider.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GitProviderDeleteManyArgs>(args?: SelectSubset<T, GitProviderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GitProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GitProviders
     * const gitProvider = await prisma.gitProvider.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GitProviderUpdateManyArgs>(args: SelectSubset<T, GitProviderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GitProviders and returns the data updated in the database.
     * @param {GitProviderUpdateManyAndReturnArgs} args - Arguments to update many GitProviders.
     * @example
     * // Update many GitProviders
     * const gitProvider = await prisma.gitProvider.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GitProviders and only return the `id`
     * const gitProviderWithIdOnly = await prisma.gitProvider.updateManyAndReturn({
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
    updateManyAndReturn<T extends GitProviderUpdateManyAndReturnArgs>(args: SelectSubset<T, GitProviderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GitProvider.
     * @param {GitProviderUpsertArgs} args - Arguments to update or create a GitProvider.
     * @example
     * // Update or create a GitProvider
     * const gitProvider = await prisma.gitProvider.upsert({
     *   create: {
     *     // ... data to create a GitProvider
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GitProvider we want to update
     *   }
     * })
     */
    upsert<T extends GitProviderUpsertArgs>(args: SelectSubset<T, GitProviderUpsertArgs<ExtArgs>>): Prisma__GitProviderClient<$Result.GetResult<Prisma.$GitProviderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GitProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderCountArgs} args - Arguments to filter GitProviders to count.
     * @example
     * // Count the number of GitProviders
     * const count = await prisma.gitProvider.count({
     *   where: {
     *     // ... the filter for the GitProviders we want to count
     *   }
     * })
    **/
    count<T extends GitProviderCountArgs>(
      args?: Subset<T, GitProviderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GitProviderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GitProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GitProviderAggregateArgs>(args: Subset<T, GitProviderAggregateArgs>): Prisma.PrismaPromise<GetGitProviderAggregateType<T>>

    /**
     * Group by GitProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitProviderGroupByArgs} args - Group by arguments.
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
      T extends GitProviderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GitProviderGroupByArgs['orderBy'] }
        : { orderBy?: GitProviderGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GitProviderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGitProviderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GitProvider model
   */
  readonly fields: GitProviderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GitProvider.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GitProviderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the GitProvider model
   */
  interface GitProviderFieldRefs {
    readonly id: FieldRef<"GitProvider", 'String'>
    readonly url: FieldRef<"GitProvider", 'String'>
    readonly type: FieldRef<"GitProvider", 'String'>
    readonly name: FieldRef<"GitProvider", 'String'>
    readonly disabled: FieldRef<"GitProvider", 'Boolean'>
    readonly privateToken: FieldRef<"GitProvider", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GitProvider findUnique
   */
  export type GitProviderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter, which GitProvider to fetch.
     */
    where: GitProviderWhereUniqueInput
  }

  /**
   * GitProvider findUniqueOrThrow
   */
  export type GitProviderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter, which GitProvider to fetch.
     */
    where: GitProviderWhereUniqueInput
  }

  /**
   * GitProvider findFirst
   */
  export type GitProviderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter, which GitProvider to fetch.
     */
    where?: GitProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitProviders to fetch.
     */
    orderBy?: GitProviderOrderByWithRelationInput | GitProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GitProviders.
     */
    cursor?: GitProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GitProviders.
     */
    distinct?: GitProviderScalarFieldEnum | GitProviderScalarFieldEnum[]
  }

  /**
   * GitProvider findFirstOrThrow
   */
  export type GitProviderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter, which GitProvider to fetch.
     */
    where?: GitProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitProviders to fetch.
     */
    orderBy?: GitProviderOrderByWithRelationInput | GitProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GitProviders.
     */
    cursor?: GitProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GitProviders.
     */
    distinct?: GitProviderScalarFieldEnum | GitProviderScalarFieldEnum[]
  }

  /**
   * GitProvider findMany
   */
  export type GitProviderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter, which GitProviders to fetch.
     */
    where?: GitProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitProviders to fetch.
     */
    orderBy?: GitProviderOrderByWithRelationInput | GitProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GitProviders.
     */
    cursor?: GitProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitProviders.
     */
    skip?: number
    distinct?: GitProviderScalarFieldEnum | GitProviderScalarFieldEnum[]
  }

  /**
   * GitProvider create
   */
  export type GitProviderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * The data needed to create a GitProvider.
     */
    data: XOR<GitProviderCreateInput, GitProviderUncheckedCreateInput>
  }

  /**
   * GitProvider createMany
   */
  export type GitProviderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GitProviders.
     */
    data: GitProviderCreateManyInput | GitProviderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GitProvider createManyAndReturn
   */
  export type GitProviderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * The data used to create many GitProviders.
     */
    data: GitProviderCreateManyInput | GitProviderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GitProvider update
   */
  export type GitProviderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * The data needed to update a GitProvider.
     */
    data: XOR<GitProviderUpdateInput, GitProviderUncheckedUpdateInput>
    /**
     * Choose, which GitProvider to update.
     */
    where: GitProviderWhereUniqueInput
  }

  /**
   * GitProvider updateMany
   */
  export type GitProviderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GitProviders.
     */
    data: XOR<GitProviderUpdateManyMutationInput, GitProviderUncheckedUpdateManyInput>
    /**
     * Filter which GitProviders to update
     */
    where?: GitProviderWhereInput
    /**
     * Limit how many GitProviders to update.
     */
    limit?: number
  }

  /**
   * GitProvider updateManyAndReturn
   */
  export type GitProviderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * The data used to update GitProviders.
     */
    data: XOR<GitProviderUpdateManyMutationInput, GitProviderUncheckedUpdateManyInput>
    /**
     * Filter which GitProviders to update
     */
    where?: GitProviderWhereInput
    /**
     * Limit how many GitProviders to update.
     */
    limit?: number
  }

  /**
   * GitProvider upsert
   */
  export type GitProviderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * The filter to search for the GitProvider to update in case it exists.
     */
    where: GitProviderWhereUniqueInput
    /**
     * In case the GitProvider found by the `where` argument doesn't exist, create a new GitProvider with this data.
     */
    create: XOR<GitProviderCreateInput, GitProviderUncheckedCreateInput>
    /**
     * In case the GitProvider was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GitProviderUpdateInput, GitProviderUncheckedUpdateInput>
  }

  /**
   * GitProvider delete
   */
  export type GitProviderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
    /**
     * Filter which GitProvider to delete.
     */
    where: GitProviderWhereUniqueInput
  }

  /**
   * GitProvider deleteMany
   */
  export type GitProviderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GitProviders to delete
     */
    where?: GitProviderWhereInput
    /**
     * Limit how many GitProviders to delete.
     */
    limit?: number
  }

  /**
   * GitProvider without action
   */
  export type GitProviderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitProvider
     */
    select?: GitProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitProvider
     */
    omit?: GitProviderOmit<ExtArgs> | null
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


  export const CoverageScalarFieldEnum: {
    id: 'id',
    instrumentCwd: 'instrumentCwd',
    sha: 'sha',
    branch: 'branch',
    compareTarget: 'compareTarget',
    provider: 'provider',
    buildProvider: 'buildProvider',
    buildID: 'buildID',
    repoID: 'repoID',
    reporter: 'reporter',
    reportProvider: 'reportProvider',
    reportID: 'reportID',
    scopeID: 'scopeID',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CoverageScalarFieldEnum = (typeof CoverageScalarFieldEnum)[keyof typeof CoverageScalarFieldEnum]


  export const CoverageMapRelationScalarFieldEnum: {
    id: 'id',
    absolutePath: 'absolutePath',
    relativePath: 'relativePath',
    hashID: 'hashID',
    coverageID: 'coverageID'
  };

  export type CoverageMapRelationScalarFieldEnum = (typeof CoverageMapRelationScalarFieldEnum)[keyof typeof CoverageMapRelationScalarFieldEnum]


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


  export const ConfigScalarFieldEnum: {
    id: 'id',
    key: 'key',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConfigScalarFieldEnum = (typeof ConfigScalarFieldEnum)[keyof typeof ConfigScalarFieldEnum]


  export const GitProviderScalarFieldEnum: {
    id: 'id',
    url: 'url',
    type: 'type',
    name: 'name',
    disabled: 'disabled',
    privateToken: 'privateToken'
  };

  export type GitProviderScalarFieldEnum = (typeof GitProviderScalarFieldEnum)[keyof typeof GitProviderScalarFieldEnum]


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
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
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

  export type CoverageWhereInput = {
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    id?: StringFilter<"Coverage"> | string
    instrumentCwd?: StringFilter<"Coverage"> | string
    sha?: StringFilter<"Coverage"> | string
    branch?: StringFilter<"Coverage"> | string
    compareTarget?: StringFilter<"Coverage"> | string
    provider?: StringFilter<"Coverage"> | string
    buildProvider?: StringFilter<"Coverage"> | string
    buildID?: StringFilter<"Coverage"> | string
    repoID?: StringFilter<"Coverage"> | string
    reporter?: StringFilter<"Coverage"> | string
    reportProvider?: StringFilter<"Coverage"> | string
    reportID?: StringFilter<"Coverage"> | string
    scopeID?: StringFilter<"Coverage"> | string
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
  }

  export type CoverageOrderByWithRelationInput = {
    id?: SortOrder
    instrumentCwd?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    scopeID?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageWhereInput | CoverageWhereInput[]
    OR?: CoverageWhereInput[]
    NOT?: CoverageWhereInput | CoverageWhereInput[]
    instrumentCwd?: StringFilter<"Coverage"> | string
    sha?: StringFilter<"Coverage"> | string
    branch?: StringFilter<"Coverage"> | string
    compareTarget?: StringFilter<"Coverage"> | string
    provider?: StringFilter<"Coverage"> | string
    buildProvider?: StringFilter<"Coverage"> | string
    buildID?: StringFilter<"Coverage"> | string
    repoID?: StringFilter<"Coverage"> | string
    reporter?: StringFilter<"Coverage"> | string
    reportProvider?: StringFilter<"Coverage"> | string
    reportID?: StringFilter<"Coverage"> | string
    scopeID?: StringFilter<"Coverage"> | string
    createdAt?: DateTimeFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeFilter<"Coverage"> | Date | string
  }, "id">

  export type CoverageOrderByWithAggregationInput = {
    id?: SortOrder
    instrumentCwd?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    scopeID?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CoverageCountOrderByAggregateInput
    _max?: CoverageMaxOrderByAggregateInput
    _min?: CoverageMinOrderByAggregateInput
  }

  export type CoverageScalarWhereWithAggregatesInput = {
    AND?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    OR?: CoverageScalarWhereWithAggregatesInput[]
    NOT?: CoverageScalarWhereWithAggregatesInput | CoverageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Coverage"> | string
    instrumentCwd?: StringWithAggregatesFilter<"Coverage"> | string
    sha?: StringWithAggregatesFilter<"Coverage"> | string
    branch?: StringWithAggregatesFilter<"Coverage"> | string
    compareTarget?: StringWithAggregatesFilter<"Coverage"> | string
    provider?: StringWithAggregatesFilter<"Coverage"> | string
    buildProvider?: StringWithAggregatesFilter<"Coverage"> | string
    buildID?: StringWithAggregatesFilter<"Coverage"> | string
    repoID?: StringWithAggregatesFilter<"Coverage"> | string
    reporter?: StringWithAggregatesFilter<"Coverage"> | string
    reportProvider?: StringWithAggregatesFilter<"Coverage"> | string
    reportID?: StringWithAggregatesFilter<"Coverage"> | string
    scopeID?: StringWithAggregatesFilter<"Coverage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Coverage"> | Date | string
  }

  export type CoverageMapRelationWhereInput = {
    AND?: CoverageMapRelationWhereInput | CoverageMapRelationWhereInput[]
    OR?: CoverageMapRelationWhereInput[]
    NOT?: CoverageMapRelationWhereInput | CoverageMapRelationWhereInput[]
    id?: StringFilter<"CoverageMapRelation"> | string
    absolutePath?: StringFilter<"CoverageMapRelation"> | string
    relativePath?: StringFilter<"CoverageMapRelation"> | string
    hashID?: StringFilter<"CoverageMapRelation"> | string
    coverageID?: StringFilter<"CoverageMapRelation"> | string
  }

  export type CoverageMapRelationOrderByWithRelationInput = {
    id?: SortOrder
    absolutePath?: SortOrder
    relativePath?: SortOrder
    hashID?: SortOrder
    coverageID?: SortOrder
  }

  export type CoverageMapRelationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CoverageMapRelationWhereInput | CoverageMapRelationWhereInput[]
    OR?: CoverageMapRelationWhereInput[]
    NOT?: CoverageMapRelationWhereInput | CoverageMapRelationWhereInput[]
    absolutePath?: StringFilter<"CoverageMapRelation"> | string
    relativePath?: StringFilter<"CoverageMapRelation"> | string
    hashID?: StringFilter<"CoverageMapRelation"> | string
    coverageID?: StringFilter<"CoverageMapRelation"> | string
  }, "id">

  export type CoverageMapRelationOrderByWithAggregationInput = {
    id?: SortOrder
    absolutePath?: SortOrder
    relativePath?: SortOrder
    hashID?: SortOrder
    coverageID?: SortOrder
    _count?: CoverageMapRelationCountOrderByAggregateInput
    _max?: CoverageMapRelationMaxOrderByAggregateInput
    _min?: CoverageMapRelationMinOrderByAggregateInput
  }

  export type CoverageMapRelationScalarWhereWithAggregatesInput = {
    AND?: CoverageMapRelationScalarWhereWithAggregatesInput | CoverageMapRelationScalarWhereWithAggregatesInput[]
    OR?: CoverageMapRelationScalarWhereWithAggregatesInput[]
    NOT?: CoverageMapRelationScalarWhereWithAggregatesInput | CoverageMapRelationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CoverageMapRelation"> | string
    absolutePath?: StringWithAggregatesFilter<"CoverageMapRelation"> | string
    relativePath?: StringWithAggregatesFilter<"CoverageMapRelation"> | string
    hashID?: StringWithAggregatesFilter<"CoverageMapRelation"> | string
    coverageID?: StringWithAggregatesFilter<"CoverageMapRelation"> | string
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

  export type GitProviderWhereInput = {
    AND?: GitProviderWhereInput | GitProviderWhereInput[]
    OR?: GitProviderWhereInput[]
    NOT?: GitProviderWhereInput | GitProviderWhereInput[]
    id?: StringFilter<"GitProvider"> | string
    url?: StringFilter<"GitProvider"> | string
    type?: StringFilter<"GitProvider"> | string
    name?: StringFilter<"GitProvider"> | string
    disabled?: BoolFilter<"GitProvider"> | boolean
    privateToken?: StringFilter<"GitProvider"> | string
  }

  export type GitProviderOrderByWithRelationInput = {
    id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    name?: SortOrder
    disabled?: SortOrder
    privateToken?: SortOrder
  }

  export type GitProviderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GitProviderWhereInput | GitProviderWhereInput[]
    OR?: GitProviderWhereInput[]
    NOT?: GitProviderWhereInput | GitProviderWhereInput[]
    url?: StringFilter<"GitProvider"> | string
    type?: StringFilter<"GitProvider"> | string
    name?: StringFilter<"GitProvider"> | string
    disabled?: BoolFilter<"GitProvider"> | boolean
    privateToken?: StringFilter<"GitProvider"> | string
  }, "id">

  export type GitProviderOrderByWithAggregationInput = {
    id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    name?: SortOrder
    disabled?: SortOrder
    privateToken?: SortOrder
    _count?: GitProviderCountOrderByAggregateInput
    _max?: GitProviderMaxOrderByAggregateInput
    _min?: GitProviderMinOrderByAggregateInput
  }

  export type GitProviderScalarWhereWithAggregatesInput = {
    AND?: GitProviderScalarWhereWithAggregatesInput | GitProviderScalarWhereWithAggregatesInput[]
    OR?: GitProviderScalarWhereWithAggregatesInput[]
    NOT?: GitProviderScalarWhereWithAggregatesInput | GitProviderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GitProvider"> | string
    url?: StringWithAggregatesFilter<"GitProvider"> | string
    type?: StringWithAggregatesFilter<"GitProvider"> | string
    name?: StringWithAggregatesFilter<"GitProvider"> | string
    disabled?: BoolWithAggregatesFilter<"GitProvider"> | boolean
    privateToken?: StringWithAggregatesFilter<"GitProvider"> | string
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

  export type CoverageCreateInput = {
    id?: string
    instrumentCwd: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    reporter: string
    reportProvider: string
    reportID: string
    scopeID: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUncheckedCreateInput = {
    id?: string
    instrumentCwd: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    reporter: string
    reportProvider: string
    reportID: string
    scopeID: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    scopeID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    scopeID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageCreateManyInput = {
    id?: string
    instrumentCwd: string
    sha: string
    branch: string
    compareTarget: string
    provider: string
    buildProvider: string
    buildID: string
    repoID: string
    reporter: string
    reportProvider: string
    reportID: string
    scopeID: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CoverageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    scopeID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    instrumentCwd?: StringFieldUpdateOperationsInput | string
    sha?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    compareTarget?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    buildProvider?: StringFieldUpdateOperationsInput | string
    buildID?: StringFieldUpdateOperationsInput | string
    repoID?: StringFieldUpdateOperationsInput | string
    reporter?: StringFieldUpdateOperationsInput | string
    reportProvider?: StringFieldUpdateOperationsInput | string
    reportID?: StringFieldUpdateOperationsInput | string
    scopeID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverageMapRelationCreateInput = {
    id?: string
    absolutePath: string
    relativePath: string
    hashID: string
    coverageID: string
  }

  export type CoverageMapRelationUncheckedCreateInput = {
    id?: string
    absolutePath: string
    relativePath: string
    hashID: string
    coverageID: string
  }

  export type CoverageMapRelationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    absolutePath?: StringFieldUpdateOperationsInput | string
    relativePath?: StringFieldUpdateOperationsInput | string
    hashID?: StringFieldUpdateOperationsInput | string
    coverageID?: StringFieldUpdateOperationsInput | string
  }

  export type CoverageMapRelationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    absolutePath?: StringFieldUpdateOperationsInput | string
    relativePath?: StringFieldUpdateOperationsInput | string
    hashID?: StringFieldUpdateOperationsInput | string
    coverageID?: StringFieldUpdateOperationsInput | string
  }

  export type CoverageMapRelationCreateManyInput = {
    id?: string
    absolutePath: string
    relativePath: string
    hashID: string
    coverageID: string
  }

  export type CoverageMapRelationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    absolutePath?: StringFieldUpdateOperationsInput | string
    relativePath?: StringFieldUpdateOperationsInput | string
    hashID?: StringFieldUpdateOperationsInput | string
    coverageID?: StringFieldUpdateOperationsInput | string
  }

  export type CoverageMapRelationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    absolutePath?: StringFieldUpdateOperationsInput | string
    relativePath?: StringFieldUpdateOperationsInput | string
    hashID?: StringFieldUpdateOperationsInput | string
    coverageID?: StringFieldUpdateOperationsInput | string
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

  export type GitProviderCreateInput = {
    id: string
    url: string
    type: string
    name: string
    disabled: boolean
    privateToken: string
  }

  export type GitProviderUncheckedCreateInput = {
    id: string
    url: string
    type: string
    name: string
    disabled: boolean
    privateToken: string
  }

  export type GitProviderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    privateToken?: StringFieldUpdateOperationsInput | string
  }

  export type GitProviderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    privateToken?: StringFieldUpdateOperationsInput | string
  }

  export type GitProviderCreateManyInput = {
    id: string
    url: string
    type: string
    name: string
    disabled: boolean
    privateToken: string
  }

  export type GitProviderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    privateToken?: StringFieldUpdateOperationsInput | string
  }

  export type GitProviderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    privateToken?: StringFieldUpdateOperationsInput | string
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

  export type CoverageCountOrderByAggregateInput = {
    id?: SortOrder
    instrumentCwd?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    scopeID?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageMaxOrderByAggregateInput = {
    id?: SortOrder
    instrumentCwd?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    scopeID?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageMinOrderByAggregateInput = {
    id?: SortOrder
    instrumentCwd?: SortOrder
    sha?: SortOrder
    branch?: SortOrder
    compareTarget?: SortOrder
    provider?: SortOrder
    buildProvider?: SortOrder
    buildID?: SortOrder
    repoID?: SortOrder
    reporter?: SortOrder
    reportProvider?: SortOrder
    reportID?: SortOrder
    scopeID?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CoverageMapRelationCountOrderByAggregateInput = {
    id?: SortOrder
    absolutePath?: SortOrder
    relativePath?: SortOrder
    hashID?: SortOrder
    coverageID?: SortOrder
  }

  export type CoverageMapRelationMaxOrderByAggregateInput = {
    id?: SortOrder
    absolutePath?: SortOrder
    relativePath?: SortOrder
    hashID?: SortOrder
    coverageID?: SortOrder
  }

  export type CoverageMapRelationMinOrderByAggregateInput = {
    id?: SortOrder
    absolutePath?: SortOrder
    relativePath?: SortOrder
    hashID?: SortOrder
    coverageID?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type GitProviderCountOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    name?: SortOrder
    disabled?: SortOrder
    privateToken?: SortOrder
  }

  export type GitProviderMaxOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    name?: SortOrder
    disabled?: SortOrder
    privateToken?: SortOrder
  }

  export type GitProviderMinOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    type?: SortOrder
    name?: SortOrder
    disabled?: SortOrder
    privateToken?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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