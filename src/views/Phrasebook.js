/* global strings */

import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import Immutable from 'immutable';

import AppBar from 'material-ui/AppBar';
import LinearProgress from 'material-ui/LinearProgress';
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';
import ToggleStar from 'material-ui/svg-icons/toggle/star';
import Divider from 'material-ui/Divider';

import { deletePhrasebookItem, loadPhrasebook } from '../actions/phrasebook';
import { loadOutput } from '../actions/home';


class Phrasebook extends React.Component {
  componentDidMount() {
    const { onEnterPhrasebook, onLoadMore } = this.props;

    onEnterPhrasebook();

    if (this.listView) {
      this.listView.onscroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.listView;
        if (scrollTop + clientHeight > scrollHeight - 200) {
          if (this.props.canLoadMore === true && this.props.phrasebookLoading === false) {
            onLoadMore();
          }
        }
      };
    }
  }

  componentWillUnmount() {
    if (this.listView) this.listView.onscroll = null;
  }

  getStyles() {
    const {
      palette: {
        textColor,
      },
    } = this.context.muiTheme;

    return {
      emptyContainer: {
        flex: 1,
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyInnerContainer: {
        textAlign: 'center',
        color: textColor,
      },
      bigIcon: {
        height: 96,
        width: 96,
      },
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      },
      listContainer: {
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        webkitOverflowScrolling: 'touch',
        padding: 0,
        boxSizing: 'border-box',
      },
      progress: {
        marginTop: 12,
      },
    };
  }

  render() {
    const {
      phrasebookItems, phrasebookLoading,
      onDeleteButtonTouchTap, onItemTouchTap,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        <AppBar
          title="Phrasebook"
          showMenuIconButton={false}
        />
        {(() => {
          if (phrasebookItems.size < 1 && phrasebookLoading === false) {
            return (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyInnerContainer}>
                  <ToggleStar style={styles.bigIcon} />
                  <h3>{strings.phrasebookIsEmpty}</h3>
                </div>
              </div>
            );
          }

          return (
            <div style={styles.listContainer} ref={(c) => { this.listView = c; }}>
              <List>
                {phrasebookItems.map(item => [(
                  <ListItem
                    key={`phrasebookItem_${item.get('phrasebookId')}`}
                    onTouchTap={() => onItemTouchTap(item)}
                    rightIconButton={(
                      <IconButton
                        tooltip={strings.removeFromPhrasebook}
                        tooltipPosition="bottom-left"
                        onTouchTap={(ev) => {
                          let e = ev;
                          /* global window */
                          if (!e) e = window.event;
                          e.cancelBubble = true;
                          if (e.stopPropagation) e.stopPropagation();

                          onDeleteButtonTouchTap(
                            item.get('phrasebookId'),
                            item.get('rev'),
                          );
                        }}
                      >
                        <ToggleStar />
                      </IconButton>
                    )}
                    primaryText={item.get('outputText')}
                    secondaryText={item.get('inputText')}
                  />
                ), <Divider inset={false} />])}
              </List>
              {phrasebookLoading === true ? (
                <LinearProgress mode="indeterminate" style={styles.progress} />
              ) : null}
            </div>
          );
        })()}
      </div>
    );
  }
}

Phrasebook.propTypes = {
  phrasebookItems: React.PropTypes.instanceOf(Immutable.List),
  canLoadMore: React.PropTypes.bool,
  phrasebookLoading: React.PropTypes.bool,
  onItemTouchTap: React.PropTypes.func,
  onEnterPhrasebook: React.PropTypes.func,
  onDeleteButtonTouchTap: React.PropTypes.func,
  onLoadMore: React.PropTypes.func,
};

Phrasebook.contextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapStateToProps = state => ({
  phrasebookItems: state.phrasebook.phrasebookItems,
  canLoadMore: state.phrasebook.canLoadMore,
  phrasebookLoading: state.phrasebook.phrasebookLoading,
});

const mapDispatchToProps = dispatch => ({
  onItemTouchTap: (output) => {
    dispatch(loadOutput(output));
    dispatch(replace('/'));
  },
  onDeleteButtonTouchTap: (id, rev) => {
    dispatch(deletePhrasebookItem(id, rev));
  },
  onEnterPhrasebook: () => {
    dispatch(loadPhrasebook(true));
  },
  onLoadMore: () => {
    dispatch(loadPhrasebook());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Phrasebook);
