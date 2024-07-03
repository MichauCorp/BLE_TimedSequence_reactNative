import useBLE from "@/useBLE";
import Timer from '@/Timer';
import TimePointsView from '@/timePointsView'; // Assuming TimePointsView is correctly imported and named
import DeviceModal from "@/DeviceConnectionModal";
import Connect from "./Connect";
import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button,
  View,
  TextInput,
  FlatList // Import FlatList component
} from "react-native";

const ScentSequence = () => {
  const {
    allDevices,
    connectedDevice,
    writeValueToDevice,
  } = useBLE();
  const [rawDataToSend, setRawDataToSend] = useState<string>(''); // State for user input data
  const [timePoints, setTimePoints] = useState<number[] | null>(null); // State for time points, initially set to null
  const [ids, setIDs] = useState<string[]>([])

  const handleWrite = () => {
    // Convert rawDataToSend to Uint8Array (if needed) and write to device
    const dataToSend = new Uint8Array(rawDataToSend.split(',').map(Number));
    writeValueToDevice(dataToSend);
  };
  const [minutes, setMinutes] = useState(''); // State to store input value for minutes
  const [seconds, setSeconds] = useState(''); // State to store input value for seconds
  const [timerKey, setTimerKey] = useState(0); // Key to force re-mount of Timer component
  const timerRef = useRef<Timer | null>(null);
  const [listToggle, setListToggle] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const startTimer = () => {
    const parsedMinutes = parseInt(minutes, 10);
    const parsedSeconds = parseInt(seconds, 10);

    if (!isNaN(parsedMinutes) && !isNaN(parsedSeconds)) {
      const durationInSeconds = parsedMinutes * 60 + parsedSeconds;

      // Cleanup previous timer
      if (timerRef.current) {
        timerRef.current.componentWillUnmount();
      }

      // Create new timer
      timerRef.current = new Timer({
        minutes: parsedMinutes,
        seconds: parsedSeconds,
        onFinish: handleTimerFinish,
      });

      // Start the new timer
      timerRef.current.componentDidMount();

      // Increment key to force re-mount of Timer component
      setTimerKey((prevKey) => prevKey + 1);
    }
  };

  const handleTimerFinish = () => {
    console.log('Timer finished!');
    const dataToSend = new Uint8Array(0);
    //writeValueToDevice(dataToSend);
    // Handle timer finish event
  };

  const toggleTimerPause = () => {
    if (timerRef.current) {
      if (isPaused) {
        timerRef.current.resumeTimer();
        console.log('Timer resume')
      } else {
        timerRef.current.pauseTimer();
        console.log('Timer paused')
      }
      setIsPaused((prev) => !prev);
    }
  };

  const handleOnTimePoint = (id: string) => {

    console.log('TimePoint Reached');
    const dataToSend = new Uint8Array(parseInt(id));
    writeValueToDevice(dataToSend);
  }

  const handleMinutesChange = (text: string) => {
    setMinutes(text);
  };

  const handleSecondsChange = (text: string) => {
    setSeconds(text);
  };

  const [showTimePointsView, setShowTimePointsView] = useState(false);

  const toggleTimePointsView = () => {
    setShowTimePointsView((prev) => !prev);
  };
  
  const toggleList = () => {
    setListToggle((prev) => !prev)
  }

  const handleAddTimePoints = (timePointsData: number[], scentID: string) => {
    setTimePoints((prevTimePoints) => (prevTimePoints ? [...prevTimePoints, ...timePointsData] : [...timePointsData]));
    setIDs(prevIds => [...prevIds, scentID, scentID]); // Add scentID two times to ids array
    //toggleTimePointsView(); // Hide TimePointsView after adding time points
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.ButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View> 
        <TouchableOpacity style={styles.buttonContainer} onPress={toggleList}>
          <Text style={styles.ButtonText}>V</Text>
        </TouchableOpacity>
      </View>
      <View><Text> </Text></View>
      {/* Conditionally render FlatList if timePoints is not null and has items */}
      {listToggle && timePoints && timePoints.length > 0 && (
        <FlatList
         style={styles.timePointsList}
         data={timePoints.map((item, index) => ({ id: ids[index], timePoint: item }))} // Combine ids with timePoints
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
          <Text style={styles.ButtonText}>{isPaused ? ">" : "||"}</Text>
      </TouchableOpacity>
      <Text> </Text>
      <TouchableOpacity style={styles.buttonContainer} onPress={startTimer}>
          <Text style={styles.ButtonText}>Start Sequence</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        {timerRef.current && (
          <Timer
            key={timerKey}
            minutes={parseInt(minutes, 10)}
            seconds={parseInt(seconds, 10)}
            timePoints={timePoints || []} // Pass an empty array if timePoints is null
            ids={ids || []} // Pass an empty array if ids is null
            onFinish={handleTimerFinish}
            onTimePoint={handleOnTimePoint}
            ref={timerRef}
          />
        )}
      </View>

      {/* Render TimePointsView if showTimePointsView is true */}
      {showTimePointsView && (
        <TimePointsView onClose={toggleTimePointsView} onAddTimePoints={handleAddTimePoints}/>
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  timerContainer: {
    marginTop: 20,
  },
  buttonContainer: {
    elevation: 8,
    backgroundColor: "#009688",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  ButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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

export default ScentSequence;
