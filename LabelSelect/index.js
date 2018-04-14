/**
 * Created by TinySymphony on 2017-01-03.
 */

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight,
  Dimensions
} from 'react-native';
import Styles, {IMG} from './LabelSelectStyle';
import Modal from '../../react-native-sliding-modal';
const {height} = Dimensions.get('window');
class LabelSelect extends PureComponent {
  addIcon = {
    uri: IMG.addIcon
  };
  static propTypes = {
    title: PropTypes.string,
    readOnly: PropTypes.bool,
    enable: PropTypes.bool,
    onConfirm: PropTypes.func,
    enableAddBtn: PropTypes.bool,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string
  };
  static defaultProps = {
    style: {},
    customStyle: {},
    title: ' ',
    enable: true,
    readOnly: false,
    onConfirm: () => {},
    enableAddBtn: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  };
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      isModalVisible: false
    };
    this.selectedList = [];
    this.toggleSelect = this.toggleSelect.bind(this);
    this.cancelSelect = this.cancelSelect.bind(this);
    this.confirmSelect = this.confirmSelect.bind(this);
    this.openModal = this.openModal.bind(this);
  }
  setModalVisible(isVisible) {
    this.setState({isModalVisible: isVisible});
  }
  cancelSelect() {
    this.selectedList = [];
    this.setModalVisible(false);
  }
  confirmSelect() {
    const {onConfirm} = this.props;
    onConfirm(this.selectedList);
    this.selectedList = [];
    this.cancelSelect();
  }
  openModal() {
    if (
      !React.Children.toArray(this.props.children).filter(
        item => item.type === ModalItem
      ).length
    ) {
      // TODO
    }
    this.props.enable && !this.props.readOnly && this.setModalVisible(true);
  }
  toggleSelect(time) {
    let index = this.selectedList.findIndex(item => item === time);
    if (~index) {
      this.selectedList.splice(index, 1);
    } else {
      this.selectedList.push(time);
    }
  }
  render() {
    const {
      readOnly,
      enable,
      title,
      style,
      enableAddBtn,
      customStyle,
      addButtonText
    } = this.props;

    let childrenArr = React.Children.toArray(this.props.children);
    let selectedLabels = childrenArr
      .filter(item => item.type === Label)
      .map((child, index) => {
        return React.cloneElement(child, {
          enable: enable,
          readOnly: readOnly
        });
      });

    let modalItems = this.state.isModalVisible
      ? childrenArr
        .filter(item => item.type === ModalItem)
        .map((child, index) => {
          return React.cloneElement(child, {
            toggleSelect: this.toggleSelect
          });
        })
      : null;

    let modalActions = this.state.isModalVisible
      ? childrenArr.filter(item => item.type === ModalActions)
      : null;

    return (
      <View style={[Styles.selectedView, style]}>
        {selectedLabels}
        <TouchableHighlight
          underlayColor="transparent"
          onPress={this.openModal}
        >
          <View style={Styles.selectedItem}>
            {addButtonText && (
              <Text
                style={[
                  Styles.labelText,
                  !enable && Styles.disableText,
                  customStyle.addButtonText || {}
                ]}
                numberOfLines={1}
                ellipsisMode="tail"
              >
                {addButtonText}
              </Text>
            )}
            {enable &&
              !readOnly &&
              enableAddBtn && (
              <View
                style={[
                  Styles.closeContainer,
                  Styles.addItem,
                  customStyle.addButton || {}
                ]}
              >
                <Image
                  style={Styles.addIcon}
                  source={this.addIcon}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </TouchableHighlight>
        )}
        <Modal
          show={this.state.isModalVisible}
          closeCallback={this.confirmSelect}
          top={height - 450}
          ref={modal => {
            this.modalRef = modal;
          }}
          defaultHeader
        >
          <View style={Styles.modalContainer}>
            <View style={Styles.title}>
              <Text style={Styles.titleText}>{title}</Text>
            </View>
            <View style={Styles.scrollView}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalItems}
              </ScrollView>
            </View>
            {(!modalActions || modalActions.length <= 0) &&
              ModalActions(
                {children: modalActions, props: this.props},
                this.cancelSelect,
                this.confirmSelect
              )}
            {modalActions}
          </View>
        </Modal>
      </View>
    );
  }
}

