import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();

  return <Text>Showing details for ID: {id}</Text>;
}