import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import {
  Box,
  Text,
  Input,
  TextArea,
  VStack,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Image,
  IconButton,
  Divider,
  Button,
  useTheme,
  Modal,
  Switch,
} from 'native-base';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../services/authContext';
import { getCollections } from '../firebase/queries';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AnimatePresence, MotiView } from "moti";
import DateTimePicker from '@react-native-community/datetimepicker';

const PostTypeButton = ({ isSelected, icon, label, onPress }) => (
  <Pressable 
    flex={1} 
    onPress={onPress}
    py={3}
  >
    <VStack 
      alignItems="center" 
      space={1}
      opacity={isSelected ? 1 : 0.5}
    >
      <Icon 
        as={MaterialCommunityIcons} 
        name={icon} 
        size={6} 
        color={isSelected ? "#836FFF" : "gray.500"} 
      />
      <Text 
        fontSize="xs" 
        color={isSelected ? "#836FFF" : "gray.500"}
        fontWeight={isSelected ? "bold" : "normal"}
      >
        {label}
      </Text>
    </VStack>
  </Pressable>
);

const forumFields = {
  Research: [
    { name: "Duration", type: "text", placeholder: "How long does the study take?"},
    { name: "Incentive", type: "choiceChips", options: ["Money", "SONA credit", "Voucher", "Other"] },
    { name: "Incentive value", type: "text", placeholder: "How much are you giving for the incentive?"},
    { name: "Eligibilities", type: "text", placeholder: "Describe participants eligibility" },
  ],
  Ticket: [
    { name: "Buy or Sell", type: "dropdown", options: ["Buy", "Sell"]},
    { name: "Date", type: "date", placeholder: "Date of the event" },
    { name: "Price", type: "text", placeholder: "How much is it?"},
    { name: "Quantity", type: "text", placeholder: "Enter quantity"},
  ],
  Market: [
    { name: "Buy or Sell", type: "dropdown", options: ["Buy", "Sell"] },
    { name: "Item", type: "text", placeholder: "What are you selling?" },
    { name: "Price", type: "text", placeholder: "How much is it?"},
  ],
  Project: [
    { name: "Incentive", type: "dropdown", options: ["Equity", "Stipend", "Salary", "Other"] },
    { name: "Skills", type: "choiceChips", options: ["Programming", "Marketing", "Design", "UIUX", "Engineering", "Business", "Legal", "Research", "Others"]},
  ],
  Flat: [
    {
      name: "rentType",
      label: "I want to",
      type: "dropdown",
      options: ["Find a flat", "Rent out my flat"],
      required: true,
    },
    {
      name: "moveInDate",
      label: "Move-in Date",
      type: "date",
      required: true,
    },
    {
      name: "moveOutDate",
      label: "Move-out Date",
      type: "date",
      required: true,
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter location (e.g., Mile End, Whitechapel)",
      required: true,
    },
    {
      name: "price",
      label: "Price per week (£)",
      type: "number",
      placeholder: "Enter price per week in pounds",
      required: true,
    },
  ],
};

const ChoiceChips = ({ options, value = [], onChange }) => {
  return (
    <HStack flexWrap="wrap" space={2} mt={2}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => {
            const newValue = value.includes(option)
              ? value.filter(v => v !== option)
              : [...value, option];
            onChange(newValue);
          }}
        >
          <Box
            px={3}
            py={1}
            borderRadius="full"
            bg={value.includes(option) ? "#836FFF" : "gray.100"}
          >
            <Text
              color={value.includes(option) ? "white" : "gray.800"}
              fontSize="sm"
            >
              {option}
            </Text>
          </Box>
        </Pressable>
      ))}
    </HStack>
  );
};

