import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../services/authContext';

const ReportModal = ({ isVisible, onClose, postId }) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const reportReasons = [
    "The post is not respectful",
    "Hate speech, doxing or personal attacks",
    "Violent, obscene or illegal content",
    "Spam or disinformation"
  ];

  const handleReport = async () => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        reports: arrayUnion({
          userId: user.uid,
          reason: selectedReason,
          details: additionalDetails,
          timestamp: new Date().toISOString()
        })
      });
      setSelectedReason(null);
      setAdditionalDetails('');
      onClose();
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable style={styles.modalContent}>
          {!selectedReason ? (
            // Initial Report Options View
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Report</Text>
                <Text style={styles.subtitle}>
                  Your report is anonymous. If someone is in immediate danger, call the local emergency services - don't wait.
                </Text>
              </View>

              <View style={styles.reasonsContainer}>
                <Text style={styles.reasonsTitle}>Why are you reporting this post?</Text>
                {reportReasons.map((reason, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reasonButton}
                    onPress={() => handleReasonSelect(reason)}
                  >
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Additional Details View
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Additional Details</Text>
                <Text style={styles.subtitle}>
                  Please provide any additional information about your report
                </Text>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.selectedReason}>Reason: {selectedReason}</Text>
                <TextInput
                  style={styles.detailsInput}
                  placeholder="Add more details about your report..."
                  multiline
                  value={additionalDetails}
                  onChangeText={setAdditionalDetails}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelActionButton]}
                  onPress={() => setSelectedReason(null)}
                >
                  <Text style={styles.cancelText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.submitActionButton]}
                  onPress={handleReport}
                >
                  <Text style={styles.submitText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reasonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  reasonButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reasonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#836fff',
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  selectedReason: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  detailsInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'horizontal',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelActionButton: {
    backgroundColor: '#f5f5f5',
  },
  submitActionButton: {
    backgroundColor: '#836fff',
  },
  submitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReportModal; 