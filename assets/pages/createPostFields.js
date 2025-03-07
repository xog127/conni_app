import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { Feather } from '@expo/vector-icons';

const CreatePostFields = ({ selectedForum, onChange, onValidationChange }) => {
  const [formData, setFormData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [touched, setTouched] = useState({});
  const [allFieldsTouched, setAllFieldsTouched] = useState(false);

  const forumFields = {
    Research: [
      { name: "Duration", type: "dropdown", options: ["15 min", "30 min", "45 min", "60 min"] },
      { name: "Incentive", type: "text", placeholder: "Enter incentive" },
      { name: "Eligibilities", type: "choiceChips", options: ["Students", "Researchers", "Everyone"] },
    ],
    Project: [
      { name: "Duration", type: "dropdown", options: ["3 weeks", "6 weeks", "9 weeks"] },
      { name: "Incentive", type: "text", placeholder: "Enter incentive" },
      { name: "Type", type: "dropdown", options: ["Online", "In Person", "Hybrid"] },
      { name: "Skills", type: "choiceChips", options: ["Programming", "Marketing", "Design"] },
    ],
    Flats: [
      { name: "Location", type: "text", placeholder: "Enter postcode" },
      { name: "Move-in Date", type: "date", placeholder: "Select date" },
      { name: "Price", type: "text", placeholder: "Enter price per week" },
      { name: "Rooms", type: "dropdown", options: ["1", "2", "3", "4", "5", "6", "7", "8+"] },
    ],
  };

  // Function to check if a field has an error
  const hasError = (field, type) => {
    if (!touched[field]) return false;
    if (type === "choiceChips") {
      return !formData[field] || formData[field].length === 0;
    }
    return !formData[field];
  };

  // Function to validate all fields
  const validateAllFields = () => {
    if (!selectedForum || !forumFields[selectedForum]) return false;

    // Mark all fields as touched to show all errors
    if (!allFieldsTouched) {
      const touchedState = {};
      forumFields[selectedForum].forEach(field => {
        touchedState[field.name] = true;
      });
      setTouched(touchedState);
      setAllFieldsTouched(true);
    }

    // Check if any field has an error
    return !forumFields[selectedForum].some(field => 
      hasError(field.name, field.type)
    );
  };

  // Effect to update parent component about validation status whenever form data changes
  useEffect(() => {
    if (selectedForum && forumFields[selectedForum]) {
      const isValid = forumFields[selectedForum].every(field => {
        if (field.type === "choiceChips") {
          return formData[field.name] && formData[field.name].length > 0;
        }
        return formData[field.name] !== undefined && formData[field.name] !== "";
      });
      
      onValidationChange && onValidationChange(isValid);
    }
  }, [formData, selectedForum]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onChange(updatedData);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChipSelect = (field, value) => {
    const selectedValues = formData[field] || [];
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    handleInputChange(field, updatedValues);
  };

  const toggleDropdown = (field) => {
    setDropdownOpen(prev => ({ ...prev, [field]: !prev[field] }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  if (!selectedForum || !forumFields[selectedForum]) return null;

  const renderField = (field) => {
    const errorStyle = hasError(field.name, field.type) ? styles.errorInput : null;
    
    switch (field.type) {
      case "text":
        return (
          <>
            <TextInput
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChangeText={(text) => handleInputChange(field.name, text)}
              style={[styles.textInput, errorStyle]}
              onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
            />
            {hasError(field.name, field.type) && (
              <Text style={styles.errorText}>This field is required</Text>
            )}
          </>
        );
        
      case "dropdown":
        return (
          <View>
            <Pressable
              onPress={() => toggleDropdown(field.name)}
              style={[styles.dropdownButton, errorStyle]}
            >
              <Text style={styles.dropdownButtonText}>
                {formData[field.name] || field.placeholder || "Select an option"}
              </Text>
              <Feather name={dropdownOpen[field.name] ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </Pressable>
            
            {hasError(field.name, field.type) && (
              <Text style={styles.errorText}>This field is required</Text>
            )}

            <AnimatePresence>
              {dropdownOpen[field.name] && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={styles.dropdownList}
                >
                  <View>
                    {field.options.map((option, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          handleInputChange(field.name, option);
                          toggleDropdown(field.name);
                        }}
                        style={[
                          styles.dropdownItem,
                          formData[field.name] === option && styles.dropdownItemSelected
                        ]}
                      >
                        <Text style={formData[field.name] === option ? styles.dropdownItemTextSelected : styles.dropdownItemText}>
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </MotiView>
              )}
            </AnimatePresence>
          </View>
        );
        
      case "choiceChips":
        return (
          <View>
            <View 
              style={[
                styles.chipsContainer,
                hasError(field.name, field.type) && styles.errorChipsContainer
              ]}
            >
              {field.options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleChipSelect(field.name, option)}
                  style={[
                    styles.chip,
                    formData[field.name]?.includes(option) && styles.chipSelected
                  ]}
                >
                  <Text style={formData[field.name]?.includes(option) ? styles.chipTextSelected : styles.chipText}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
            {hasError(field.name, field.type) && (
              <Text style={styles.errorText}>Select at least one option</Text>
            )}
          </View>
        );
        
      case "date":
        return (
          <View>
            <Pressable
              onPress={() => handleInputChange(field.name, new Date())}
              style={[styles.dateButton, errorStyle]}
            >
              <Text style={styles.dateButtonText}>
                {formData[field.name] ? formData[field.name].toDateString() : field.placeholder}
              </Text>
              <Feather name="calendar" size={16} color="#666" />
            </Pressable>
            {hasError(field.name, field.type) && (
              <Text style={styles.errorText}>This field is required</Text>
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.fieldsContainer}>
      <Text style={styles.sectionTitle}>Forum Details</Text>
      {forumFields[selectedForum].map((field) => (
        <View key={field.name} style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{field.name} *</Text>
          <View style={styles.fieldInputContainer}>
            {renderField(field)}
          </View>
        </View>
      ))}
      
      {/* Validate All Button - Optional, can be used for debugging or to force validation */}
      {/* <Pressable 
        style={styles.validateButton} 
        onPress={() => {
          const isValid = validateAllFields();
          onValidationChange && onValidationChange(isValid);
        }}
      >
        <Text style={styles.validateButtonText}>Validate All Fields</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#836fff",
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#57636c",
    fontWeight: "500",
    marginBottom: 8,
  },
  fieldInputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#666",
  },
  dropdownList: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f0ff",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownItemTextSelected: {
    fontSize: 14,
    color: "#836fff",
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#E0E3E7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#836fff",
  },
  chipText: {
    fontSize: 14,
    color: "#57636c",
  },
  chipTextSelected: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#666",
  },
  errorInput: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
    backgroundColor: '#fff1f0',
  },
  errorChipsContainer: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
    borderRadius: 8,
    padding: 8,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  validateButton: {
    backgroundColor: "#836fff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  validateButtonText: {
    color: "#fff",
    fontWeight: "500",
  }
});

export default CreatePostFields;