class Label extends PureComponent {
  closeIcon = {
    uri: IMG.closeIcon
  };
  static propTypes = {
    onCancel: PropTypes.func,
    readOnly: PropTypes.bool,
    enable: PropTypes.bool
  };
  static defaultProps = {
    onCancel: () => {},
    enable: true,
    readOnly: false,
    customStyle: {}
  };
  constructor(props) {
    super(props);
  }
  render() {
    const {enable, readOnly, onCancel, customStyle} = this.props;
    return (
      <View style={[Styles.selectedItem, !enable && Styles.disableColor]}>
        <Text
          style={[
            Styles.labelText,
            !enable && Styles.disableText,
            customStyle.text || {}
          ]}
          numberOfLines={1}
          ellipsisMode="tail"
        >
          {this.props.children}
        </Text>
        {enable &&
          !readOnly && (
          <TouchableHighlight
            style={Styles.closeContainer}
            underlayColor="transparent"
            activeOpacity={0.5}
            onPress={onCancel}
          >
            <View>
              <Image
                style={Styles.closeIcon}
                source={this.closeIcon}
                resizeMode="cover"
              />
            </View>
          </TouchableHighlight>
        )}
      </View>
    );
  }
}

class ModalItem extends PureComponent {
  static propTypes = {
    toggleSelect: PropTypes.func
  };
  static defaultProps = {
    customStyle: {}
  };
  constructor(props) {
    super(props);
    this.isSelected = false;
    this._toggleSelect = this._toggleSelect.bind(this);
  }
  _toggleSelect() {
    const {toggleSelect, data} = this.props;
    this.isSelected = !this.isSelected;
    this.forceUpdate();
    toggleSelect(data);
  }
  render() {
    const {customStyle} = this.props;
    return (
      <TouchableHighlight
        activeOpacity={0.5}
        underlayColor="transparent"
        onPress={this._toggleSelect}
      >
        <View style={Styles.modalItem}>
          <Text
            style={[Styles.modalText, customStyle.modalText || {}]}
            numberOfLines={1}
            ellipsisMode="tail"
          >
            {this.props.children}
          </Text>
          <View
            style={[
              Styles.outerCircle,
              this.isSelected ? Styles.enableCircle : {},
              customStyle.outerCircle || {}
            ]}
          >
            {this.isSelected && (
              <View
                style={[Styles.innerCircle, customStyle.innerCircle || {}]}
              />
            )}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const ModalActions = ({children, props}, cancelSelect, confirmSelect) => {
  return (
    <View {...props}>
      {(!children || children.length <= 0) && (
        <View style={[Styles.buttonView, props.customStyle.buttonView || {}]}>
          <TouchableHighlight
            underlayColor="transparent"
            activeOpacity={0.8}
            onPress={cancelSelect}
          >
            <View
              style={[Styles.modalButton, props.customStyle.cancelButton || {}]}
            >
              <Text
                style={[Styles.buttonText, props.customStyle.cancelText || {}]}
              >
                {props.cancelText}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="transparent"
            activeOpacity={0.8}
            onPress={confirmSelect}
          >
            <View
              style={[
                Styles.modalButton,
                Styles.confirmButton,
                props.customStyle.confirmButton || {}
              ]}
            >
              <Text
                style={[Styles.buttonText, props.customStyle.confirmText || {}]}
              >
                {props.confirmText}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      )}
      {children}
    </View>
  );
};

LabelSelect.Label = Label;
LabelSelect.ModalItem = ModalItem;
LabelSelect.ModalActions = ModalActions;
export default LabelSelect;
