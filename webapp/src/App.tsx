import React, { Component } from 'react';
import LoginPage from './pages/LogInPage';
import SignUpPage from './pages/SignUpPage';
import LogoutPage from './pages/LogOutPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { Route, Switch } from 'react-router-dom'
import './App.css';
import IndexPage from './pages/IndexPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetPasswordWithKeyPage from './pages/ResetPasswordWithKeyPage';
import { AppState } from './store'
import { application } from './store/application/selectors';
import { IApplication } from './store/application/types';
import { connect } from 'react-redux';
import Messages from './components/Messages';
import AcceptInvitePage from './pages/AcceptInvitePage';
import ExternalLinkPage from './pages/ExternalLinkPage';
import ContactPage from './pages/ContactPage';
import SuccessPage from './pages/SuccessPage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import CancelPage from './pages/CancelPage';

const mapStateToProps = (state: AppState) => ({
  application: application(state)
})

interface Props {
  application: IApplication
}

class App extends Component<Props, {}> {
  render() {
    return (
      <div id="main">
        <Switch>
          <Route path="/link/:key" component={ExternalLinkPage} />
          <Route exact path="/account/success" component={SuccessPage} />
          <Route exact path="/account/signupsuccess" component={SignupSuccessPage} />
          <Route exact path="/account/cancel" component={CancelPage} />
          <Route exact path="/account/contact" component={ContactPage} />
          <Route exact path="/account/logout" component={LogoutPage} />
          <Route exact path="/account/signup" component={SignUpPage} />
          <Route exact path="/account/login" component={LoginPage} />
          <Route exact path="/account/reset" component={ResetPasswordPage} />
          <Route exact path="/account/reset/:key" component={ResetPasswordWithKeyPage} />
          <Route exact path="/account/invitation/:code" component={AcceptInvitePage} />
          <Route path={"/account/verify/:key"} component={VerifyEmailPage} />
          <Route path="/" component={IndexPage} />
        </Switch>
        <Messages />
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(App);
