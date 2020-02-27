import React from "react";
import "./slugline.scss";
import { Router, Switch, Route } from "react-router-dom";
import { Toast } from "react-bootstrap";
import { createBrowserHistory, Location } from "history";

import Header from "./header/Header";
import IssuesList from "./issues/IssuesList";
import IssuePage from "./issues/IssuePage";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import Dash from "./dash/Dash";
import Profile from "./profile/Profile";
import AdminPanel from "./admin/Admin";
import { ToastMessage, ToastProvider, useToast } from "./shared/ToastContext";
import { initLibrary } from "./shared/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

initLibrary();

const history = createBrowserHistory();

const App: React.FC = () => {
  const auth = useAuth();

  history.listen(() => {
    // TODO: why does this call stack
    // auth.check(true);
  });

  return (
    <Router history={history}>
      <div className="container">
        <Header/>
        <div>
          <Switch>
            <Route exact path="/">
              HOME CONTENT
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/issues/:issue_id">
              <IssuePage />
            </Route>
            <Route path="/issues">
              <IssuesList />
            </Route>
            <PrivateRoute path="/dash">
              <Dash />
            </PrivateRoute>
            <PrivateRoute path="/profile">
              <Profile user={auth.user} />
            </PrivateRoute>
            <AdminRoute path="/admin">
              <AdminPanel />
            </AdminRoute>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

const ToastContainer = () => {
  const toast = useToast();

  return (
    <div aria-live="polite" aria-atomic="true" style={{
      position: "fixed",
      right: 0,
      bottom: 0,
    }}>
      {toast.toasts.map((msg, i) => {
        const onClose = () => {
          toast.setToasts((_prevToasts: ToastMessage[]) => {
            const prevToasts = _prevToasts.slice();
            // We can heuristically search only previous entries since the toasts list should only be pushed to
            for (let j = Math.min(i, prevToasts.length - 1); j >= 0; --j) {
              if (prevToasts[j].id === msg.id) {
                prevToasts[j].show = false;
                return prevToasts;
              }
            }
            // if that doesn't work, perform the forwards search I guess
            for (let k = i + 1; k < prevToasts.length; ++k) {
              if (prevToasts[k].id === msg.id) {
                prevToasts[k].show = false;
                break;
              }
            }
            return prevToasts;
          });
          setTimeout(() => {
            // same as above
            toast.setToasts((_prevToasts: ToastMessage[]) => {
              const prevToasts = _prevToasts.slice();
              for (let j = Math.min(i, prevToasts.length - 1); j >= 0; --j) {
                if (prevToasts[j].id === msg.id) {
                  prevToasts.splice(j, 1);
                  return prevToasts;
                }
              }
              for (let k = i + 1; k < prevToasts.length; ++k) {
                if (prevToasts[k].id === msg.id) {
                  prevToasts.splice(k, 1);
                  break;
                }
              }
              return prevToasts;
            });
          }, 200);
        };
        return (
          <Toast
            key={msg.id}
            onClose={onClose}
            onClick={onClose}
            show={msg.show ?? true}
            delay={msg._delay ?? 0}
            autohide={msg.delay !== undefined}>

            {msg.title && <Toast.Header>
              <strong className="mr-auto">{msg.title}</strong>
            </Toast.Header>}
            <Toast.Body dangerouslySetInnerHTML={{__html: msg.body}}>
            </Toast.Body>
          </Toast>
        );
      })}
    </div>
  );
};

export default () => (
  <AuthProvider>
    <ToastProvider>
      <App />
      <ToastContainer />
    </ToastProvider>
  </AuthProvider>
);
