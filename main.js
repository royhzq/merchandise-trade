var div_width = document.getElementById('chart-area').offsetWidth
var intended_width = 825
var intended_height = 625
var margin = { 
    left:50 * div_width/intended_width, 
    right:100 * div_width/intended_width, 
    top:40 * div_width/intended_width, 
    bottom:150* div_width/intended_width 
}
var width = div_width - margin.left - margin.right //825 - margin.left - margin.right
var height = intended_height * width / intended_width - margin.top - margin.bottom

var svg = d3.select("#chart-area").append("svg")

    .attr('viewBox','0 0 '+Math.min( width + margin.left + margin.right,height + margin.top + margin.bottom)+' '+Math.min(width + margin.left + margin.right,height + margin.top + margin.bottom))
    .attr('preserveAspectRatio','xMinYMin')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", pausePlay);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

 var gBorder = svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "none")
    .style("stroke", "#708090")

var xScale = d3.scaleLinear()
    .domain([0, 20000000]) //Max import value derived from data cleaning - 17254772.0
    .range([0, width])

var yScale = d3.scaleLinear()
    .domain([0, 20000000]) //Max export value derived from data cleaning - 19636632.0
    .range([height , 0])

var zScale = d3.scaleLinear() //Scale for radius of circles
    .domain([0,40000000])
    .range([0, 65 *div_width/intended_width])

var regions = ['Europe', 'Asia', 'Americas', 'Oceania', 'Others']
var colorPalette = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']
var colorScale = d3.scaleOrdinal(d3.schemePastel2)
    .domain(regions)
    .range(colorPalette)

// X Axis
var xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + margin.left + "," + (height+margin.top)+ ")") 
    .style("font-size", 12 * div_width/intended_width)
var xAxisCall = d3.axisBottom(xScale)
    .ticks(5).tickFormat(function (d) {
    // Divide ticks by 1000 and format with comma
    // To give ticks in millions
        return d3.format(",")(d/1000)
    })
xAxisGroup.call(xAxisCall)
xAxisGroup.selectAll("path").style("stroke", "#708090");
xAxisGroup.selectAll("line").style("stroke", "#708090");

// Y Axis
var yAxisGroup = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("font-size", 12 * div_width/intended_width)
var yAxisCall = d3.axisLeft(yScale)
    .ticks(5).tickFormat(function (d) {
        // Divide ticks by 1000 and format with comma
        // To give ticks in millions
        return d3.format(",")(d/1000)
    })

yAxisGroup.call(yAxisCall)
yAxisGroup.selectAll("path").style("stroke", "#708090");
yAxisGroup.selectAll("line").style("stroke", "#708090");

// x Axis Labels
g.append("text")
    .attr("y", height + 2*margin.top)
    .attr("x", (width + margin.right + margin.left)/2)
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-weight", "bold")
    .style("fill", "#333333")
    .style("font-size", 16 * div_width/intended_width)
    .text("Merchandise Imports (SGD, millions)")

// y Axis Labels
g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left/3)
    .attr("x", -(height+margin.top)/2)
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-weight", "bold")
    .style("fill", "#333333")
    .style("font-size", 16 * div_width/intended_width)
    .text("Merchandise Exports (SGD, millions)")

// Net exporter label
g.append("text")
    .attr("y", height/3)
    .attr("x", width/3)
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", 32 * div_width/intended_width)
    .style("fill", "#d3d3d3")
    .text("Net Exporter")

// Net Importer label
g.append("text")
    .attr("y", height - height/3)
    .attr("x", width - width/3)
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
    .style("text-anchor", "middle")
    .style("font-family", "Arial")
    .style("font-size", 32 * div_width/intended_width)
    .style("fill", "#d3d3d3")
    .text("Net Importer")

// 45 degree line separating net exporters / net importers
var xyLine = g.append("line")
    .attr("x1", 0)
    .attr("y1", height )
    .attr("x2", width -20)
    .attr("y2", 20)
    .attr("stroke-width", 1)
    .attr("stroke", "#708090")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Prepare legend 
var legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + 0.5*margin.left+ "," + (height + margin.top + 0.4*margin.bottom) +")")

for (i=0; i < 4; i++) {

    legend.append("circle")
        .attr("cx", (i+1)*width*0.8/4 )
        .attr("cy", 10 )
        .attr("r", 20/4 * div_width/intended_width)
        .attr("fill", colorPalette[i])
    legend.append("text")
        .attr("x", (i+1)*width*0.8/4 + 20/4* div_width/intended_width + width*0.01)
        .attr("y", 10+ 20/4 * div_width/intended_width)
        .attr("fill", colorPalette[i])
        .style("font-family", "Arial")
        .style("font-size", 16 * div_width/intended_width)
        .text(regions[i])

}

