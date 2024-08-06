/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useContext} from 'react';
import Svg, {Path} from 'react-native-svg';
import {LineChart, BarChart} from 'react-native-chart-kit';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';
import {Button} from '@ui-kitten/components';
import {API_URL, API_URL_2} from '../../env-vars';
import Smile from '../Smile';
import Frown from '../Frown';

import {UserContext} from '../../src/context';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const emotionColor = (opacity = 1) => `rgba(239,110,103,${opacity})`;

const usefulnessColor = (opacity = 1) => `rgba(28,164,91,${opacity})`;

const knowledgeColor = (opacity = 1) => `rgba(10,111,182,${opacity})`;

const smileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.36 14.23a3.76 3.76 0 0 1-4.72 0a1 1 0 0 0-1.28 1.54a5.68 5.68 0 0 0 7.28 0a1 1 0 1 0-1.28-1.54Zm-5.15-3.69a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 1 0 1.41 1.41a1 1 0 0 1 1.42 0Zm8.41-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 0 0 1.41 1.41a1 1 0 0 1 1.42 0a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Z"/></svg>`;

const frownSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.36 15.33a1 1 0 0 0-.13 1.4a1 1 0 0 0 1.41.13a3.76 3.76 0 0 1 4.72 0a1 1 0 0 0 .64.23a1 1 0 0 0 .64-1.76a5.81 5.81 0 0 0-7.28 0Zm.85-4.79a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 1 0 1.41 1.41a1 1 0 0 1 1.42 0ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Zm5.62-10.87a3.08 3.08 0 0 0-4.24 0a1 1 0 0 0 1.41 1.41a1 1 0 0 1 1.42 0a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41Z"/></svg>`;

function* yLabelEmotion() {
  yield* [1, 2, 3, 4];
}

