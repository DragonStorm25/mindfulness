import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from 'react-native';
import {Layout} from '@ui-kitten/components';

const Page = ({children}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Layout style={styles.sectionContainer}>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {children}
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
    height: Dimensions.get('window').height,
  },
});

export default Page;
