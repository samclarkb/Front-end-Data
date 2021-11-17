// De afmetingen van de gehele svg
const margin = { top: 40, bottom: 10, left: 120, right: 20 }
const width = 1200 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

//
const svg = d3
	.select('body')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

//
const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

//
const xscale = d3.scaleLinear().range([0, width]) // scaleLinear om de gaten tussen de data even groot te houden
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.15) // padding tussen de rectangles

// Y en X as
const xaxis = d3.axisTop().scale(xscale) // X as zet ik hier aan de bovenkant van de grafiek
const g_xaxis = g.append('g').attr('class', 'x axis')
const yaxis = d3.axisLeft().scale(yscale) // data van de Y as zet ik hier aan de linkerkant van de grafiek
const g_yaxis = g.append('g').attr('class', 'y axis')

// Hier haal ik data uit de externe API
d3.json(
	'https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=10&api_key=05064fdc55f8c3320ca9ed2c12ae1fa4&artist?&format=json'
).then(json => {
	data = json.artists.artist // Ik zet artists.artist achter json om het pad van het object te definiëren

	update(data).catch(err => {
		console.error(err)
	})
})

function update(data, type) {
	sorteren(data, type)

	if (type === 'playcount') {
		xscale.domain([0, d3.max(data, d => +d.playcount)])
	} else if (type === 'listeners') {
		xscale.domain([0, d3.max(data, d => +d.listeners)])
	} else if (type === 'average') {
		xscale.domain([0, d3.max(data, d => +d.playcount / d.listeners)])
	} else {
		xscale.domain([0, d3.max(data, d => +d.playcount)])
	}
	yscale.domain(data.map(d => d.name))

	// Het renderen van de X en Y as. Ook geef ik hier een transitie van één seconde mee
	g_xaxis.transition().duration(1000).ease(d3.easePoly).call(xaxis)
	g_yaxis.transition().duration(1000).ease(d3.easePoly).call(yaxis)

	//
	const rect = g
		.selectAll('rect')
		.data(data, d => d.name)
		.join(enter => {
			const rect_enter = enter.append('rect').attr('x', 0)
			rect_enter.append('title')
			return rect_enter
		})
		// aanroepen van de mouse events
		.on('mouseover', onMouseOver)
		.on('mousemove', onMouseOver) // Mousemove returnt constant de coördinaten van de muis
		.on('mouseout', onMouseOut)

	rect.attr('height', yscale.bandwidth())

	// hier stop ik de data in de rectangles. Ik geef hier ook de transities op mijn rectangles mee
	if (type === 'playcount') {
		rect.transition()
			.duration(1000)
			.attr('width', d => xscale(d.playcount))
			.attr('y', d => yscale(d.name))
	} else if (type === 'listeners') {
		rect.transition()
			.duration(1000) // Hiermee zet ik de duur van de transitie van de rectangles op één seconde
			.attr('width', d => xscale(d.listeners))
			.attr('y', d => yscale(d.name))
	} else if (type === 'average') {
		rect.transition()
			.duration(1000)
			.attr('width', d => xscale(d.playcount / d.listeners))
			.attr('y', d => yscale(d.name))
	} else {
		rect.transition()
			.duration(1000)
			.attr('width', d => xscale(d.playcount))
			.attr('y', d => yscale(d.name))
	}
}

// Dit is de functie die ervoor zorgt dat de artiest met de hoogste waarde bovenaan de grafiek staat
sorteren = (data, type) => {
	data.sort(function (a, b) {
		if (type === 'playcount') {
			return b.playcount - a.playcount // b - a omdat ik hoogste waarde bovenaan wil zetten. Als ik de laagste waarde bovenaan wil zetten wordt het a - b
		} else if (type === 'listeners') {
			return b.listeners - a.listeners
		} else if (type === 'average') {
			return b.playcount / b.listeners - a.playcount / a.listeners
		} else {
			return b.playcount - a.playcount
		}
	})
}

// Deze functie zorgt ervoor dat er een pop up verschijnt wanneer je over een rectangle heen hovert
function onMouseOver(d, data) {
	// d.clientX en d.clientY zijn properties in het onMouseOver object die de coördinaten van de muis opspoort
	const xPosition = d.clientX
	const yPosition = d.clientY
	let toolTipValue

	if (selection === 'average') {
		toolTipValue = data.playcount / data.listeners
	} else {
		toolTipValue = data[selection]
	}

	d3.select(this).attr('class', 'highlight') // highlight refereert naar een class in de CSS die de opacity op 0,7 zet
	d3.select('#tooltip').classed('hidden', false) // ik zet de CSS class hidden op false, zodat de pop te voorschijn komt
	d3.select('#tooltip') // hier geef ik aan dat de pop up op de coördinaten van de muis moet worden weergegeven
		.style('left', xPosition + 'px')
		.style('top', yPosition + 'px')
	d3.select('#name').text(`${data.name} heeft `)
	// Ik gebruik hier een if else statement, omdat ik voor iedere filter een andere text wil laten zien
	if (selection === 'playcount') {
		d3.select('#value').text(`${toolTipValue} totaal aantal streams `)
	}
	if (selection === 'listeners') {
		d3.select('#value').text(`${toolTipValue} aantal verschillende luisteraars `)
	}
	if (selection === 'average') {
		d3.select('#value').text(`${Math.round(toolTipValue)} streams gemiddeld per luisteraar`) // Ik gebruik hier Math.round omdat ik het getal van deze uitkomst wil afronden
	}
}

// Deze functie zorgt ervoor dat de pop up wordt verwijderd wanneer de mui zich niet meer op de rectangle bevindt
function onMouseOut() {
	d3.select(this).attr('class', 'bar')
	d3.select('#tooltip').classed('hidden', true) // Hidden refereert naar een CSS class die de pop up op display none zet
}

// Hiermee zet ik de default op playcount
let selection = 'playcount'

// Met deze functie leg ik de verbinding tussen de radio buttons en de data uit de externe API
d3.selectAll('#filter').on('change', function () {
	const checked = d3.select(this).property('checked')
	if (checked === true) {
		if (d3.select(this).node().value === 'playcount') {
			// Er wordt hier gerefereert naar de value van de radio buttons
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
	}
})
