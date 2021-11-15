// De afmetingen van de gehele grafiek
const margin = { top: 40, bottom: 10, left: 120, right: 20 }
const width = 1200 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

// Creates sources <svg> element
const svg = d3
	.select('body')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

// Group used to enforce margin
const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

// Scales setup
const xscale = d3.scaleLinear().range([0, width])
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1)

// Axis setup
const xaxis = d3.axisTop().scale(xscale)
const g_xaxis = g.append('g').attr('class', 'x axis')
const yaxis = d3.axisLeft().scale(yscale)
const g_yaxis = g.append('g').attr('class', 'y axis')

/////////////////////////
// TODO use animated transtion between filtering changes

d3.json(
	'http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=10&api_key=05064fdc55f8c3320ca9ed2c12ae1fa4&artist?&format=json'
).then(json => {
	data = json.artists.artist

	update(data)
})

function update() {
	//update the scale
	data.sort(function (a, b) {
		return b.playcount - a.playcount
	})
	// console.log(data.map(d => d.playcount))

	xscale.domain([0, d3.max(data, d => +d.playcount)])
	yscale.domain(data.map(d => d.name))
	//render the axis
	g_xaxis.transition().duration(800).ease(d3.easePoly).call(xaxis)
	g_yaxis.transition().duration(800).ease(d3.easePoly).call(yaxis)

	// Render the chart with new data

	// DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
	const rect = g
		.selectAll('rect')
		.data(data, d => d.name)
		.join(
			// ENTER
			// new elements
			enter => {
				const rect_enter = enter.append('rect').attr('x', 0)
				rect_enter.append('title')
				return rect_enter
			},
			// UPDATE
			// update existing elements
			update => update,
			// EXIT
			// elements that aren't associated with data
			exit => exit.remove()
		)
		.on('mouseover', onMouseOver)
		.on('mousemove', onMouseOver)
		.on('mouseout', onMouseOut)

	rect.attr('height', yscale.bandwidth())
		// .on('mouseover', onMouseOver)
		// .on('mouseout', onMouseOut)
		.transition()
		.duration(800)
		.ease(d3.easePoly)
		.attr('y', d => yscale(d.name))
		// .delay((d, i) => {
		// 	return i * 200
		// })
		.attr('width', d => xscale(d.playcount))

	// ENTER + UPDATE
	// both old and new elements
	rect.select('title').text(d => d.name)
}

function filtered_data(data) {
	//update the scales
	data.sort(function (a, b) {
		return b.listeners - a.listeners
	})
	// console.log(data.map(d => d.playcount))

	xscale.domain([0, d3.max(data, d => +d.listeners)])
	yscale.domain(data.map(d => d.name))
	//render the axis
	g_xaxis.transition().duration(800).ease(d3.easePoly).call(xaxis)
	g_yaxis.transition().duration(800).ease(d3.easePoly).call(yaxis)

	// Render the chart with new data

	// DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
	const rect = g
		.selectAll('rect')
		.data(data, d => d.name)
		.join(
			// ENTER
			// new elements
			enter => {
				const rect_enter = enter.append('rect').attr('x', 0)
				rect_enter.append('title')
				return rect_enter
			},
			// UPDATE
			// update existing elements
			update => update,
			// EXIT
			// elements that aren't associated with data
			exit => exit.remove()
		)

	rect.attr('height', yscale.bandwidth())
		// transitie
		// .on('mouseover', onMouseOver)
		// .on('mouseout', onMouseOut)
		.transition()
		.duration(800)
		.ease(d3.easePoly)
		.attr('y', d => yscale(d.name))
		// .delay((d, i) => {
		// 	return i * 200
		// })
		.attr('width', d => xscale(d.listeners))
}

function average(data) {
	//update the scales
	data.sort(function (a, b) {
		return b.playcount / b.listeners - a.playcount / a.listeners
	})
	// console.log(data.map(d => d.playcount))

	xscale.domain([0, d3.max(data, d => +d.playcount / d.listeners)])
	yscale.domain(data.map(d => d.name))
	//render the axis
	g_xaxis.transition().duration(800).ease(d3.easePoly).call(xaxis)
	g_yaxis.transition().duration(800).ease(d3.easePoly).call(yaxis)

	// Render the chart with new data

	// DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
	const rect = g
		.selectAll('rect')
		.data(data, d => d.name)
		.join(
			// ENTER
			// new elements
			enter => {
				const rect_enter = enter.append('rect').attr('x', 0)
				rect_enter.append('title')
				return rect_enter
			},
			// UPDATE
			// update existing elements
			update => update,
			// EXIT
			// elements that aren't associated with data
			exit => exit.remove()
		)

	rect.attr('height', yscale.bandwidth())
		// transitie
		// .on('mouseover', onMouseOver)
		// .on('mouseout', onMouseOut)

		// .on('mouseover', function (d) {
		// 	.transition().duration(200).style('opacity', 0.9)
		// 	.text(yscale(d.name) + '<br/>' + xscale(d.playcount / d.listeners))
		// 		.style('left', d3.event.pageX + 'px')
		// 		.style('top', d3.event.pageY - 28 + 'px')
		// })
		// .on('mouseout', function () {
		// 	div.transition().duration(500).style('opacity', 0)
		// })
		.transition()
		.duration(800)
		.ease(d3.easePoly)
		.attr('y', d => yscale(d.name))
		// .on('mouseover', onMouseOver)
		// .on('mouseout', onMouseOut)
		.attr('width', d => xscale(d.playcount / d.listeners))
	// .on('mouseover', function (d) {
	// 	//Get this bar's x/y values, then augment for the tooltip
	// 	var xPosition = parseFloat(d3.select(this).attr('x')) + xScale.rangeBand() / 2
	// 	var yPosition = parseFloat(d3.select(this).attr('y')) + 14
	// 	console.log(d)
	// 	//Update the tooltip position and value
	// 	d3.select('#tooltip')
	// 		.style('left', xPosition + 'px')
	// 		.style('top', yPosition + 'px')
	// 	d3.select('#value').text(d.playcount / d.listeners)

	// 	//Show the tooltip
	// 	d3.select('#tooltip').classed('hidden', false)
	// })

	// .on('mouseout', function () {
	// 	//Remove the tooltip
	// 	d3.select('#tooltip').remove()
	// })
}

function onMouseOver(d, i) {
	const xPosition = d.clientX
	const yPosition = d.clientY

	let toolTipValue
	debugger
	if (selection === 'average') {
		toolTipValue = i.playcount / i.listeners
	} else {
		toolTipValue = i[selection]
	}
	d3.select(this).attr('class', 'highlight')
	// d3.select('#tooltip').select('#value').text(i.value)
	d3.select('#tooltip').classed('hidden', false)
	d3.select('#tooltip')
		.style('left', xPosition + 'px')
		.style('top', yPosition + 'px')
	d3.select('#value').text(Math.round(toolTipValue))
	d3.select('#name').text(i.name)
}

function onMouseOut(d, i) {
	d3.select(this).attr('class', 'bar')
	d3.select('#tooltip').classed('hidden', true)
}

let selection = 'playcount'
d3.selectAll('#filter').on('change', function () {
	const checked = d3.select(this).property('checked')
	if (checked === true) {
		if (d3.select(this).node().value === 'streams') {
			selection = 'playcount'
			update(data)
		}
		if (d3.select(this).node().value === 'listeners') {
			selection = 'listeners'
			filtered_data(data)
		}
		if (d3.select(this).node().value === 'average') {
			selection = 'average'
			average(data)
		}
	} else {
		update(data)
	}
})
