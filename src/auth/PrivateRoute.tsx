import React, { useEffect, useReducer, useRef } from "react";
import { RouteProps, Route, useHistory } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { useAuth } from "./Auth";
import Error404 from "../shared/errors/Error404";
import { APIError } from "../shared/types";
import ERRORS from "../shared/errors";
import Loader from "../shared/components/Loader";

interface PrivateRouteProps extends RouteProps {
  admin?: boolean;
  fallback?: React.ReactElement;
}

interface PrivateRouteState {
  ready: boolean;
  errors: string[];
}

type PrivateRouteAction =
  | { type: "done loading" }
  | { type: "is loading" }
  | { type: "error"; data: string[] };

/**
 * Wrapper for components inside a PrivateRoute. Handles authentication-related business.
 *
 * **This component depends on React handling state changes/lifecycle hooks in a deterministic manner. If stuff breaks
 * when changing routes or reloading pages, check here first.**
 *
 * The reason we created a wrapper component instead of handling authentication inside PrivateRoute is due to how
 * react-router mounts components inside routes on route changes:
 *
 *   1. history is changed as the user navigates to a new route.
 *   2. react-router unmounts the old component and mounts the new component, resulting in a rerender.
 *   3. useEffect runs after this DOM change as a result of the history change.
 *
 * Because we modify state in useEffect, handling auth inside PrivateRoute would result in unnecessary unmounting and
 * remounting of the new component. Moving auth into a wrapper component gives us more granular control over when
 * components mount, allowing us to render new components only when auth is ready. The lifecycle now looks like this:
 *
 *   1. User navigates to a new route, changing history and triggering react-router to unmount the old component as
 *      before, resulting in a rerender.
 *   2. Mounting of the old component set the authCheckCompleted ref to false, so instead of mounting the new component
 *      we display a loading component in the initial rerender.
 *   3. useEffect runs after the render, setting the component to the unready state while it waits for auth to respond.
 *   4. The state change causes a rerender that continues to display the loading component.
 *   5. Auth responds, setting the component to the ready state and setting the authCheckCompleted ref to true.
 *   6. The state change causes a rerender that, since the authCheckCompleted ref is now true, mounts the new component.
 *      The authCheckCompleted ref is set to false since a new component has now been mounted.
 *
 * Basically, you can think of this as a specific case of React.Suspense. :)
 *
 * We chose not to use a listener on history as then the order of execution could be indeterminate, and furthermore it
 * would introduce costs involved with registering a listener on every private route that would execute on every route
 * change.
 */
const PrivateRouteWrapper: React.FC<{
  admin?: boolean;
  fallback?: React.ReactElement;
  children: React.ReactNode;
}> = (props) => {
  const auth = useAuth();
  const history = useHistory();
  const [state, dispatch] = useReducer(
    (state: PrivateRouteState, action: PrivateRouteAction) => {
      switch (action.type) {
        case "done loading":
          return { ready: true, errors: [] };
        case "is loading":
          return { ready: false, errors: [] };
        case "error":
          return { ready: false, errors: action.data };
      }
      return state;
    },
    {
      ready: false,
      errors: [],
    }
  );
  // authCheckCompleted tells us whether the auth check has been completed, meaning it's safe to mount the child.
  const authCheckCompleted = useRef(false);

  // PrivateRoute can also be affected by changes in AuthProvider; we also check against auth to ensure children
  // are rerendered in the case of a change.
  // Since auth.check() doesn't change auth unless a request is made, we can simply use the whole auth object
  // as a dependency.
  useEffect(() => {
    dispatch({ type: "is loading" });
    auth.check()?.then(
      () => {
        dispatch({ type: "done loading" });
      },
      ({ status_code, ...e }: APIError) => {
        dispatch({ type: "error", data: Object.values(e).flat() });
      }
    );
    authCheckCompleted.current = true;

    return () => {
      authCheckCompleted.current = false;
    };
  }, [history.location.key, auth]);

  if (state.errors.length === 0) {
    if (authCheckCompleted.current && state.ready) {
      if ("NO_PRELOAD_ROUTE" in window.__SSR_DIRECTIVES__) {
        delete window.__SSR_DIRECTIVES__.NO_PRELOAD_ROUTE;
      }

      if (
        auth.isAuthenticated() &&
        ((props.admin && auth.isEditor()) || !props.admin)
      ) {
        authCheckCompleted.current = false;
        return <div key="children">{props.children}</div>;
      } else {
        return <Error404 />;
      }
    } else {
      // Sometimes, the server may send a directive to not preload a route. When that happens, we only render the
      // loader and skip mounting the child component.
      if ("NO_PRELOAD_ROUTE" in window.__SSR_DIRECTIVES__) {
        return props.fallback ?? <Loader variant="spinner" />;
      }

      return (
        <>
          {props.fallback ?? <Loader variant="spinner" />}
          {<div key="children" className="d-none" aria-hidden="true">
            {props.children}
          </div>}
        </>
      );
    }
  } else {
    return (
      <>
        {state.errors.map((err) => (
          <Alert key={err} variant="danger">
            {ERRORS[err]}
          </Alert>
        ))}
      </>
    );
  }
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  admin,
  fallback,
  render,
  component: Component,
  children,
  ...props
}: PrivateRouteProps) => {
  return (
    <Route
      {...props}
      render={(routeProps) => (
        <PrivateRouteWrapper admin={admin} fallback={fallback}>
          {render ? (
            render(routeProps)
          ) : Component ? (
            <Component {...routeProps} />
          ) : (
            children
          )}
        </PrivateRouteWrapper>
      )}
    />
  );
};

export default PrivateRoute;
