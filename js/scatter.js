let scatterData = {};
let scatterSpeciesList = null;
let scatterX = null;
let scatterY = null;

axios.get('../data/cont_var.json').then((response) => {
    scatterData = response.data;

    // Populate selection list
    let species = document.getElementById('ScatterSpecies');
    Object.keys(scatterData.species).sort().forEach( (val) => {
        let newOption = new Option(val, val);
        species.add(newOption,undefined);
    });

    let x = document.getElementById('ScatterX');
    let y = document.getElementById('ScatterY');
    scatterData.variables.forEach( (val) => {
        let newOption = new Option(val, val);
        x.add(newOption,undefined);
        newOption = new Option(val, val);
        y.add(newOption,undefined);
    });

    scatterSpeciesList = new SlimSelect({
        select: '#ScatterSpecies'
    });

    scatterX = new SlimSelect({
        select: '#ScatterX'
    });

    scatterY = new SlimSelect({
        select: '#ScatterY'
    });

    // Needs a little delay
    setTimeout(() => {
        scatterSpeciesList.set(['aardvark']);
        scatterY.set(['Distance to Confluence  m ']);
        scatterX.set(['Lion Risk  Dry ']);
        species.addEventListener('change', scatterPlot);
        x.addEventListener('change', scatterPlot);
        y.addEventListener('change', scatterPlot);
        scatterPlot();
    }, 500);
});


function linearRegression(x,y){
/* 
 * This code is based on:
 * https://github.com/plotly/plotly.js/issues/4921
 * https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
 */
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    } 

    lr['sl'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['off'] = (sum_y - lr.sl * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

    return lr;
}


// Update graph when selections changes
const scatterPlot = () => {
    let d3_category10 = [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ];
    let sData = [];
    let rData = [];
    let selected = scatterSpeciesList.selected();
    let var_x = scatterX.selected();
    let var_y = scatterY.selected();

    if(selected.length > 0) {
        selected.forEach( (species, index) => {
            color = d3_category10[index % d3_category10.length];
            let plotd = {
                x: scatterData.species[species][var_x],
                y: scatterData.species[species][var_y],
                name: species,
                mode: 'markers',
                type: 'scatter',
                marker: {
                    color: color
                }
            };
            sData.push(plotd);

            /* 
            * This code is based on:
            * https://github.com/plotly/plotly.js/issues/4921
            */
            let lr = linearRegression(scatterData.species[species][var_x], scatterData.species[species][var_y]);
            let fit_from = Math.min(...scatterData.species[species][var_x]);
            let fit_to = Math.max(...scatterData.species[species][var_x]);

            let regLine = {
                x: [fit_from, fit_to],
                y: [fit_from*lr.sl+lr.off, fit_to*lr.sl+lr.off],
                mode: 'lines',
                type: 'scatter',
                name: species,
                marker: {
                    color: color
                }
            };
            rData.push(regLine);
        });

        

    }
    Plotly.newPlot('ScatterPlot', sData.concat(rData), {yaxis: {title: var_y}, xaxis: {title: var_x}}, {responsive: true});
}