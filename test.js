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

// TODO use animated transtion between filtering changes

d3.json(
	'http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=10&api_key=05064fdc55f8c3320ca9ed2c12ae1fa4&artist?&format=json'
).then(json => {
	data = json.artists.artist

	update(data)
})

function update(data, type) {
	sorteren(data, type)

	if (type === 'playcount') {
		xscale.domain([0, d3.max(data, d => +d.playcount)])
	}
	if (type === 'listeners') {
		xscale.domain([0, d3.max(data, d => +d.listeners)])
	}
	if (type === 'average') {
		xscale.domain([0, d3.max(data, d => +d.playcount / d.listeners)])
	} else {
		xscale.domain([0, d3.max(data, d => +d.playcount)])
	}

	yscale.domain(data.map(d => d.name))
	// xscale.domain([0, d3.max(data, d => +d.playcount)])
	//render the axis
	g_xaxis.transition().duration(800).ease(d3.easePoly).call(xaxis)
	g_yaxis.transition().duration(800).ease(d3.easePoly).call(yaxis)

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
		// aanroepen van de mouse events
		.on('mouseover', onMouseOver)
		.on('mousemove', onMouseOver) // Mousemove returnt constant de coördinaten van de muis
		.on('mouseout', onMouseOut)

	rect.attr('height', yscale.bandwidth())
		.transition()
		.duration(800)
		.ease(d3.easePoly)
		.attr('y', d => yscale(d.name))
	// .attr('width', d => xscale(d.playcount))

	if (type === 'playcount') {
		rect.attr('width', d => xscale(d.playcount))
	}
	if (type === 'listeners') {
		rect.attr('width', d => xscale(d.listeners))
	}
	if (type === 'average') {
		rect.attr('width', d => xscale(d.playcount / d.listeners))
	} else {
		rect.attr('width', d => xscale(d.playcount))
	}
}

sorteren = (data, type) => {
	data.sort(function (a, b) {
		if (type === 'playcount') {
			return b.playcount - a.playcount
		}
		if (type === 'listeners') {
			return b.listeners - a.listeners
		}
		if (type === 'average') {
			return b.playcount / b.listeners - a.playcount / a.listeners
		} else {
			return b.playcount - a.playcount
		}
	})
}

function onMouseOver(d, data) {
	// positie van mijn muis
	const xPosition = d.clientX
	const yPosition = d.clientY

	let toolTipValue

	if (selection === 'average') {
		toolTipValue = data.playcount / data.listeners
	} else {
		toolTipValue = data[selection]
	}

	d3.select(this).attr('class', 'highlight')
	d3.select('#tooltip').classed('hidden', false)
	d3.select('#tooltip')
		.style('left', xPosition + 'px')
		.style('top', yPosition + 'px')
	d3.select('#name').text(`${data.name} heeft `)

	if (selection === 'playcount') {
		d3.select('#value').text(`${Math.round(toolTipValue)} totaal aantal streams `)
	}
	if (selection === 'listeners') {
		d3.select('#value').text(`${Math.round(toolTipValue)} aantal verschillende luisteraars `)
	}
	if (selection === 'average') {
		d3.select('#value').text(`${Math.round(toolTipValue)} streams gemiddeld per luisteraar`)
	}
}

function onMouseOut() {
	d3.select(this).attr('class', 'bar')
	d3.select('#tooltip').classed('hidden', true)
}

let selection = 'playcount'

d3.selectAll('#filter').on('change', function () {
	const checked = d3.select(this).property('checked')
	if (checked === true) {
		if (d3.select(this).node().value === 'playcount') {
			selection = 'playcount'
			update(data, 'playcount')
		}
		if (d3.select(this).node().value === 'listeners') {
			selection = 'listeners'
			update(data, 'listeners')
		}
		if (d3.select(this).node().value === 'average') {
			selection = 'average'
			update(data, 'average')
		}
	} else {
		update(data, 'playcount')
	}
})
