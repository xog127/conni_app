import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ForumCard from '../components/forumCard'; // Import the previously created ForumCard
import { getCollections } from '../firebase/queries';

const ForumsPage = ({}) => {
  const [forums, setForums] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forum rules - You can modify these as needed
  const rules = [
    "Be respectful to all members",
    "No spam or self-promotion",
    "Keep discussions on topic",
    "No hate speech or harassment",
    "No sharing of personal information",
    "Follow the forum's specific guidelines"
  ];

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const forumsData = await getCollections({ collectionName: 'genres' });
        setForums(forumsData);
  
      } catch (error) {
        console.error('Error fetching forums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  const RulesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showRules}
      onRequestClose={() => setShowRules(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Forum Rules</Text>
            <TouchableOpacity onPress={() => setShowRules(false)}>
              <Feather name="x" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.rulesList}>
            {rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>{index + 1}.</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forums</Text>
        <TouchableOpacity 
          style={styles.rulesButton}
          onPress={() => setShowRules(true)}
        >
          <Feather name="info" size={20} color="#111827" />
          <Text style={styles.rulesButtonText}>Rules</Text>
        </TouchableOpacity>
      </View>

      {/* Forums List */}
      <ScrollView style={styles.forumsList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading forums...</Text>
          </View>
        ) : (
          forums.map(forum => (
            <ForumCard
              forumData={forum}
            />
          ))
        )}
      </ScrollView>

      {/* Rules Modal */}
      <RulesModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rulesButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  forumsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  rulesList: {
    maxHeight: '90%',
  },
  ruleItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ruleNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  ruleText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
});

export default ForumsPage;