import { OperationTypeNode } from 'graphql';
import React, { ErrorInfo } from 'react';
import { isOperationError } from './ApolloOperationError';

interface IProps {
  fallback: React.ReactType<{ error: Error; onRetry: () => void }>;
  shouldBailOnType: ReadonlyArray<OperationTypeNode>;
  onError(error: Error, errorInfo: ErrorInfo): void;
}

interface IState {
  error?: Error;
}

export class BasicErrorHandler extends React.Component<IProps, IState> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state: IState = {};

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  onRetry = () => {
    this.setState({ error: undefined });
  };

  render() {
    const { error } = this.state;
    const { shouldBailOnType, fallback, children } = this.props;
    if (error && isOperationError(error)) {
      const type = error.operationType;
      if (type && shouldBailOnType.indexOf(type) >= 0) {
        return React.createElement(
          fallback,
          { error, onRetry: this.onRetry },
          children
        );
      }
    }
    return children;
  }
}
