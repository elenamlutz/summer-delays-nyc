import * as d3 from 'd3'
import d3Tip from 'd3-tip'
d3.tip = d3Tip

const margin = { top: 130, left: 30, right: 10, bottom: 30 }
const height = 500 - margin.top - margin.bottom
const width = 500 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const yPositionScale = d3
  .scaleLinear()
  .domain([0, 30])
  .range([height, 0])
const xPositionScale = d3
  .scaleBand()
  .domain([
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec'
  ])
  .padding(0.1)
  .range([0, width])

const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return (
      "Flights Delayed: <span style='color:white'>" +
      d.Delayed +
      '%' +
      '</span>'
    )
  })
svg.call(tip)

d3.csv(require('../data/flightdelays.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  svg
    .selectAll('.airline-rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('class', 'airline-rect')
    .attr('width', 30)
    .attr('x', function(d) {
      return xPositionScale(d.Month)
    })
    .attr('height', function(d) {
      return height - yPositionScale(d.Delayed)
    })
    .attr('y', function(d) {
      return yPositionScale(d.Delayed)
    })
    .attr('fill', '#FC8D6D')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  svg
    .append('text')
    .attr('class', 'title')
    .attr('x', -30)
    .attr('y', -90)
    .text('Flights Delayed at NYC Airports')
  svg
    .append('text')
    .attr('class', 'subtitle')
    .attr('x', -30)
    .attr('y', -65)
    .text('Summer travelers experienced some of the worst delays in 2018.')

  // Axes
  const xAxis = d3.axisBottom(xPositionScale).tickSize(0)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
  // svg
  //   .append('g')
  //   // .attr('class', 'blackAxis')
  //   .attr('transform', 'translate(0,' + height + ')')
  //   .call(xAxis)

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(0)
    .ticks(7)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    // .attr('transform', 'translate(0,' + -8 + ')')
    .call(yAxis)
  svg.selectAll('.y-axis path').remove()
  svg.selectAll('.x-axis path').attr('stroke', 'black')

  // svg
  //   .append('g')
  //   .attr('class', 'whiteAxis')
  //   .call(yAxis)
}
function make_y_gridlines() {
  return d3.axisLeft(yPositionScale)
}
svg
  .append('g')
  .attr('class', 'grid')
  .style('stroke-dasharray', 5)
  .call(
    make_y_gridlines()
      .tickSize(-width)
      .ticks(7)
      .tickFormat('')
  )
