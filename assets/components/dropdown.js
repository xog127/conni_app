import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomDropdown = ({
    data = [],
    value = null,
    onSelect = () => {},
    placeholder = 'Select an option',
    containerStyle = {},
    labelStyle = {},
    dropdownStyle = {},
    selectedItemStyle = {},
    optionStyle = {},
    optionTextStyle = {},
    errorText = '',
    disabled = false,
    required = false,
    label = ''
}) => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const modalHeight = SCREEN_HEIGHT * 0.4;

  const toggleDropdown = () => {
    if (disabled) return;
    
    const toValue = visible ? 0 : 1;
    setVisible(!visible);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onItemPress = (item) => {
    setSelectedItem(item);
    onSelect(item);
    toggleDropdown();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.option, optionStyle]}
      onPress={() => onItemPress(item)}
    >
      <Text style={[styles.optionText, optionTextStyle]}>
        {item.label}
      </Text>
      {selectedItem?.value === item.value && (
        <Feather name="check" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderDropdown = () => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [modalHeight, 0],
    });

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleDropdown}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.dropdown,
              dropdownStyle,
              {
                transform: [{ translateY }],
                maxHeight: modalHeight,
              },
            ]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Select Option</Text>
              <TouchableOpacity onPress={toggleDropdown}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.disabled,
          errorText ? styles.error : null,
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectorText,
            selectedItem && styles.selectedText,
            selectedItemStyle,
          ]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Feather
          name={visible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? '#999' : '#444'}
        />
      </TouchableOpacity>

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}

      {renderDropdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#FF3B30',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 48,
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  error: {
    borderColor: '#FF3B30',
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  selectedText: {
    color: '#000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
});

export default CustomDropdown;