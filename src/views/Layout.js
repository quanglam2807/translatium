/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import { replace, goBack } from 'react-router-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { red500, fullWhite, fullBlack } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import ActionHome from 'material-ui/svg-icons/action/home';
import ToggleStar from 'material-ui/svg-icons/toggle/star';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ActionHelp from 'material-ui/svg-icons/action/help';
import CircularProgress from 'material-ui/CircularProgress';

import { screenResize } from '../actions/screen';
import { updateImeMode } from '../actions/home';
import colorPairs from '../constants/colorPairs';

import Alert from './Alert';

/* global window */

class App extends React.Component {
  getChildContext() {
    const { theme, primaryColorId } = this.props;

    const pTheme = (theme === 'dark') ? darkBaseTheme : lightBaseTheme;

    const { primary1Color, primary2Color } = colorPairs[primaryColorId];

    pTheme.palette.primary1Color = primary1Color;
    pTheme.palette.primary2Color = primary2Color;
    pTheme.palette.accent1Color = red500;
    if (theme === 'dark') {
      pTheme.palette.accent2Color = primary1Color;
    }
    pTheme.palette.alternateTextColor = fullWhite;

    const muiTheme = getMuiTheme(pTheme);
    muiTheme.appBar.height = 56;
    muiTheme.bottomNavigation.selectedFontSize = muiTheme.bottomNavigation.unselectedFontSize;

    return {
      muiTheme,
    };
  }

  componentDidMount() {
    if (process.env.PLATFORM === 'cordova') {
      /* global StatusBar */
      StatusBar.backgroundColorByHexString(
        colorPairs[this.props.primaryColorId].primary2Color,
      );
    }

    if (process.env.PLATFORM === 'windows') {
      this.setAppTitleBar(this.props.primaryColorId);

      const { onBackClick } = this.props;

      const systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
      systemNavigationManager.onbackrequested = (e) => {
        const { bottomNavigationSelectedIndex } = this.props;
        if (bottomNavigationSelectedIndex < 0) {
          onBackClick();
          /* eslint-disable */
          e.handled = true;
          /* eslint-enable */
        }
      };
    }

    window.addEventListener('resize', this.props.onResize);
  }

  componentWillUpdate(nextProps) {
    const { primaryColorId } = this.props;

    if (primaryColorId !== nextProps.primaryColorId) {
      if (process.env.PLATFORM === 'windows') {
        this.setAppTitleBar(nextProps.primaryColorId);
      }
      if (process.env.PLATFORM === 'cordova') {
        /* global StatusBar */
        StatusBar.backgroundColorByHexString(
          colorPairs[nextProps.primaryColorId].primary2Color,
        );
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  setAppTitleBar(primaryColorId) {
    /* global Windows */

    const color = colorPairs[primaryColorId];
    const regCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.primary2Color);
    const backgroundColor = {
      r: parseInt(regCode[1], 16),
      g: parseInt(regCode[2], 16),
      b: parseInt(regCode[3], 16),
      a: 1,
    };
    const foregroundColor = { r: 255, g: 255, b: 255, a: 1 };

    // PC
    if (Windows.UI.ViewManagement.ApplicationView) {
      const v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
      v.titleBar.backgroundColor = backgroundColor;
      v.titleBar.foregroundColor = foregroundColor;
      v.titleBar.buttonBackgroundColor = backgroundColor;
      v.titleBar.buttonForegroundColor = foregroundColor;
    }

    if (Windows.UI.ViewManagement.StatusBar) {
      const statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
      statusBar.backgroundColor = backgroundColor;
      statusBar.foregroundColor = foregroundColor;
      statusBar.backgroundOpacity = 1;
      statusBar.showAsync();
    }
  }

  getStyles() {
    const { theme, primaryColorId } = this.props;
    const { primary2Color } = colorPairs[primaryColorId];

    return {
      container: {
        overflowY: 'hidden',
        backgroundColor: (theme === 'dark') ? fullBlack : fullWhite,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      },
      fullPageProgress: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      fakeTitleBar: {
        flexBasis: 22,
        height: 22,
        backgroundColor: primary2Color,
        color: fullWhite,
        textAlign: 'center',
        fontSize: 13,
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag',
      },
      contentContainer: {
        flex: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    };
  }

  render() {
    const {
      children,
      pathname,
      bottomNavigationSelectedIndex,
      fullPageLoading,
      onBottomNavigationItemClick,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div className="fs" style={styles.container}>
        {process.env.PLATFORM === 'mac' ? (
          <div style={styles.fakeTitleBar}>
            Modern Translator
          </div>
        ) : null}
        <div style={styles.contentContainer}>
          {fullPageLoading ? (<div style={styles.fullPageProgress}>
            <CircularProgress size={80} thickness={5} />
          </div>) : null}
          <Alert />
          <ReactCSSTransitionGroup
            transitionName="background"
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
            style={{
              flex: 1,
              height: '100%',
              position: 'relative',
            }}
          >
            <div
              key={pathname}
              style={{
                height: '100%',
              }}
            >
              {children}
            </div>
          </ReactCSSTransitionGroup>
          {bottomNavigationSelectedIndex > -1 ? (
            <Paper zDepth={2} style={{ zIndex: 1000 }}>
              <BottomNavigation selectedIndex={bottomNavigationSelectedIndex}>
                <BottomNavigationItem
                  label={strings.home}
                  icon={<ActionHome />}
                  onTouchTap={() => onBottomNavigationItemClick('/')}
                />
                <BottomNavigationItem
                  label={strings.phrasebook}
                  icon={<ToggleStar />}
                  onTouchTap={() => onBottomNavigationItemClick('/phrasebook')}
                />
                <BottomNavigationItem
                  label={strings.settings}
                  icon={<ActionSettings />}
                  onTouchTap={() => onBottomNavigationItemClick('/settings')}
                />
                <BottomNavigationItem
                  label={strings.help}
                  icon={<ActionHelp />}
                  onTouchTap={() => onBottomNavigationItemClick('/help')}
                />
              </BottomNavigation>
            </Paper>
          ) : null}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element, // matched child route component
  pathname: React.PropTypes.string,
  theme: React.PropTypes.string,
  primaryColorId: React.PropTypes.string,
  fullPageLoading: React.PropTypes.bool,
  bottomNavigationSelectedIndex: React.PropTypes.number,
  onResize: React.PropTypes.func,
  onBottomNavigationItemClick: React.PropTypes.func,
  onBackClick: React.PropTypes.func,
};

App.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  let bottomNavigationSelectedIndex = -1;
  switch (ownProps.location.pathname) {
    case '/help':
      bottomNavigationSelectedIndex = 3;
      break;
    case '/settings':
      bottomNavigationSelectedIndex = 2;
      break;
    case '/phrasebook':
      bottomNavigationSelectedIndex = 1;
      break;
    case '/':
      bottomNavigationSelectedIndex = 0;
      break;
    default:
      bottomNavigationSelectedIndex = -1;
  }


  return {
    pathname: ownProps.location.pathname,
    fullPageLoading: state.ocr && state.ocr.get('status') === 'loading',
    theme: state.settings.theme,
    primaryColorId: state.settings.primaryColorId,
    bottomNavigationSelectedIndex,
  };
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
    dispatch(updateImeMode(null));
  },
  onBottomNavigationItemClick: (pathname) => {
    dispatch(replace(pathname));
  },
  onBackClick: () => {
    dispatch(goBack());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(App);
