import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color: string;
  label?: string;
}

export function SimpleLineChart({ data, width, height, color, label }: SimpleLineChartProps) {
  if (data.length === 0) {
    return null;
  }

  // Calculate scales
  const values = data.map((d) => d.y);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2 - 30;

  // Generate points
  const points = data.map((point, index) => ({
    x: padding + (index / (data.length - 1 || 1)) * chartWidth,
    y: padding + chartHeight - ((point.y - minValue) / range) * chartHeight,
    value: point.y,
    label: point.label,
  }));

  // Create SVG-like path for line
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Generate Y-axis grid lines and labels
  const gridLines = [];
  const yLabels = [];
  for (let i = 0; i <= 4; i++) {
    const yValue = minValue + (range / 4) * i;
    const yPosition = padding + chartHeight - (i / 4) * chartHeight;

    gridLines.push(
      <View
        key={`grid-${i}`}
        style={{
          position: 'absolute',
          left: padding,
          top: yPosition,
          right: padding,
          height: 1,
          backgroundColor: '#E5E7EB',
        }}
      />
    );

    yLabels.push(
      <Text
        key={`label-y-${i}`}
        style={{
          position: 'absolute',
          top: yPosition - 8,
          left: 5,
          fontSize: 11,
          color: '#9CA3AF',
          fontWeight: '500',
          width: padding - 10,
          textAlign: 'right',
        }}
      >
        {yValue.toFixed(0)}
      </Text>
    );
  }

  // Generate X-axis labels
  const xLabels = points.map((point, index) => {
    // Show every label for months, or every nth for other intervals
    const showLabel = data.length <= 12 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1;
    
    return showLabel ? (
      <Text
        key={`label-x-${index}`}
        style={{
          position: 'absolute',
          left: point.x - 20,
          top: chartHeight + padding + 5,
          fontSize: 11,
          color: '#9CA3AF',
          fontWeight: '600',
          width: 40,
          textAlign: 'center',
        }}
      >
        {point.label || index + 1}
      </Text>
    ) : null;
  });

  // Create dots for each point
  const dots = points.map((point, index) => (
    <View
      key={`dot-${index}`}
      style={{
        position: 'absolute',
        left: point.x - 5,
        top: point.y - 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }}
    />
  ));

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {gridLines}
      </View>

      {/* Y-axis */}
      <View
        style={{
          position: 'absolute',
          left: padding - 1,
          top: padding,
          bottom: padding + 30,
          width: 1,
          backgroundColor: '#1F2937',
        }}
      />

      {/* X-axis */}
      <View
        style={{
          position: 'absolute',
          left: padding,
          bottom: padding + 30,
          right: padding,
          height: 1,
          backgroundColor: '#1F2937',
        }}
      />

      {/* Y-axis arrow */}
      <Text
        style={{
          position: 'absolute',
          left: padding - 8,
          top: padding - 12,
          fontSize: 16,
          color: '#1F2937',
        }}
      >
        ▲
      </Text>

      {/* X-axis arrow */}
      <Text
        style={{
          position: 'absolute',
          right: padding - 12,
          bottom: padding + 37,
          fontSize: 16,
          color: '#1F2937',
        }}
      >
        ▶
      </Text>

      {/* Y-axis labels */}
      {yLabels}

      {/* X-axis labels */}
      {xLabels}

      {/* Line connecting points (using View stack approximation) */}
      {points.map((point, index) => {
        if (index === 0) return null;

        const prevPoint = points[index - 1];
        const deltaX = point.x - prevPoint.x;
        const deltaY = point.y - prevPoint.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        return (
          <View
            key={`line-${index}`}
            style={{
              position: 'absolute',
              left: prevPoint.x,
              top: prevPoint.y,
              width: distance,
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }, { translateY: -1 }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}

      {/* Dots */}
      {dots}

      {/* Data points count */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: padding,
          right: padding,
          height: 15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '500' }}>
          {data.length} data points
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dataPointLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});
