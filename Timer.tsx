// Timer.tsx

import React, { Component } from 'react';
import { Text, View } from 'react-native';

interface Props {
  minutes: number; // initial minutes
  seconds: number; // initial seconds
  ids?: string[]; // corresponding ids to start at the timepoints
  timePoints?: number[]; // time points to activate scents
  onFinish?: () => void; // optional callback when timer finishes
  onTimePoint?: (id: string) => void; // optional callback when timePoint is reached
  isPaused?: boolean; // optional prop to indicate if timer is paused
}

interface State {
  timeRemaining: number;
}

class Timer extends Component<Props, State> {
  private timer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);

    const { minutes, seconds } = this.props;
    const initialTimeInSeconds = minutes * 60 + seconds;

    this.state = {
      timeRemaining: initialTimeInSeconds,
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Check if isPaused prop has changed
    if (prevProps.isPaused !== this.props.isPaused) {
      if (this.props.isPaused) {
        this.pauseTimer();
      } else {
        this.resumeTimer();
      }
    }
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      if (!this.props.isPaused && this.state.timeRemaining > 0) {
        this.setState((prevState) => ({
          timeRemaining: prevState.timeRemaining - 1,
        }), () => {
          // Check if current timeRemaining matches any time point
          const { timePoints, ids } = this.props;
          if (timePoints && ids) {
            const index = timePoints.indexOf(this.state.timeRemaining);
            if (index !== -1 && this.props.onTimePoint) {
              this.props.onTimePoint(ids[index]);
            }
          }
        });
      } else {
        this.clearTimer();
        if (this.props.onFinish && this.state.timeRemaining <= 0) {
          this.props.onFinish();
        }
      }
    }, 1000);
  };

  pauseTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  resumeTimer = () => {
    if (!this.timer) {
      this.startTimer();
    }
  };

  clearTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  render() {
    const { timeRemaining } = this.state;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
      <View>
        <Text>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</Text>
      </View>
    );
  }
}

export default Timer;
