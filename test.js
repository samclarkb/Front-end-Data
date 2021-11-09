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

// Global variable for all data
let data

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
	data = json

	update(data)
})

function update(new_data) {
	//update the scales
	xscale.domain([0, d3.max(new_data.artists.artist, d => +d.playcount)])
	yscale.domain(new_data.artists.artist.map(d => d.name))
	//render the axis
	g_xaxis.call(xaxis)
	g_yaxis.call(yaxis)

	// Render the chart with new data

	// DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item
	const rect = g
		.selectAll('rect')
		.data(new_data.artists.artist, d => d.name)
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

	// ENTER + UPDATE
	// both old and new elements
	rect.attr('height', yscale.bandwidth())
		.attr('width', d => xscale(d.playcount))
		.attr('y', d => yscale(d.name))

	rect.select('title').text(d => d.name)
}

//interactivity
d3.select('#filter-us-only').on('change', function () {
	// This will be triggered when the user selects or unselects the checkbox
	const checked = d3.select(this).property('checked')
	if (checked === true) {
		// Checkbox was just checked

		// Keep only data element whose country is US
		const filtered_data = data.filter(d => d.location.country === 'US')

		update(filtered_data) // Update the chart with the filtered data
	} else {
		// Checkbox was just unchecked
		update(data) // Update the chart with all the data we have
	}
})
