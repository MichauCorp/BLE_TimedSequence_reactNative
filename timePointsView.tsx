import React, { Component } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

interface TimePointsViewProps {
  onClose?: () => void; // Define onClose as a callback that returns void
  onAddTimePoints?: (timePointsData: number[], scentID: string) => void; // Callback for adding time points
}

interface TimePointsViewState {
  startMinutes: string;
  startSeconds: string;
  endMinutes: string;
  endSeconds: string;
  scentID: string;
  startPoint?: number;
  endPoint?: number;
}

class TimePointsView extends Component<TimePointsViewProps, TimePointsViewState> {
  constructor(props: TimePointsViewProps) {
    super(props);
    this.state = {
      startMinutes: '',
      startSeconds: '',
      endMinutes: '',
      endSeconds: '',
      scentID: '',
      startPoint: undefined,
      endPoint: undefined,
    };
  }

  handleStartMinutesChange = (text: string) => {
    this.setState({ startMinutes: text });
  };

  handleStartSecondsChange = (text: string) => {
    this.setState({ startSeconds: text });
  };

  handleEndMinutesChange = (text: string) => {
    this.setState({ endMinutes: text });
  };

  handleEndSecondsChange = (text: string) => {
    this.setState({ endSeconds: text });
  };

  handleScentIDChange = (text: string) => {
    this.setState({ scentID: text });
  };

  handleSubmit = () => {
    const { startMinutes, startSeconds, endMinutes, endSeconds, scentID } = this.state;
    const parsedStartMinutes = parseInt(startMinutes, 10);
    const parsedStartSeconds = parseInt(startSeconds, 10);
    const parsedEndMinutes = parseInt(endMinutes, 10);
    const parsedEndSeconds = parseInt(endSeconds, 10);

    const startPoint = parsedStartMinutes * 60 + parsedStartSeconds;
    const endPoint = parsedEndMinutes * 60 + parsedEndSeconds;

    if(startPoint <= endPoint)
      {
        console.log("invalid inputs")
      }
    else
    {
      this.setState({
        startPoint,
        endPoint,
      });
  
      // Call onAddTimePoints callback if provided
      if (this.props.onAddTimePoints) {
        this.props.onAddTimePoints([startPoint,endPoint], scentID);
      }
  
      // Call onClose callback if provided
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  };

  render() {
    const { startMinutes, startSeconds, endMinutes, endSeconds, scentID } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text>Activate scent</Text>
            <TextInput
              style={styles.input}
              placeholder="Scent number"
              keyboardType="numeric"
              value={scentID}
              onChangeText={this.handleScentIDChange}
            />
          <Text>from:</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Minutes"
              keyboardType="numeric"
              value={startMinutes}
              onChangeText={this.handleStartMinutesChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Seconds"
              keyboardType="numeric"
              value={startSeconds}
              onChangeText={this.handleStartSecondsChange}
            />
          </View>
          <Text> to: </Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Minutes"
              keyboardType="numeric"
              value={endMinutes}
              onChangeText={this.handleEndMinutesChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Seconds"
              keyboardType="numeric"
              value={endSeconds}
              onChangeText={this.handleEndSecondsChange}
            />
          </View>
          <TouchableOpacity style={styles.buttonContainer} onPress={this.handleSubmit}>
            <Text style={styles.ButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  inputContainer: {
    flexDirection: "column", // Changed to column to display rows vertically
    marginBottom: 20,
    alignItems: "center", // Center items horizontally within the column
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
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
});

export default TimePointsView;
