import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { LineChart } from 'react-native-chart-kit';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const theme = useTheme();

  // Mock data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [300, 350, 400, 380, 420, 450, 500],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Profile
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            {user?.username}
          </Text>
          <Text style={[styles.email, { color: theme.colors.onSurface }]}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Reading Progress
          </Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={350}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
          <Text style={[styles.stats, { color: theme.colors.onSurface }]}>
            Current WPM: {user?.wpmHistory[user.wpmHistory.length - 1] || 0}
          </Text>
          <Text style={[styles.stats, { color: theme.colors.onSurface }]}>
            Best WPM: {Math.max(...(user?.wpmHistory || [0]))}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Comprehension
          </Text>
          <Text style={[styles.stats, { color: theme.colors.onSurface }]}>
            Average Score: {user?.comprehensionScores.length
              ? (user.comprehensionScores.reduce((a, b) => a + b, 0) /
                  user.comprehensionScores.length).toFixed(1)
              : 0}%
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={signOut}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stats: {
    fontSize: 18,
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default ProfileScreen; 