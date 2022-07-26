import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {curveBasis, line, scaleLinear} from 'd3';
import {interpolate} from 'react-native-reanimated';
import {cubicCoordinates} from './util';
import Svg, {Defs, LinearGradient, Stop, Rect, G, Path} from 'react-native-svg';
import {curveData} from './curveData';

const GRAPH_WIDTH = 75;
const GRAPH_HEIGHT = GRAPH_WIDTH;

export type BezierData = {
  x: number;
  y: number;
};

const getCurve = (data: BezierData[]) => {
  const y = scaleLinear().domain([0, 1]).range([50, 0]);
  const x = scaleLinear().domain([0, 1]).range([0, 50]);

  const curvedLine = line<BezierData>()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(curveBasis)(data);

  return curvedLine;
};

const graphData = curveData.map(({data}) => {
  const coords = data
    ? getCurve(cubicCoordinates(data[0], data[1], data[2], data[3], data[4]))
    : null;
  return coords || null;
});

const Square = ({
  curve,
  stopOneRgb,
  stopTwoRgb,
}: {
  curve: number[] | undefined;
  stopOneRgb: number[];
  stopTwoRgb: number[];
}) => {
  return (
    <Svg viewBox="0 0 100 100">
      <Defs>
        <LinearGradient
          id={'gradient'}
          x1={'0%'}
          y1={'0%'}
          x2={'100%'}
          y2={'0%'}>
          {curve &&
            cubicCoordinates(
              curve[0],
              curve[1],
              curve[2],
              curve[3],
              curve[4],
            ).map(coord => {
              const redMin = stopOneRgb[0];
              const greenMin = stopOneRgb[1];
              const blueMin = stopOneRgb[2];
              const redMax = stopTwoRgb[0];
              const greenMax = stopTwoRgb[1];
              const blueMax = stopTwoRgb[2];

              const redVal = Math.round(
                interpolate(coord.y, [0, 1], [redMin, redMax]),
              );
              const greenVal = Math.round(
                interpolate(coord.y, [0, 1], [greenMin, greenMax]),
              );
              const blueVal = Math.round(
                interpolate(coord.y, [0, 1], [blueMin, blueMax]),
              );

              return (
                <Stop
                  key={coord.x}
                  stopColor={`rgb(${redVal}, ${greenVal}, ${blueVal})`}
                  offset={`${Math.round(coord.x * 100)}%`}
                />
              );
            })}
        </LinearGradient>
      </Defs>
      <Rect width={'100%'} height={'100%'} fill="url(#gradient)" />
    </Svg>
  );
};
const App = () => {
  const [curveIndex, setCurveIndex] = useState(0);
  const [stopOneRgb, setStopOneRgb] = useState([255, 255, 255]);
  const [stopTwoRgb, setStopTwoRgb] = useState([0, 0, 0]);
  const {width, height} = useWindowDimensions();

  const onCurveChange = (index: number) => {
    setCurveIndex(index);
  };
  const onStopOneChange = (value: string) => {
    const hex = value.replace('#', '');
    const r = parseInt(hex[0] + hex[1], 16);
    const g = parseInt(hex[2] + hex[3], 16);
    const b = parseInt(hex[4] + hex[5], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      setStopOneRgb([r, g, b]);
    }
  };
  const onStopTwoChange = (value: string) => {
    const hex = value.replace('#', '');
    const r = parseInt(hex[0] + hex[1], 16);
    const g = parseInt(hex[2] + hex[3], 16);
    const b = parseInt(hex[4] + hex[5], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      setStopTwoRgb([r, g, b]);
    }
  };
  return (
    <SafeAreaView
      style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>
          {curveData[curveIndex].name}
        </Text>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>
          {curveData?.[curveIndex]?.data
            ? curveData?.[curveIndex]?.data?.join(', ')
            : 'none'}
        </Text>
      </View>

      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: width,
          height: width,
        }}>
        <Square
          curve={curveData[curveIndex].data}
          stopOneRgb={stopOneRgb}
          stopTwoRgb={stopTwoRgb}
        />
      </View>
      <View style={{marginHorizontal: 10, flex: 0.3, marginBottom: 5}}>
        <Text>First Stop Color</Text>
        <TextInput
          style={{
            borderColor: '#1473e6',
            borderWidth: 1,
            padding: 5,
            marginBottom: 10,
            fontFamily: 'menlo',
          }}
          onChangeText={onStopOneChange}
          autoCapitalize={'none'}
          placeholder={'FFFFFF'}
        />
        <Text>Second Stop Color</Text>
        <TextInput
          style={{
            borderColor: '#1473e6',
            borderWidth: 1,
            padding: 5,
            marginBottom: 10,
            fontFamily: 'menlo',
          }}
          onChangeText={onStopTwoChange}
          autoCapitalize={'none'}
          placeholder={'000000'}
        />
      </View>
      <ScrollView style={{flex: 1, marginTop: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginTop: 10,
          }}>
          {graphData.map((_, i) => {
            return (
              <TouchableOpacity
                key={i}
                onPress={() => onCurveChange(i)}
                style={[
                  {padding: 10, borderRadius: 10, margin: 10},
                  curveIndex === i ? {backgroundColor: '#90e0ef'} : null,
                ]}>
                <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} stroke="#1473e6">
                  <G x={5} y={5}>
                    <Path d={graphData[i]} strokeWidth="2" />
                  </G>
                </Svg>
                <Text>{curveData[i].name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;