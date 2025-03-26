import React, { useState } from "react";
import Slider from "@mui/material/Slider";
import "./Timeline.css";
import {
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  ZoomIn,
  ZoomOut,
  ViewComfy,
} from "@mui/icons-material";

const Timeline = () => {
  // Two values for the range selector (Start and End of the selected time slice)
  const [timeRange, setTimeRange] = useState<number[]>([20, 70]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setTimeRange(newValue as number[]);
  };

  return (
    <div className="timeline-wrapper">
      {/* Timeline Bar */}
      <div className="timeline-bar">
        <Slider
          value={timeRange}
          onChange={handleChange}
          min={0}
          max={100}
          step={1}
          aria-labelledby="timeline-slider"
          className="custom-slider"
        />
        {/* Time Labels */}
        <div className="timeline-labels">
          <span>Sun. 12:00</span>
          <span>Mon. 0:00</span>
          <span>Mon. 12:00</span>
          <span>Now</span>
          <span>17:00</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="timeline-controls">
        <FastRewind className="icon-btn" />
        <Pause className="icon-btn" />
        <PlayArrow className="icon-btn" />
        <FastForward className="icon-btn" />
        <ZoomIn className="icon-btn" />
        <ZoomOut className="icon-btn" />
        <ViewComfy className="icon-btn" />
      </div>
    </div>
  );
};

export default Timeline;