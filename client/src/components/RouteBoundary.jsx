import { Component } from 'react';
import ErrorState from './ErrorState.jsx';

// A stale deploy or failed chunk download must leave a way to recover.
export default class RouteBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="establishment-detail-state">
          <ErrorState message={this.props.message} onRetry={() => window.location.reload()} />
        </div>
      );
    }
    return this.props.children;
  }
}
