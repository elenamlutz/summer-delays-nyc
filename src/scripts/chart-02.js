import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 150, left: 50, right: 250, bottom: 30 }
const height = 600 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3
  .scalePoint()
  .domain(['2014', '2018'])
  .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([20, 34])
  .range([height, 0])

const formatPercent = d3.format('.0%')

const colorScale = d3
  .scaleOrdinal()
  .domain([
    'American Airlines',
    'Delta Air Lines',
    'Envoy Air',
    'ExpressJet Airlines Inc.',
    'JetBlue Airways',
    'SkyWest Airlines Inc.',
    'Southwest Airlines Co.',
    'United Air Lines Inc.'
  ])
  .range([
    'orange',
    'purple',
    '#88A72F',
    'red',
    '#37AE96',
    '#57B4DC',
    '#F4BE02',
    '#3B6588'
  ])

const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:white'>" + d.ratio_delays + '%' + '</span>'
  })

svg.call(tip)

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.year)
  })
  .y(function(d) {
    return yPositionScale(d.ratio_delays)
  })

d3.csv(require('../data/slopegraph.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready(datapoints) {
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'airline-circle')
    .attr('r', 5)
    .attr('cx', function(d) {
      return xPositionScale(d.year)
    })
    .attr('cy', function(d) {
      return yPositionScale(d.ratio_delays)
    })
    .attr('fill', function(d) {
      return colorScale(d.carrier_name)
    })
    .on('mouseover', tip.show)
    // function(d) {
    //   tip.show()
    //   d3.select(this)
    //     .transition()
    //     .duration(200)
    //     .attr('r', 8)
    // })
    .on('mouseout', tip.hide)
  // function(d) {
  //   tip.hide()
  //   d3.select(this)
  //     .transition()
  //     .duration(200)
  //     .attr('r', 5)
  // })

  const nested = d3
    .nest()
    .key(function(d) {
      return d.carrier_name
    })
    .entries(datapoints)

  svg
    .selectAll('path')
    .data(nested)
    .enter()
    .append('path')
    .attr('class', 'hover')
    .attr('stroke', function(d) {
      return colorScale(d.key)
    })
    .attr('stroke-width', 1.5)
    .attr('fill', 'none')
    .attr('d', function(d) {
      return line(d.values)
    })

  svg
    .selectAll('text')
    .data(nested)
    .enter()
    .append('text')
    .attr('class', 'hover')
    .attr('font-size', 12)
    .attr('fill', 'black')
    .attr('x', xPositionScale('2018'))
    .attr('dx', 10)
    .attr('y', function(d) {
      console.log(d.key)
      const datapoints = d.values
      const airlineData = datapoints.find(d => d.year === '2018')
      return yPositionScale(airlineData.ratio_delays)
    })
    .text(function(d) {
      return d.key
    })
    .attr('dy', function(d) {
      if (d.key === 'SkyWest Airlines Inc.') {
        return -4
      }
      if (d.key === 'JetBlue Airways') {
        return 12
      }
      if (d.key === 'Southwest Airlines Co.') {
        return 0.5
      }
      if (d.key === 'ExpressJet Airlines Inc.') {
        return 10
      }
      return 4
    })

  svg
    .append('text')
    .attr('class', 'title')
    .attr('x', -40)
    .attr('y', -110)
    .attr('text-anchor', 'right')
    .text('Average Flight Delays by Airline')
  svg
    .append('text')
    .attr('class', 'subtitle')
    .attr('x', -40)
    .attr('y', -80)
    .attr('text-anchor', 'right')
    .text(
      'ExpressJet, a regional Atlanta-based airline owned by United Airlines, was the airline'
    )
  svg
    .append('text')
    .attr('class', 'subtitle')
    .attr('x', -40)
    .attr('y', -60)
    .attr('wrap', 200)
    .attr('text-anchor', 'right')
    .text('with the greatest increase in average delays.')

  // Add annotation to the chart

  const annotations = [
    {
      note: {
        label: 'ExpressJet had a 4.7% increase in average delays.',
        title: 'Delays in Georgia',
        align: 'left', // try right or left
        wrap: 200, // try something smaller to see text split in several lines
        padding: 5 // More = text lower
      },
      color: ['red'],
      data: { carrier_name: 'ExpressJet Airlines Inc.', ratio_delays: 29 },
      x: 280,
      y: 105,
      dy: 50,
      dx: 30
    }
  ]
  const makeAnnotations = d3Annotation
    .annotation()
    .accessors({
      x: d => xPositionScale(d.year),
      y: d => yPositionScale(d.ratio_delays)
    })
    .annotations(annotations)
  svg.call(makeAnnotations)

  const xAxis = d3.axisBottom(xPositionScale)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()
  svg.selectAll('.x-axis text').attr('dy', 15)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickValues([20, 22, 24, 26, 28, 30, 32, 34])
    .tickSize(-width)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .lower()

  svg.selectAll('.y-axis path').remove()
  svg.selectAll('.x-axis path').remove()
  svg.selectAll('.y-axis text').attr('dx', -10)
  svg
    .selectAll('.y-axis line')
    .attr('stroke-dasharray', 2)
    .attr('stroke', 'grey')
  d3.select('#text').style('display', 'none')
}
