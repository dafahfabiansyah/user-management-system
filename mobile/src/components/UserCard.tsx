import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeStyle = (role: string) => {
    return role === 'admin' ? styles.adminBadge : styles.staffBadge;
  };

  const getRoleTextStyle = (role: string) => {
    return role === 'admin' ? styles.adminText : styles.staffText;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <View style={[styles.badge, getRoleBadgeStyle(user.role)]}>
          <Text style={[styles.badgeText, getRoleTextStyle(user.role)]}>
            {user.role}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.id}>ID: {user.id}</Text>
        <Text style={styles.date}>{formatDate(user.createdAt)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#f3e8ff',
  },
  staffBadge: {
    backgroundColor: '#d1fae5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  adminText: {
    color: '#7c3aed',
  },
  staffText: {
    color: '#059669',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: {
    fontSize: 12,
    color: '#9ca3af',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default UserCard;
