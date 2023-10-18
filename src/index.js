import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

let launchpads;
let launches;
let svg;

async function setup(){
    const spaceX = new SpaceX();
    launchpads = await spaceX.launchpads();
    launches = await spaceX.launches();

    const listContainer = document.getElementById("listContainer");
    renderLaunches(launches, listContainer);
    drawMap();
    padsHighlighter();
}

function padsHighlighter()
{
    const list = document.getElementById("listContainer").getElementsByTagName('li');
    let label = document.getElementsByTagName('label')[0];

    for (let i = 0; i < list.length; i++)
    {
        list[i].onmouseover = function(){
            label.style.display = 'block';
            label.innerHTML = list[i].textContent;
            showPad(list[i].textContent);
        }

        list[i].onmouseout = function(){
            label.style.display = 'none';
            hidePad(list[i].textContent);
        }
    }
}

function showPad(launchName){    
    let launchpadID = '';
    launches.forEach(launch=>{
        if (launch.name == launchName)
            launchpadID = launch.launchpad;
    })
    svg.selectAll('.pads')
    .filter(function(d) {return d.id === launchpadID})
    .raise()
    .select('circle')
    .attr('r', 8)
    .attr('fill', 'red');
}

function hidePad(launchName){
    let launchpadID = '';
    launches.forEach(launch=>{
        if (launch.name == launchName)
            launchpadID = launch.launchpad;
    })
    svg.selectAll('.pads circle')
    .filter(function(d) {return d.id === launchpadID})
    .attr('r', 4)
    .attr('fill', 'blue')
}

function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

async function  drawMap() {
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // .attr("fill", function (d) {
        //     return colorScale(0);
        // })
        .style("opacity", .7);

    // const path = d3.geoPath()
    //     .projection(projection);

    let points = svg.selectAll('.pads')
        .data(launchpads);

    let pointsEnter = points
        .enter()
        .append('g')
        .attr('class', 'pads');

    pointsEnter
        .attr("id", function(d){
            return d.id;
        })
        .append('circle')
        .attr("r", 4)
        .attr("fill", "blue")
        .attr("transform", function(d){
            return "translate(" + projection([
                d.longitude,
                d.latitude
                ]) + ")";
        });
}
