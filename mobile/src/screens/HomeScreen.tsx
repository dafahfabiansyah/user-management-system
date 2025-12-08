import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/axios';
import UserCard from '../components/UserCard';
import { User } from '../types';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchUsers(1, true);
  }, [search, roleFilter, sortOrder]);

  const fetchUsers = async (page: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await apiClient.get('/api/users', {
        params: {
          search,
          role: roleFilter,
          sortBy: 'createdAt',
          order: sortOrder,
          page,
          limit,
        },
      });

      const { data, meta } = response.data;

      if (reset) {
        setUsers(data);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }

      setTotalPages(meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      fetchUsers(currentPage + 1, false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.controls}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or email..."
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Text style={styles.filterButtonText}>
          {roleFilter ? `Filter: ${roleFilter}` : 'Filters'}
        </Text>
        <Text style={styles.filterIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.filterLabel}>Role Filter</Text>
            <View style={styles.filterOptions}>
              {['', 'admin', 'staff'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterOption,
                    roleFilter === role && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setRoleFilter(role);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      roleFilter === role && styles.filterOptionTextActive,
                    ]}
                  >
                    {role || 'All Roles'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Sort By Created At</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'desc', label: '↓ Newest First' },
                { value: 'asc', label: '↑ Oldest First' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    sortOrder === option.value && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSortOrder(option.value as 'asc' | 'desc');
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      sortOrder === option.value && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchAndFilter()}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <UserCard user={item} />}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterIcon: {
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalBody: {
    padding: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;
