import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Button, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [accessToken, setAccessToken] = useState();
  const [userInfo, setUserInfo] = useState();
  const [message, setMessage] = useState();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId: "",
    expoClientId: "",
    webClientId: "",
    // responseType: "code",
    // shouldAutoExchangeCode: true,
    // extraParams: {
    //   access_type: 'offline'
    // },
    scopes: [
      "https://www.googleapis.com/auth/fitness.activity.read"
      // List other scope here
    ],

  });

  useEffect(() => {
    setMessage(JSON.stringify(response));
    if (response?.type === "success") {
      setAccessToken(response.authentication.accessToken);
    }

    console.log("Authentication ", response)
  }, [response]);

  // Get user information
  async function getUserData() {
    let userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}`}
    });

    userInfoResponse.json().then(data => {
      setUserInfo(data);
    });

  }

  // Get Google fit datasource
  async function getFitDatasource() {
    let fitResponse = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", {
      headers: { Authorization: `Bearer ${accessToken}`}
    });

    fitResponse.json().then(data => {
      console.log(data);
    });
  }

  // Get Google fit session
  async function getFitSessions() {
    let fitResponse = await fetch("https://fitness.googleapis.com/fitness/v1/users/me/sessions", {
      headers: { Authorization: `Bearer ${accessToken}`}
    });

    fitResponse.json().then(data => {
      console.log(data);
    });
  }

  // Get Google fit Aggregate
  async function getFitAggregate() {
    const startTime = new Date(2022,5,27).getTime();
    const endTime = Date.now();

    // Data aggreagate parameter options
    const dataSource = {
      "aggregateBy": [{
        "dataSourceId": "derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments"
      }],
      "endTimeMillis": endTime,
      "startTimeMillis": startTime
    }

    let fitResponse = await fetch("https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(dataSource)
    });

    fitResponse.json().then(data => {
      console.log(data);
    });
  }

  function showUserInfo() {
    if (userInfo) {
      return (
        <View style={styles.userInfo}>
          <Image source={{uri: userInfo.picture}} style={styles.profilePic} />
          <Text>Welcome {userInfo.name}</Text>
          <Text>{userInfo.email}</Text>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {showUserInfo()}
      <Button 
        title={accessToken ? "Get User Data" : "Login"}
        onPress={accessToken ? getUserData : () => { 
          promptAsync({
            useProxy: Platform.OS === 'web' ? false : true , 
            showInRecents: true 
          }) 
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 50,
    height: 50
  }
});
