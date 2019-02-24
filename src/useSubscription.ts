import {
  ApolloClient,
  ApolloError,
  OperationVariables,
  SubscriptionOptions,
} from 'apollo-client';
import { DocumentNode } from 'graphql';
import { useEffect, useRef, useState } from 'react';

import { useApolloClient } from './ApolloContext';
import { ApolloOperationError } from './ApolloOperationError';
import { Omit, objToKey } from './utils';

export type OnSubscriptionData<TData> = (
  options: OnSubscriptionDataOptions<TData>
) => any;

export interface OnSubscriptionDataOptions<TData> {
  client: ApolloClient<any>;
  subscriptionData: SubscriptionHookResult<TData>;
}

export interface SubscriptionHookOptions<TData, TVariables, TCache = object>
  extends Omit<SubscriptionOptions<TVariables>, 'query'> {
  skip?: boolean;
  onSubscriptionData?: OnSubscriptionData<TData>;
  client?: ApolloClient<TCache>;
}

export interface SubscriptionHookResult<TData> {
  data?: TData;
  error?: ApolloError;
  loading: boolean;
}

export function useSubscription<
  TData = any,
  TVariables = OperationVariables,
  TCache = object
>(
  query: DocumentNode,
  {
    onSubscriptionData,
    client: overrideClient,
    ...options
  }: SubscriptionHookOptions<TData, TVariables, TCache> = {}
): SubscriptionHookResult<TData> {
  const client = useApolloClient(overrideClient);
  const onSubscriptionDataRef = useRef<
    OnSubscriptionData<TData> | null | undefined
  >(null);
  const [result, setResult] = useState<SubscriptionHookResult<TData>>({
    loading: true,
  });

  onSubscriptionDataRef.current = onSubscriptionData;

  useEffect(
    () => {
      if (options.skip === true) {
        return;
      }
      const subscription = client
        .subscribe({
          ...options,
          query,
        })
        .subscribe(
          nextResult => {
            const newResult = {
              data: nextResult.data,
              error: undefined,
              loading: false,
            };
            setResult(newResult);
            if (onSubscriptionDataRef.current) {
              onSubscriptionDataRef.current({
                client,
                subscriptionData: newResult,
              });
            }
          },
          error => {
            setResult({
              data: result.data,
              error: new ApolloOperationError(error, query, options.variables),
              loading: false,
            });
          }
        );
      return () => {
        setResult({ loading: true });
        subscription.unsubscribe();
      };
    },
    [query, options && objToKey(options)]
  );

  return result;
}
