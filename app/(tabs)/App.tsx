import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import useBLE from '@/useBLE'; // Adjust the import path as per your project structure
import DeviceModal from '@/DeviceConnectionModal'; // Adjust the import path as per your project structure
import Timer from '@/Timer'; // Adjust the import path as per your project structure
import TimePointsView from '@/timePointsView'; // Adjust the import path as per your project structure

const App: React.FC = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    writeValueToDevice,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rawDataToSend, setRawDataToSend] = useState('');
  const [timePoints, setTimePoints] = useState<number[] | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const timerRef = useRef<Timer | null>(null);
  const [listToggle, setListToggle] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTimePointsView, setShowTimePointsView] = useState(false);

  const handleWrite = () => {
    const dataToSend = new Uint8Array(rawDataToSend.split(',').map(Number));
    writeValueToDevice(dataToSend);
  };

  const startTimer = () => {
    const parsedMinutes = parseInt(minutes, 10);
    const parsedSeconds = parseInt(seconds, 10);

    if (!isNaN(parsedMinutes) && !isNaN(parsedSeconds)) {
      const durationInSeconds = parsedMinutes * 60 + parsedSeconds;

      if (timerRef.current) {
        timerRef.current.componentWillUnmount();
      }

      timerRef.current = new Timer({
        minutes: parsedMinutes,
        seconds: parsedSeconds,
        onFinish: handleTimerFinish,
      });

      timerRef.current.componentDidMount();

      setTimerKey(prevKey => prevKey + 1);
    }
  };

  const handleTimerFinish = () => {
    console.log('Timer finished!');
    const dataToSend = new Uint8Array(0);
    writeValueToDevice(dataToSend);
    // Handle timer finish event
  };

  const toggleTimerPause = () => {
    if (timerRef.current) {
      if (isPaused) {
        timerRef.current.resumeTimer();
        console.log('Timer resumed');
      } else {
        timerRef.current.pauseTimer();
        console.log('Timer paused');
      }
      setIsPaused(prev => !prev);
    }
  };

  const handleOnTimePoint = (id: string) => {
    console.log('TimePoint Reached, ID sent: ' + id);
    const dataToSend = new Uint8Array(id.split(',').map(Number));
    writeValueToDevice(dataToSend);
  };

  const handleMinutesChange = (text: string) => {
    setMinutes(text);
  };

  const handleSecondsChange = (text: string) => {
    setSeconds(text);
  };

  const toggleTimePointsView = () => {
    setShowTimePointsView(prev => !prev);
  };

  const toggleList = () => {
    setListToggle(prev => !prev);
  };

  const handleAddTimePoints = (timePointsData: number[], scentID: string) => {
    setTimePoints(prevTimePoints =>
      prevTimePoints ? [...prevTimePoints, ...timePointsData] : [...timePointsData]
    );
    setIds(prevIds => [...prevIds, scentID, scentID]);
  };

  const handleResetTimePoints = () => {
    setTimePoints([])
  }

  const openModal = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
      setIsModalVisible(true);
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleConnectDisconnect = () => {
    if (connectedDevice) {
      disconnectFromDevice();
    } else {
      openModal();
    }
  };

  return (
    <View style={styles.container}>
      {connectedDevice ? (
        <>
          <View>
            <TouchableOpacity onPress={handleConnectDisconnect} style={styles.ctaButton}>
             <Text style={styles.ctaButtonText}>{connectedDevice ? 'Disconnect' : 'Connect'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text>Total time</Text>
            <TextInput
              style={styles.input}
              placeholder="Minutes"
              keyboardType="numeric"
              value={minutes}
              onChangeText={handleMinutesChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Seconds"
              keyboardType="numeric"
              value={seconds}
              onChangeText={handleSecondsChange}
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={toggleTimePointsView}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.buttonContainer} onPress={toggleList}>
              <Text style={styles.buttonText}>{listToggle ? '^' : 'v'}</Text>
            </TouchableOpacity>
            <Text> </Text>
            <TouchableOpacity style={styles.buttonContainer} onPress={handleResetTimePoints}>
              <Text style={styles.buttonText}>Reset points</Text>
            </TouchableOpacity>
          </View>
          {listToggle && timePoints && timePoints.length > 0 && (
            <FlatList
              style={styles.timePointsList}
              data={timePoints.map((item, index) => ({ id: ids[index], timePoint: item }))}
              renderItem={({ item }) => (
                <View style={styles.timePointItem}>
                  <Text>ID: {item.id}, Time Point: {item.timePoint}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
          <View style={styles.row}>
            <TouchableOpacity style={styles.buttonContainer} onPress={toggleTimerPause}>
              <Text style={styles.buttonText}>{isPaused ? '>' : '||'}</Text>
            </TouchableOpacity>
            <Text> </Text>
            <TouchableOpacity style={styles.buttonContainer} onPress={startTimer}>
              <Text style={styles.buttonText}>Start Sequence</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timerContainer}>
            {timerRef.current && (
              <Timer
                key={timerKey}
                minutes={parseInt(minutes, 10)}
                seconds={parseInt(seconds, 10)}
                timePoints={timePoints || []}
                ids={ids || []}
                onFinish={handleTimerFinish}
                onTimePoint={handleOnTimePoint}
                ref={timerRef}
              />
            )}
          </View>
          {showTimePointsView && (
            <TimePointsView onClose={toggleTimePointsView} onAddTimePoints={handleAddTimePoints} />
          )}
        </>
      ) : (
        <>
          <View style={styles.heartRateTitleWrapper}>
            <Text style={styles.heartRateTitleText}>Please Connect to a BLE device</Text>
          </View>
          <TouchableOpacity onPress={handleConnectDisconnect} style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>{connectedDevice ? 'Disconnect' : 'Connect'}</Text>
          </TouchableOpacity>
          <DeviceModal
            closeModal={hideModal}
            visible={isModalVisible}
            connectToPeripheral={connectToDevice}
            devices={allDevices}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  heartRateTitleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  ctaButton: {
    backgroundColor: '#FF6060',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  buttonContainer: {
    elevation: 8,
    backgroundColor: '#009688',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    marginTop: 20,
  },
  timePointsList: {
    marginTop: 20,
    width: '100%',
  },
  timePointItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
