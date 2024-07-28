/**
 * A wrapper type for defining errors possible in a GQL operation
 */
export type GQLError<T extends string> =
  | {
      type: "network_error";
      error: Error;
    }
  | {
      type: "gql_error";
      error: T;
    };
