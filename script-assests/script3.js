var fileArray = ['csv/co2_emissions_per_capita.csv', 'csv/coal_consumption.csv', 'csv/coal_production.csv', 'csv/petroleum_production.csv', 'csv/petroleum_consumption.csv', 'csv/renewable_electricity_consumption.csv', 'csv/renewable_electricity_generation.csv', 'csv/total_electricity_consumption.csv', 'csv/total_electricity_generation.csv', 'csv/total_primary_energy_consumption.csv', 'csv/total_primary_energy_production.csv', 'csv/renewable_biofuel_consumption.csv', 'csv/renewable_biofuel_production.csv'];


var fileNames = [];

for (var i = 0; i < fileArray.length; i++) {

    fileNames.push(fileArray[i].slice(4, -4));

}


var allResults = [];
var listOfCountries = [];
var fileCount = 1;
var allEnergy = [];
var groupEnergy = [];
var tempObj = {};
var tempObj2 = [];
var yearValues = [];
var total_objects = [];
var jcount = 0;
var count;
var fileCounter = 0;
var secondListOfCountries = [];


for (var fileIndex = 0; fileIndex < fileArray.length; fileIndex++) {
    fileCounter++;
    Papa.parse(fileArray[fileIndex], {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: function(result) {
                //push file result into allResults array
                allResults.push(result);
                //if length is 13
                if (allResults.length == fileArray.length) {
                    for (var j = 0; j < allResults.length; j++) {
                        for (var row = 0; row < allResults[j].data.length; row++) {
                            //records file data every iteration it holds the first row data.
                            var record = allResults[j].data[row];
                            if (j === 0) {
                                //console.log("jcount",jcount);
                                jcount++;
                                listOfCountries.push(record.Locality);
                                var countryObj = {};
                                countryObj.name = record.Locality;
                                tempObj = countryObj;
                                total_objects.push(tempObj);
                            } //end of j==0
                            else {
                                for (var k = 0; k < total_objects.length; k++) {
                                    if (record.Locality === total_objects[k].name) {
                                        tempObj = total_objects[k];
                                    }
                                }
                            } // end of else

                            for (var year = 1980; year < 2012; year++) {
                                var value = record[year];
                                // deal with missing data points
                                if (value === '--') {
                                    value = 0;
                                } else if (value === 'NA') {
                                    value = 0;
                                } else if (value === '(s)') {
                                    value = 0;
                                } else if (value === 'W') {
                                    value = 0;
                                } else if (value === undefined) {
                                    value = 0;
                                }
                                yearValues.push(value);
                            } // end of year loop
                            tempObj[fileArray[j].slice(4, -4)] = yearValues;
                            yearValues = [];
                        } // end of row loop
                    } // end of j loop

                    /********************************************************
                      //all d3 code goes here & works inside the if statement
                    *********************************************************/

                        //sorting list of countries and filenames
                        listOfCountries.sort();
                        fileNames.sort();

                        //function to populate all countryDropDowns
                        var countryDropDowns = function(countryId) {
                            //populate countries into select box
                            d3.select(countryId).selectAll('option').data(listOfCountries).enter().append('option').html(function(d) {
                                return d;
                            }).attr('value', function(d) {
                                return d;
                            });
                        }; //end of function

                        //multiselect populate code
                        countryDropDowns('#multiSelectCountry');

                        //function to populate enegrgy drop downs
                        var energyDropDowns = function(enerygyId) {
                            //populate energy types into select box
                            d3.select(enerygyId).selectAll('option').data(fileNames).enter().append('option').html(function(d) {
                                return d;
                            }).attr('value', function(d) {
                                return d;
                            });
                        }; //end of function

                        energyDropDowns('#multiSelectEnergy');

                        var multiSelectArray = [];
                        multiSelectArray.push(listOfCountries[0]);

                        var selectedEnergy = fileNames[0];

                        $('#multiSelectEnergy').multiselect({
                          enableCaseInsensitiveFiltering: true,
                          maxHeight: 250,
                          onChange: function(option,selected){
                            if(selected === true){
                              selectedEnergy = $(option).val();
                              drawMultiSelectBarCharts(multiSelectArray,selectedEnergy);
                            }
                          }
                        });

                        $('#multiSelectCountry').attr('multiple', 'multiple');
                        $('#multiSelectCountry').multiselect({
                            enableCaseInsensitiveFiltering: true,
                            includeSelectAllOption: true,
                            maxHeight: 250,
                            onChange: function(option, checked) {
                                if (checked === true) {
                                    multiSelectArray.push($(option).val());
                                    console.log(multiSelectArray, selectedEnergy);
                                    drawMultiSelectBarCharts(multiSelectArray, selectedEnergy);
                                } else {
                                    var index = multiSelectArray.indexOf($(option).val());
                                    multiSelectArray.splice(index, 1);
                                    console.log(multiSelectArray, selectedEnergy);
                                    drawMultiSelectBarCharts(multiSelectArray, selectedEnergy);
                                }
                            }
                        });


                        //configurations
                        var mulEnergyValuesCombineArr = [];
                        var mulEnergyValuesCombineObj = {};
                        var onlyMulValues = [];

                        var sampleMultiArray = ["Afghanistan", "Africa"];
                        var mulEnergyName = fileNames[0];

                                                /**
                                                 * creating a units object
                                                 */

                                                var units = {
                                                    co2_emissions_per_capita: "in metric tons per capita",
                                                    coal_consumption: "in million short tons",
                                                    coal_production: "in million short tons",
                                                    petroleum_consumption: 'in thousand barrels per day',
                                                    petroleum_production: 'in thousand barrels per day',
                                                    renewable_biofuel_consumption: 'in thousand barrels per day',
                                                    renewable_biofuel_production: 'in thousand barrels per day',
                                                    renewable_electricity_consumption: 'in billion Kilowatt-hours',
                                                    renewable_electricity_generation: 'in billion Kilowatt-hours',
                                                    total_electricity_consumption: 'in billion Kilowatt-hours',
                                                    total_electricity_generation: 'in billion Kilowatt-hours',
                                                    total_primary_energy_consumption: 'in quadrillion BTU',
                                                    total_primary_energy_production: 'in quadrillion BTU'
                                                };

                                                /**
                                                 * end of units object
                                                 */

                        /********************************************
                          multiselectbarchart example starts here
                        ***********************************************/
                        function drawMultiSelectBarCharts(multipleCountryName, mulEnergyName) {
                            //clear contents of the chart
                            d3.select('#mainSelectMultiple').selectAll('g').remove();
                            for (var j = 0; j < multipleCountryName.length; j++) {
                                var yearProp = 1980;
                                var count = 0;

                                for (var i = 0; i < total_objects.length; i++) {
                                    if (multipleCountryName[j] == total_objects[i].name) {
                                        var mulEnergyValues = total_objects[i][mulEnergyName];
                                        for (var allValue = 0; allValue < mulEnergyValues.length; allValue++) {
                                            onlyMulValues.push(mulEnergyValues[allValue]);
                                        }
                                        while (yearProp !== 2012 && count !== 33) {
                                            //add name property
                                            mulEnergyValuesCombineObj.name = multipleCountryName[j];
                                            //add year property
                                            mulEnergyValuesCombineObj.year = yearProp;
                                            //add value property
                                            mulEnergyValuesCombineObj.engValue = mulEnergyValues[count];
                                            mulEnergyValuesCombineArr.push(mulEnergyValuesCombineObj);
                                            yearProp++;
                                            count++;
                                            mulEnergyValuesCombineObj = {};
                                        }
                                    } //end if
                                } // total_objects for end
                            } // multipleCountryName for end

                            var svg = d3.select("#mainSelectMultiple");
                            var margin = {
                                top: 20,
                                right: 100,
                                bottom: 30,
                                left: 100
                            };
                            var width = svg.attr("width") - margin.left - margin.right;
                            var height = svg.attr("height") - margin.top - margin.bottom;
                            var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                            var barPadding = 0.2;
                            var xColumn = "year";
                            var yColumn = "engValue";
                            var colorColumn = "name";
                            var layerColumn = colorColumn;
                            var xAxisLabelText = "Years";
                            var yAxisLabelText = "Energy Values";
                            var xScale = d3.scale.ordinal().rangeBands([0, width], barPadding);
                            var yScale = d3.scale.linear().domain([0, d3.max(onlyMulValues)]).range([height, 0]);
                            var colorScale = d3.scale.category10();

                            //capitalize every name
                            var newEneryName = mulEnergyName.split('_');
                            for (var index = 0; index < newEneryName.length; index++) {
                                var firstLetter = newEneryName[index].slice(0, 1).toUpperCase();
                                var otherLetters = newEneryName[index].slice(1).toLowerCase();
                                newEneryName[index] = firstLetter + otherLetters;
                            }
                            var energyName1 = newEneryName.join(" ");

                            // d3.select("#labelMultipleSelect")
                            //     .html(multipleCountryName[0] + "'s VS " + multipleCountryName[1] + "'s  " + energyName1 + " " + "( " + units[mulEnergyName] + " )");

                            // add the tooltip area to the webpage
                            var tooltip = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

                            var xAxis = d3.svg.axis()
                                .scale(xScale)
                                .orient('bottom');

                            var yAxis = d3.svg.axis()
                                .scale(yScale)
                                .orient('left')
                                .tickFormat(d3.format('.2s'));

                            var colorLegend = d3.legend.color();

                            colorLegend.scale(colorScale)
                                .shapePadding(2)
                                .shapeWidth(14)
                                .shapeHeight(14)
                                .labelOffset(4);

                            var xAxisG = g.append("g")
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + height + ')');

                            var yAxisG = g.append("g")
                                .attr('class', 'y axis');

                            //appending color lengend
                            var colorLegendG = g.append("g")
                                .attr("class", "color-legend")
                                .attr("transform", "translate(840,0)");

                            //adding labels
                            g.append("g")
                                .append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 2)
                                .attr("dy", ".71em")
                                .style("text-anchor", "end")
                                .style('font-size', "9px")
                                .text("Energy Values ");

                            g.append("g")
                                .append("text")
                                .attr("transform", "rotate(0)")
                                .attr("x", 840)
                                .attr("y", 245)
                                .attr("dx", ".71em")
                                .style("text-anchor", "end")
                                .style('font-size', "9px")
                                .text("Years");
                            //end of adding labels

                            //render function begins
                            function render(data) {
                                var nested = d3.nest()
                                    .key(function(d) {
                                        return d[colorColumn];
                                    })
                                    .entries(data);
                                var stack = d3.layout.stack()
                                    .y(function(d) {
                                        return d[yColumn];
                                    })
                                    .values(function(d) {
                                        return d.values;
                                    });
                                var layers = stack(nested);
                                xScale.domain(layers[0].values.map(function(d) {
                                    return d[xColumn];
                                }));
                                colorScale.domain(layers.map(function(layer) {
                                    return layer.key;
                                }));
                                xAxisG.call(xAxis).selectAll('text')
                                .attr("y",0)
                                .attr("x",-7)
                                .attr("dy",".35em")
                                .attr('transform','rotate(-90)')
                                .style("text-anchor","end");

                                yAxisG.call(yAxis);

                                var layers = g.selectAll(".layer").data(layers);
                                layers.enter().append("g").attr("class", "layer");
                                layers.exit().remove();
                                layers.style("fill", function(d) {
                                    return colorScale(d.key);
                                });

                                var bars = layers.selectAll("rect").data(function(d) {
                                    return d.values;
                                });
                                var barWidth = xScale.rangeBand() / colorScale.domain().length;
                                bars.enter().append("rect");
                                bars.exit().remove();
                                bars.attr("x", function(d, i, j) {
                                        return xScale(d[xColumn]) + barWidth * j;
                                    })
                                    .attr("y", function(d) {
                                        return yScale(d.y);
                                    })
                                    .attr("width", barWidth)
                                    .attr("height", function(d) {
                                        return height - yScale(d.y);
                                    })
                                    .on('mouseover', function(d, i) {
                                        d3.select(this)
                                            .style('opacity', 0.5);
                                        tooltip.style('opacity', 0.9);
                                        tooltip.html("(" + d[xColumn] + " , " + d.y + ")")
                                            .style('left', (d3.event.pageX + 5) + "px")
                                            .style('top', (d3.event.pageY - 28) + "px");
                                    }).on('mouseout', function(d) {
                                        d3.select(this)
                                            .style('opacity', 1);
                                        tooltip.style('opacity', 0);
                                    });

                                colorLegendG.call(colorLegend);
                                emptyArray(mulEnergyValuesCombineArr);
                                emptyArray(onlyMulValues);

                            } //end of render
                            render(mulEnergyValuesCombineArr);

                        } //end of mul function

function emptyArray(array){
  return array.length = 0;
}
                        /********************************************
                          multiselectbarchart example ends here
                        ***********************************************/
                        /*********d3 code ends here****************/

                    } //end of main if

                    } // end of complete

                  }); //end of papa parser

                  } // end of main for