var time = 0;
var play = true;

d3.json("./merch_trade_data.json", function(data) {

    console.log(data)
    i = 171
    var circles = g.selectAll("circle").data(data[i].countries).enter()
        .append("circle")
        .attr("class", "circleData")
        .attr("r", function(d) { return zScale(d.total)})
        .attr("cx", function(d) { return xScale(+d.import + 1)} )
        .attr("cy", function(d) { return yScale(+d.export + 1)})
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("fill", function(d) { return colorScale(d.region); })
        .attr("stroke", "#333333")
        .attr("stroke-width", "0.8")
        .on("mouseover", mouseoverEvent)
        .on("mouseout", mouseoutEvent)

    var quarter_label = g.append("text")
            .attr("id", "quarter_label")
            .style("font-family", "Arial")
            .attr("font-size", 35 * div_width/intended_width)
            .attr("fill", "#333333")
            .attr("x", width - 2*margin.left)
            .attr("y", height)
            .text(data[i].quarter)


    var interval = setInterval(function(){
        if (play === true) {
            update(time, data)  
            quarter_label.text(data[time].quarter)      
            time = (time < 171) ? +time + 1     : 0 
        }
        

    }, 100);

    //rangeSlider function
    d3.select("#rangeSlider").on("input", function() {
        //Always pause when slider is touched
        play = false;
        document.getElementById("play").innerHTML = "Play"
        time = this.value;
        update(time, data);
        quarter_label.text(data[time].quarter)
    })

})

function update(i, data) {
    var circles = g.selectAll(".circleData").data(data[i].countries)

    circles.exit().remove()
    circles.enter().append("circle")
        .attr("class", "circleData")
    .merge(circles)
    .transition()
        .attr("r", function(d) { return zScale(d.total)})
        .attr("cx", function(d) { return xScale(+d.import + 1)} )
        .attr("cy", function(d) { return yScale(+d.export + 1)})
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("fill", function(d) { return colorScale(d.region); })
    
    circles.on("mouseover", mouseoverEvent)
        .on("mouseout", mouseoutEvent)

    document.getElementById("rangeSlider").value=i

    // If  mouseover data is shown, update data on mouseover during animation
    pointLabel = document.getElementsByClassName("pointLabel")
    if (pointLabel.length != 0) {
        hoverCountry = pointLabel[0].innerHTML
        hoverCountryData = data[i].countries.filter(function(d) {
            return d.country == hoverCountry
        })

        //Update total trade, import and export data of hovered over country
        d3.selectAll(".pointLabelData").text(
                "Total Trade: $" + 
                d3.format(".3n")(hoverCountryData[0].total/1000000) + "bn  |  " + 
                "Import: $" + d3.format(".3n")(hoverCountryData[0].import/1000000) + "bn  |  " + 
                "Export: $" + d3.format(".3n")(hoverCountryData[0].export/1000000) + "bn" 
        )
    }
}

function mouseoverEvent(d) {

    d3.select(this)
        .style("fill", d3.rgb(this.getAttribute("fill")).brighter())
        .style("stroke", "#d3d3d3")
    text_x = xScale(+d.import +1)
    text_y = yScale(+d.export + 1)

    // Country Text
    g.append("text")
        .attr("class", "pointLabel")
        .attr("x", 0 )
        .attr("y", 0 )
        .style("font-family", "Arial")
        .style("fill", "#333333")
        .style("font-size", 32 * div_width/intended_width)
        .text(d.country)
        .attr("transform", "translate(" + (margin.left + 20 * div_width/intended_width) + ",0)")

    // Total Trade Text
    g.append("text")
        .attr("class", "pointLabelData")
        .attr("x", 0 )
        .attr("y", 25 *     div_width/intended_width )
        .style("font-family", "Arial")
        .style("fill", "#333333")
        .style("font-size", 16 * div_width/intended_width)
        .text(
            "Total Trade: $" + d3.format(".3n")(d.total/1000000) + "bn  |  " + 
            "Import: $" + d3.format(".3n")(d.import/1000000) + "bn  |  " + 
            "Export: $" + d3.format(".3n")(d.export/1000000) + "bn" 
        )
        .attr("transform", "translate(" + (margin.left+20 * div_width/intended_width) + ",0)")
}

function mouseoutEvent(d) {

    d3.select(this)
        .style("fill", function(d) { return colorScale(d.region); })
        .style("stroke", "black")
    d3.selectAll(".pointLabel").remove()
    d3.selectAll(".pointLabelData").remove()
}

function reset() {
    time = 0;
    if (play == false) {
        play = true;
    }
}

function pausePlay() {

    if (play ==true ) {
        document.getElementById("play").innerHTML = "Play"
    } else {
        document.getElementById("play").innerHTML = "Pause"
    }
    play = !play;
}