const Dashboard = ({navigation}) => {
  const weeklyData1 = {};

  const yLabelEmotionIterator = yLabelEmotion();

  weeklyData1['emotion'] = Array(7).fill(0);
  weeklyData1['usefulness'] = Array(7).fill(0);
  weeklyData1['knowledge'] = Array(7).fill(0);
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useContext(UserContext);
  const [scores, setScores] = useState([]);
  const [emotionWidth, setEmotionWidth] = useState('1%');
  const [usefulnessWidth, setUsefulnessWidth] = useState('1%');
  const [knowledgeWidth, setKnowledgeWidth] = useState('1%');
  const [weeklyDataObj, setWeeklyDataObj] = useState(weeklyData1);

  const getUserScores = async () => {
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      method: 'GET',
    };
    // console.log(requestOptions);
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const queryParams = new URLSearchParams({
        UID: "AAAA",
        T: oneWeekAgo.valueOf()
    })
    const newResponse = await fetch(`${API_URL_2}?${queryParams.toString()}`, requestOptions)
    const newJsonData = await newResponse.json()
    const responseData = newJsonData['Items']

    var weeklyScores = [0, 0, 0]
    var scoresByDay = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(x => [x, []]))
    if (responseData) {
        const emotionScores = responseData.map((x) => x['Emotion']["L"]).flat().map((x) => parseFloat(x["S"]))
        const knowledgeScores = responseData.map((x) => x['Knowledge']["L"]).flat().map((x) => parseFloat(x["S"]))
        const actionScores = responseData.map((x) => x['Useful']["L"]).flat().map((x) => parseFloat(x["S"]))

        const cleanedEmotionScores = emotionScores.filter((x) => x >= -1)
        const cleanedKnowledgeScores = knowledgeScores.filter((x) => x >= -1)
        const cleanedActionScores = actionScores.filter((x) => x >= -1)

        const weeklyEmotion = cleanedEmotionScores.reduce((a, b) => a + b)/cleanedEmotionScores.length
        const weeklyKnowledge = cleanedKnowledgeScores.reduce((a, b) => a + b)/cleanedKnowledgeScores.length
        const weeklyAction = cleanedActionScores.reduce((a, b) => a + b)/cleanedActionScores.length

        weeklyScores = [weeklyEmotion, weeklyKnowledge, weeklyAction]

        const scoresByTime = Object.fromEntries(responseData.map(x => [parseInt(x['EventTime']['N']), x]))
        for (const [key, value] of Object.entries(scoresByTime)) {
            const timeDif = Date.now() - key
            const day = Math.floor(timeDif/86400000)
            scoresByDay[day].push(value)
        }
    }

    const response = await fetch(`${API_URL}/score`, requestOptions);
    const jsonData = await response.json();
    const arrayData = Object.values(jsonData);
    console.log('out', arrayData);
    if (arrayData !== undefined) {
      setScores(arrayData[0]);
    }
    const emotionWidthRaw = 100 * ((Number(weeklyScores[0]) + 1) / 2);
    const emotionWidthStr = '' + emotionWidthRaw + '%';
    setEmotionWidth(emotionWidthStr);

    const usefulnessWidthRaw = 100 * ((Number(weeklyScores[1]) + 1) / 2);
    const usefulnessWidthStr = '' + usefulnessWidthRaw + '%';
    setUsefulnessWidth(usefulnessWidthStr);

    const knowledgeWidthRaw = 100 * ((Number(weeklyScores[2]) + 1) / 2);
    const knowledgeWidthStr = '' + knowledgeWidthRaw + '%';
    console.log(knowledgeWidthStr);
    console.log('-----');

    setKnowledgeWidth(knowledgeWidthStr);

    //  const weekly_scores
    const curDate = Math.floor(Date.now() / 86400000);
    const rawData = arrayData[3];
    const weeklyData = {};

    //organizing data for bar charts
    weeklyData['emotion'] = Array(7).fill(0);
    weeklyData['usefulness'] = Array(7).fill(0);
    weeklyData['knowledge'] = Array(7).fill(0);
    // console.log(weeklyData['emotion']);
    var counts = Array(7).fill(0);
    for (const datapoint of rawData) {
      const datapointDate = Number(datapoint[3]);
      var differenceDate = curDate - datapointDate;
      if (differenceDate < 7) {
        //if data is within a week old
        const daysAgo = 6 - differenceDate;
        counts[daysAgo] += 1;
        const datapointEmotion = datapoint[0];
        const datapointUsefulness = datapoint[1];
        const datapointKnowledge = datapoint[2];

        weeklyData['emotion'][daysAgo] += Number(datapointEmotion);
        weeklyData['usefulness'][daysAgo] += Number(datapointUsefulness);
        weeklyData['knowledge'][daysAgo] += Number(datapointKnowledge);
      } else {
        differenceDate = 4;
        const daysAgo = 6 - differenceDate;
        counts[daysAgo] += 1;
        const datapointEmotion = datapoint[0];
        const datapointUsefulness = datapoint[1];
        const datapointKnowledge = datapoint[2];
        // console.log(datapointEmotion);

        weeklyData['emotion'][daysAgo] += Number(datapointEmotion);
        weeklyData['usefulness'][daysAgo] += Number(datapointUsefulness);
        weeklyData['knowledge'][daysAgo] += Number(datapointKnowledge);
      }
    }

    for (var i = 0; i < 7; i++) {
      const curCount = counts[i];
      if (curCount !== 0) {
        weeklyData['emotion'][i] = weeklyData['emotion'][i] / curCount;
        weeklyData['usefulness'][i] = weeklyData['usefulness'][i] / curCount;
        weeklyData['knowledge'][i] = weeklyData['knowledge'][i] / curCount;
      }
    }
    setWeeklyDataObj(weeklyData);
    // console.log(weeklyData);
  };

  useEffect(() => {
    console.log('GET scoresDashboard');
    getUserScores();
  }, []);

  var daysOfWeek = ['M', 'Tu', 'W', 'Th', 'F', 'Sat', 'Sun'];
  var currentDayIndex = new Date().getDay();
  var rotatedDaysOfWeek = daysOfWeek.splice(currentDayIndex).concat(daysOfWeek);

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#FFFFFF',
    backgroundGradientToOpacity: 0.5,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  // Check if the user is logged in.
  // If not, redirect to the login page.
  useEffect(() => {
    if (Object.keys(user).length !== 0) {
      if (user.expires * 1000 < Date.now()) {
        navigation.navigate('Login');
      }
    } else {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            marginHorizontal: 10,
            marginVertical: 20,
            backgroundColor: '#fff',
            // shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowRadius: 5.46,
            borderRadius: 10,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 20,
              marginLeft: 20,
              marginVertical: 20,
            }}>
            Weekly Average
          </Text>
          <View style={{display: 'flex', flexDirection: 'column'}}>
            {/* this is the view of all the horizontal bar charts*/}
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontWeight: 'bold'}}>Emotion </Text>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Frown />

                <View style={styles.progressBar}>
                  <View
                    style={
                      ([StyleSheet.absoluteFill, styles.emotion],
                      {
                        backgroundColor: '#ef6e67',
                        opacity: 1,
                        width: emotionWidth,
                      })
                    }
                  />
                </View>
                <Smile />
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontWeight: 'bold'}}>Actionability</Text>
              <View style={styles.progressBar}>
                <View
                  style={
                    ([StyleSheet.absoluteFill, styles.emotion],
                    {
                      backgroundColor: '#1ca45b',
                      opacity: 1,
                      width: usefulnessWidth,
                    })
                  }
                />
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontWeight: 'bold'}}>Knowledge</Text>
              <View style={styles.progressBar}>
                <View
                  style={
                    ([StyleSheet.absoluteFill, styles.emotion],
                    {
                      backgroundColor: '#0a6fb6',
                      opacity: 1,
                      width: knowledgeWidth,
                    })
                  }
                />
              </View>
            </View>
          </View>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 20,
              marginLeft: 20,
              marginVertical: 20,
            }}>
            Your Week
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 20,
              marginVertical: 10,
            }}>
            Emotion
          </Text>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 220,
              }}>
              <Smile />
              <Frown />
            </View>

            <BarChart
              data={{
                labels: rotatedDaysOfWeek,
                datasets: [
                  {
                    color: emotionColor,
                    data: weeklyDataObj['emotion'],
                  },
                  {
                    data: [0], // min:  fixes the y axis of the chart
                  },
                  {
                    data: [1], // max: fixes the y axis of the chart
                  },
                ],
              }}
              width={Dimensions.get('window').width - 40} // from react-native
              height={220}
              yAxisInterval={1} // optional, defaults to 1
              segments={3}
              useShadowColorFromDataset
              withShadow={false}
              withHorizontalLabels={false}
              showBarTops={false}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: emotionColor,
                labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                formatYLabel: () => yLabelEmotionIterator.next().value,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 20,
              marginVertical: 10,
            }}>
            Actionability
          </Text>
          <BarChart
            data={{
              labels: rotatedDaysOfWeek,
              datasets: [
                {
                  color: emotionColor,
                  data: weeklyDataObj['usefulness'],
                },
                {
                  data: [0], // min:  fixes the y axis of the chart
                },
                {
                  data: [1], // max: fixes the y axis of the chart
                },
              ],
            }}
            width={Dimensions.get('window').width - 40} // from react-native
            height={220}
            yAxisInterval={1} // optional, defaults to 1
            segments={3}
            useShadowColorFromDataset
            withShadow={false}
            withHorizontalLabels={false}
            showBarTops={false}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: usefulnessColor,
              labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              formatYLabel: () => yLabelEmotionIterator.next().value,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 20,
              marginVertical: 10,
            }}>
            Knowledge
          </Text>
          <BarChart
            data={{
              labels: rotatedDaysOfWeek,
              datasets: [
                {
                  color: knowledgeColor,
                  data: weeklyDataObj['knowledge'],
                },
                {
                  data: [0], // min:  fixes the y axis of the chart
                },
                {
                  data: [1], // max: fixes the y axis of the chart
                },
              ],
            }}
            width={Dimensions.get('window').width - 40} // from react-native
            height={220}
            yAxisInterval={1} // optional, defaults to 1
            segments={3}
            useShadowColorFromDataset
            withShadow={false}
            withHorizontalLabels={false}
            showBarTops={false}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: knowledgeColor,
              labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              formatYLabel: () => yLabelEmotionIterator.next().value,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  progressBar: {
    height: 20,
    flexDirection: 'row',
    width: '85%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default Dashboard;