const RedditStyleCreatePost = ({ navigation }) => {
  const [postType, setPostType] = useState('text'); // text, image, link, poll
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedForum, setSelectedForum] = useState(null);
  const [forums, setForums] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [showForumModal, setShowForumModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Load forums
  useEffect(() => {
    const fetchForums = async () => {
      try {
        const forumsData = await getCollections({ collectionName: 'genres' });
        setForums(forumsData);
      } catch (err) {
        console.error('Error fetching forums:', err);
      }
    };
    fetchForums();
  }, []);

  // Hide bottom tab bar
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
      return () => parent.setOptions({
        tabBarStyle: undefined
      });
    }
  }, [navigation]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setIsLoading(true);
        const imageUrl = await uploadImageToFirebase(result.assets[0].uri);
        setImages(prev => [...prev, imageUrl]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to process image.');
      setIsLoading(false);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      const storage = getStorage();
      const filename = `post_images/${Date.now()}`;
      const storageRef = ref(storage, filename);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Implementation will be added later
    console.log('Submit post:', { postType, title, content, selectedForum, images });
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderForumFields = () => {
    if (!selectedForum || !forumFields[selectedForum?.name]) return null;

    return (
      <VStack space={4} mt={4}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
          {selectedForum.name} Details
        </Text>
        {forumFields[selectedForum.name].map((field, index) => {
          switch (field.type) {
            case "text":
            case "number":
              return (
                <Box key={field.name}>
                  {field.label && (
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {field.label}
                    </Text>
                  )}
                  <Input
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChangeText={(value) => handleFieldChange(field.name, value)}
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                  />
                </Box>
              );

            case "dropdown":
              return (
                <Box key={field.name}>
                  {field.label && (
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {field.label}
                    </Text>
                  )}
                  <Pressable
                    onPress={() => {
                      // Implement dropdown selector
                    }}
                  >
                    <Box
                      borderWidth={1}
                      borderColor="gray.200"
                      borderRadius="md"
                      p={3}
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text color={formData[field.name] ? "gray.800" : "gray.400"}>
                          {formData[field.name] || field.placeholder || "Select an option"}
                        </Text>
                        <Icon as={Ionicons} name="chevron-down" size={5} color="gray.400" />
                      </HStack>
                    </Box>
                  </Pressable>
                </Box>
              );

            case "choiceChips":
              return (
                <Box key={field.name}>
                  {field.label && (
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {field.label}
                    </Text>
                  )}
                  <ChoiceChips
                    options={field.options}
                    value={formData[field.name] || []}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                </Box>
              );

            case "date":
              return (
                <Box key={field.name}>
                  {field.label && (
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {field.label}
                    </Text>
                  )}
                  <Pressable
                    onPress={() => {
                      setDateField(field.name);
                      setShowDatePicker(true);
                    }}
                  >
                    <Box
                      borderWidth={1}
                      borderColor="gray.200"
                      borderRadius="md"
                      p={3}
                    >
                      <Text color={formData[field.name] ? "gray.800" : "gray.400"}>
                        {formData[field.name] 
                          ? new Date(formData[field.name]).toLocaleDateString()
                          : field.placeholder || "Select date"}
                      </Text>
                    </Box>
                  </Pressable>
                </Box>
              );

            default:
              return null;
          }
        })}
      </VStack>
    );
  };

  return (
    <Box flex={1} bg="white" safeArea>
      {/* Header */}
      <HStack 
        px={4} 
        py={3} 
        alignItems="center" 
        borderBottomWidth={1}
        borderBottomColor="gray.200"
      >
        <IconButton
          icon={<Icon as={Ionicons} name="close" size={6} color="gray.500" />}
          onPress={() => navigation.goBack()}
        />
        <Text flex={1} fontSize="lg" fontWeight="semibold" textAlign="center">
          Create Post
        </Text>
        <Button
          size="sm"
          colorScheme="primary"
          isDisabled={!title || !selectedForum}
          onPress={handleSubmit}
          bg="#836FFF"
        >
          Post
        </Button>
      </HStack>

      {/* Forum Selector */}
      <Pressable
        onPress={() => setShowForumModal(true)}
        px={4}
        py={3}
        bg="gray.50"
      >
        <HStack alignItems="center" space={2}>
          <Icon as={Feather} name="hash" size={5} color="gray.500" />
          <Text flex={1} color={selectedForum ? "gray.800" : "gray.500"}>
            {selectedForum?.name || "Choose a forum"}
          </Text>
          <Icon as={Ionicons} name="chevron-down" size={5} color="gray.500" />
        </HStack>
      </Pressable>

      {/* Anonymous Toggle */}
      <HStack 
        px={4} 
        py={2} 
        alignItems="center" 
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="gray.200"
      >
        <HStack alignItems="center" space={2}>
          <Icon as={Ionicons} name="eye-off" size={5} color="gray.500" />
          <Text>Post as Anonymous</Text>
        </HStack>
        <Switch
          size="sm"
          value={isAnonymous}
          onToggle={() => setIsAnonymous(!isAnonymous)}
          colorScheme="purple"
        />
      </HStack>

      {/* Forum Selection Modal */}
      <Modal isOpen={showForumModal} onClose={() => setShowForumModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Choose a Forum</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              {forums.map((forum) => (
                <Pressable
                  key={forum.id}
                  onPress={() => {
                    setSelectedForum(forum);
                    setShowForumModal(false);
                  }}
                >
                  <HStack
                    p={3}
                    borderRadius="md"
                    bg={selectedForum?.id === forum.id ? "gray.100" : "transparent"}
                    alignItems="center"
                    space={2}
                  >
                    <Icon as={Feather} name="hash" size={5} color="gray.500" />
                    <Text fontSize="md">{forum.name}</Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      <ScrollView flex={1} p={4}>
        {/* Title Input */}
        <Input
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          fontSize="lg"
          borderWidth={0}
          p={0}
          mb={4}
          _focus={{
            bg: 'transparent',
          }}
        />

        <Divider mb={4} />

        {/* Content based on post type */}
        {postType === 'text' && (
          <>
            <TextArea
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              fontSize="md"
              borderWidth={0}
              p={0}
              autoCompleteType={undefined}
              _focus={{
                bg: 'transparent',
              }}
            />
            {selectedForum && renderForumFields()}
          </>
        )}

        {postType === 'image' && (
          <VStack space={4}>
            {images.map((uri, index) => (
              <Box key={index} position="relative">
                <Image
                  source={{ uri }}
                  alt="Post image"
                  width="100%"
                  height={200}
                  borderRadius="md"
                />
                <IconButton
                  position="absolute"
                  top={2}
                  right={2}
                  icon={<Icon as={Ionicons} name="close-circle" size={6} color="white" />}
                  onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                />
              </Box>
            ))}
            <Button
              leftIcon={<Icon as={Ionicons} name="image" size={5} />}
              onPress={pickImage}
              variant="outline"
            >
              Add Image
            </Button>
          </VStack>
        )}

        {postType === 'link' && (
          <Input
            placeholder="Enter URL"
            value={content}
            onChangeText={setContent}
            fontSize="md"
            autoCapitalize="none"
            keyboardType="url"
          />
        )}

        {postType === 'poll' && (
          <Text>Poll creation will be implemented later</Text>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={formData[dateField] || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                handleFieldChange(dateField, date);
              }
            }}
          />
        )}
      </ScrollView>

      {/* Bottom Post Type Selector */}
      <HStack 
        borderTopWidth={1}
        borderTopColor="gray.200"
        bg="white"
        p={2}
        space={2}
      >
        <PostTypeButton
          isSelected={postType === 'text'}
          icon="text"
          label="Post"
          onPress={() => setPostType('text')}
        />
        <PostTypeButton
          isSelected={postType === 'image'}
          icon="image"
          label="Images"
          onPress={() => setPostType('image')}
        />
        <PostTypeButton
          isSelected={postType === 'link'}
          icon="link"
          label="Link"
          onPress={() => setPostType('link')}
        />
        <PostTypeButton
          isSelected={postType === 'poll'}
          icon="poll"
          label="Poll"
          onPress={() => setPostType('poll')}
        />
      </HStack>
    </Box>
  );
};

export default RedditStyleCreatePost; 